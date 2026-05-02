from fastapi import FastAPI, Query, Depends, HTTPException, status
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
import joblib
import pandas as pd
import numpy as np
import requests
import folium
from folium.plugins import HeatMap
from apscheduler.schedulers.background import BackgroundScheduler
from contextlib import asynccontextmanager

from database import SessionLocal, User, engine
from auth import UserCreate, UserLogin, Token, create_access_token, get_password_hash, verify_password
from alert_worker import check_and_send_alerts

# Scheduler setup
scheduler = BackgroundScheduler()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Start the background alert worker to run every 1 hour
    scheduler.add_job(check_and_send_alerts, 'interval', hours=1)
    scheduler.start()
    print("✅ Background Alert Scheduler Started.")
    yield
    scheduler.shutdown()

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

import os

# --- Load models and fire data ---
try:
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    model_co2 = joblib.load(os.path.join(BASE_DIR, "model_co2.pkl"))
    model_no2 = joblib.load(os.path.join(BASE_DIR, "model_no2.pkl"))
    feature_order = joblib.load(os.path.join(BASE_DIR, "feature_order.pkl"))

    df_fires = pd.read_csv(os.path.join(BASE_DIR, "fire_archive_SV-C2_635121.csv"))
    df_fires = df_fires.dropna(subset=['latitude', 'longitude'])
    df_fires['confidence'] = pd.to_numeric(df_fires['confidence'], errors='coerce').fillna(60)
    df_fires = df_fires[
        (df_fires['latitude'] >= 5) & (df_fires['latitude'] <= 40) &
        (df_fires['longitude'] >= 60) & (df_fires['longitude'] <= 100)
    ].reset_index(drop=True)
except Exception as e:
    print("❌ Error loading model or data:", e)
    raise

class LocationInput(BaseModel):
    lat: float
    lon: float

def get_fires_near(lat, lon, radius_km=50):
    df_local = df_fires[
        (df_fires['latitude'] >= lat - 1) & (df_fires['latitude'] <= lat + 1) &
        (df_fires['longitude'] >= lon - 1) & (df_fires['longitude'] <= lon + 1)
    ].copy()
    R = 6371
    lat1, lon1 = np.radians(lat), np.radians(lon)
    lat2, lon2 = np.radians(df_local['latitude'].values), np.radians(df_local['longitude'].values)
    dlat, dlon = lat2 - lat1, lon2 - lon1
    a = np.sin(dlat/2)**2 + np.cos(lat1)*np.cos(lat2)*np.sin(dlon/2)**2
    c = 2 * np.arcsin(np.sqrt(a))
    df_local['distance'] = R * c
    df_nearby = df_local[df_local['distance'] <= radius_km]

    return {
        "fire_count": len(df_nearby),
        "avg_frp": df_nearby["frp"].mean() if not df_nearby.empty else 0,
        "max_frp": df_nearby["frp"].max() if not df_nearby.empty else 0,
        "avg_confidence": df_nearby["confidence"].mean() if not df_nearby.empty else 0,
        "avg_brightness": df_nearby["brightness"].mean() if not df_nearby.empty else 0,
    }, df_nearby

def fetch_weather(lat, lon):
    try:
        url = (
            f"https://api.open-meteo.com/v1/forecast"
            f"?latitude={lat}&longitude={lon}"
            f"&hourly=temperature_2m,relative_humidity_2m,pressure_msl,wind_speed_10m"
            f"&current_weather=true&timezone=auto"
        )
        r = requests.get(url).json()
        current = r.get("current_weather", {})
        hourly = r.get("hourly", {})
        
        # Fetch Real AQI
        aqi_url = f"https://air-quality-api.open-meteo.com/v1/air-quality?latitude={lat}&longitude={lon}&current=us_aqi"
        aqi_r = requests.get(aqi_url).json()
        real_aqi = aqi_r.get("current", {}).get("us_aqi", None)
        
        return {
            "temperature": current.get("temperature", 0),
            "wind_speed": current.get("windspeed", 0),
            "pressure": hourly.get("pressure_msl", [0])[0] if hourly.get("pressure_msl") else 1013,
            "humidity": hourly.get("relative_humidity_2m", [0])[0] if hourly.get("relative_humidity_2m") else 50,
            "aqi": real_aqi
        }, hourly
    except Exception as e:
        print(f"Weather API error: {e}")
        return {"temperature": 0, "wind_speed": 0, "pressure": 1013, "humidity": 50, "aqi": None}, {}

def get_nearby_places(lat, lon, radius_km=10, types=["school", "hospital"], max_results_per_type=5):
    overpass_url = "https://overpass.kumi.systems/api/interpreter"
    radius_m = radius_km * 1000
    type_queries = "".join([
        f"""
        node(around:{radius_m},{lat},{lon})["amenity"="{t}"];
        way(around:{radius_m},{lat},{lon})["amenity"="{t}"];
        relation(around:{radius_m},{lat},{lon})["amenity"="{t}"];
        """ for t in types
    ])
    query = f"""
    [out:json];
    (
        {type_queries}
    );
    out center;
    """

    headers = {"User-Agent": "ghg-alert-system"}
    try:
        response = requests.post(overpass_url, data=query, headers=headers, timeout=25)
        data = response.json()
    except Exception as e:
        print("❌ Overpass API error:", e)
        return []

    places_by_type = {t: [] for t in types}

    for element in data.get("elements", []):
        tags = element.get("tags", {})
        place_type = tags.get("amenity")
        if place_type not in types:
            continue

        name = tags.get("name", f"{place_type.title()}")

        if "lat" in element:
            elat, elon = element["lat"], element["lon"]
        elif "center" in element:
            elat, elon = element["center"]["lat"], element["center"]["lon"]
        else:
            continue

        distance = np.sqrt((lat - elat)**2 + (lon - elon)**2) * 111
        places_by_type[place_type].append({
            "name": name,
            "type": place_type,
            "lat": elat,
            "lon": elon,
            "distance_km": round(distance, 2)
        })

    results = []
    for t in types:
        sorted_places = sorted(places_by_type[t], key=lambda x: x["distance_km"])
        results.extend(sorted_places[:max_results_per_type])

    return results

def generate_disaster_map(lat, lon, fire_points, nearby_places=[]):
    m = folium.Map(location=[lat, lon], zoom_start=8)
    folium.Marker([lat, lon], tooltip="User Location", icon=folium.Icon(color='blue')).add_to(m)
    heat_data = [[row['latitude'], row['longitude']] for _, row in fire_points.iterrows()]
    HeatMap(heat_data, radius=15, blur=20, gradient={0.4: 'blue', 0.65: 'lime', 1: 'red'}).add_to(m)
    for place in nearby_places:
        folium.Marker(
            [place['lat'], place['lon']],
            tooltip=f"{place['type'].title()}: {place['name']}",
            icon=folium.Icon(color="red", icon="info-sign")
        ).add_to(m)
    map_path = "ghg_alert_map.html"
    m.save(map_path)
    return map_path

def simulate_notifications(disaster_risks):
    print("\n📢 Simulated Alert Notification:")
    for name, risk in disaster_risks.items():
        if risk['status'] != "Safe":
            print(f"Sending ALERT email/SMS for {name.upper()}: {risk['status']} - {risk['reason']}")
        else:
            print(f"{name.upper()} is safe. No alert sent.")

@app.get("/")
def home():
    return {"message": "🌍 GHG-FuseNet API is live!"}

def get_location_name(lat, lon):
    try:
        url = f"https://nominatim.openstreetmap.org/reverse?format=json&lat={lat}&lon={lon}&zoom=10"
        headers = {'User-Agent': 'GHGFuseNet-App/1.0'}
        r = requests.get(url, headers=headers, timeout=5).json()
        address = r.get("address", {})
        city = address.get("city") or address.get("town") or address.get("village") or address.get("county")
        state = address.get("state", "")
        country = address.get("country", "")
        
        parts = [p for p in [city, state, country] if p]
        if parts:
            return ", ".join(parts)
        return r.get("name") or f"{lat:.4f}, {lon:.4f}"
    except Exception:
        return f"{lat:.4f}, {lon:.4f}"

# --- Database Dependency ---
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Auth Routes ---
@app.post("/register")
def register_user(user: UserCreate, db: SessionLocal = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    new_user = User(
        email=user.email,
        hashed_password=hashed_password,
        lat=user.lat,
        lon=user.lon,
        alerts_enabled=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    access_token = create_access_token(
        data={"sub": new_user.email, "id": new_user.id}
    )
    return {"access_token": access_token, "token_type": "bearer", "user": {"email": new_user.email, "lat": new_user.lat, "lon": new_user.lon}}

@app.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: SessionLocal = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(
        data={"sub": user.email, "id": user.id}
    )
    return {"access_token": access_token, "token_type": "bearer", "user": {"email": user.email, "lat": user.lat, "lon": user.lon}}



@app.post("/predict/")
def predict(data: LocationInput, hours: int = Query(24, ge=1, le=72)):
    weather, forecast_hourly = fetch_weather(data.lat, data.lon)
    real_aqi = weather.pop("aqi", None) # Remove AQI from weather dict so it doesn't break ML model input
    
    fire, fire_points = get_fires_near(data.lat, data.lon)
    features = {**fire, **weather}
    df_input = pd.DataFrame([features])[feature_order]
    co2 = model_co2.predict(df_input)[0]
    no2 = model_no2.predict(df_input)[0]

    disaster_risks = {
        "fire_risk": {"status": "Safe", "reason": "No active fire hazards nearby."},
        "heatwave": {"status": "Safe", "reason": "Temperature levels are within a normal range."},
        "storm_warning": {"status": "Safe", "reason": "Wind speed and atmospheric pressure are stable."},
        "drought_alert": {"status": "Safe", "reason": "No signs of drought; humidity is sufficient."},
        "smog_alert": {"status": "Safe", "reason": "Air quality is currently acceptable."},
    }

    if fire["fire_count"] > 1000 or fire["avg_frp"] > 10:
        disaster_risks["fire_risk"] = {
            "status": "Alert",
            "reason": "🔥 Fire activity is high due to elevated fire counts and energy release (FRP)."
        }
    elif fire["fire_count"] > 300:
        disaster_risks["fire_risk"] = {
            "status": "Caution",
            "reason": "⚠ Moderate fire activity nearby. Stay cautious."
        }

    if weather["temperature"] > 38:
        disaster_risks["heatwave"] = {
            "status": "Alert",
            "reason": "🌡 Extremely high temperatures indicate a heatwave risk."
        }
    if weather["wind_speed"] > 25 and weather["pressure"] < 1000:
        disaster_risks["storm_warning"] = {
            "status": "Alert",
            "reason": "🌪 Strong winds and low pressure could signal storm conditions."
        }
    if weather["humidity"] < 20 and fire["fire_count"] > 200:
        disaster_risks["drought_alert"] = {
            "status": "Alert",
            "reason": "🚱 Low humidity and high fire activity suggest possible drought conditions."
        }
    if co2 > 400 and no2 > 40:
        disaster_risks["smog_alert"] = {
            "status": "Alert",
            "reason": "🌫 Dangerous air quality from high CO₂ and NO₂. Smog alert issued."
        }

    simulate_notifications(disaster_risks)

    ghg_causes, ghg_effects, precautions = [], [], []
    
    # CO2 Insights
    if co2 > 450:
        ghg_causes.append(f"Severe CO₂ concentration ({co2:.1f} ppm) suggests dense traffic congestion or nearby heavy industrial combustion.")
        ghg_effects.append("Prolonged exposure can cause cognitive impairment, headaches, and exacerbate respiratory issues.")
        precautions.append("Limit outdoor strenuous activity and keep windows closed. Use HEPA air purifiers indoors.")
    elif co2 > 400:
        ghg_causes.append(f"Elevated CO₂ levels ({co2:.1f} ppm) are typical for urban centers with high vehicular volume.")
        ghg_effects.append("May contribute to poor indoor air quality if outdoor air is circulated without filtration.")
        precautions.append("Ensure HVAC systems use fresh, filtered air intake.")

    # NO2 Insights
    if no2 > 35:
        ghg_causes.append(f"High NO₂ levels ({no2:.1f} ppb) strongly indicate close proximity to heavy diesel traffic or power generation facilities.")
        ghg_effects.append("Acute exposure inflames the airway lining, severely increasing the risk of asthma attacks in vulnerable populations.")
        precautions.append("High-risk individuals (children, elderly, asthmatics) should wear N95/KN95 masks if going outside.")
    elif no2 > 20:
        ghg_causes.append("Moderate NO₂ levels detected, likely from localized traffic exhaust.")
        ghg_effects.append("Can cause mild irritation to the eyes, nose, and throat over extended periods.")
        precautions.append("Avoid exercising near busy roads or highways today.")

    # Fire Insights
    if fire["fire_count"] > 50:
        ghg_causes.append(f"Detected {fire['fire_count']} active thermal anomalies (fires) in the vicinity contributing to massive particulate matter pollution.")
        ghg_effects.append("Drastic reduction in visibility and severe degradation of local air quality due to woodsmoke.")
        precautions.append("Seal doors/windows, avoid outdoor activity entirely, and follow local emergency channels.")

    if not precautions:
        precautions.append("Air quality and environmental factors are currently optimal.")
        ghg_causes.append("No significant anomalies detected in current atmospheric data.")
        ghg_effects.append("Safe for all normal outdoor activities.")

    forecast = []
    if forecast_hourly:
        times = forecast_hourly.get("time", [])
        temp = forecast_hourly.get("temperature_2m", [])
        wind = forecast_hourly.get("wind_speed_10m", [])
        hum = forecast_hourly.get("relative_humidity_2m", [])
        pres = forecast_hourly.get("pressure_msl", [])
        limit = min(hours, len(times))
        batch_data = pd.DataFrame([{
            "temperature": temp[i],
            "wind_speed": wind[i],
            "pressure": pres[i],
            "humidity": hum[i],
            **fire
        } for i in range(limit)])[feature_order]
        pred_co2 = model_co2.predict(batch_data)
        pred_no2 = model_no2.predict(batch_data)
        forecast = [{
            "timestamp": times[i],
            "temperature": round(temp[i], 2),
            "co2": round(pred_co2[i], 2),
            "no2": round(pred_no2[i], 2)
        } for i in range(limit)]

    nearby_places = get_nearby_places(data.lat, data.lon, radius_km=5, max_results_per_type=8)
    grouped_places = {}
    for place in nearby_places:
        info = {
            "name": place["name"],
            "lat": place["lat"],
            "lon": place["lon"],
            "distance_km": place["distance_km"]
        }
        grouped_places.setdefault(place["type"], []).append(info)
    for t in grouped_places:
        grouped_places[t] = sorted(grouped_places[t], key=lambda x: x["distance_km"])

    map_path = generate_disaster_map(data.lat, data.lon, fire_points, nearby_places)
    location_name = get_location_name(data.lat, data.lon)

    return {
        "location": {"lat": data.lat, "lon": data.lon},
        "location_name": location_name,
        "weather": weather,
        "fire": fire,
        "co2": round(co2, 2),
        "no2": round(no2, 2),
        "aqi": real_aqi,
        "alerts": {
            "co2": "⚠ High" if co2 > 300 else "✅ Safe",
            "no2": "⚠ Hazardous" if no2 > 30 else "✅ Acceptable"
        },
        "ghg_causes": ghg_causes,
        "ghg_effects": ghg_effects,
        "precautions": precautions,
        "forecast": forecast,
        "disaster_risks": disaster_risks,
        "map_url": map_path,
        "affected_nearby_places": grouped_places
    }


#### QQQQ1111
