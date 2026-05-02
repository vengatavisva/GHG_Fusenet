from sqlalchemy.orm import Session
from database import SessionLocal, User
from email_service import send_alert_email
import pandas as pd

# We need to import the prediction functions and models from ghg_api safely.
# To avoid circular imports, we will import them directly in the worker function.

def check_and_send_alerts():
    """
    Background worker function that runs periodically.
    Checks each user's location for environmental threats.
    """
    print("\n⏳ Starting background alert worker...")
    db: Session = SessionLocal()
    users = db.query(User).filter(User.alerts_enabled == True).all()
    
    if not users:
        print("No users with alerts enabled found.")
        db.close()
        return

    # Import functions from ghg_api
    try:
        from ghg_api import fetch_weather, get_fires_near, model_co2, model_no2, feature_order
    except ImportError as e:
        print(f"Error importing from ghg_api in worker: {e}")
        db.close()
        return

    for user in users:
        if user.lat is None or user.lon is None:
            continue

        try:
            print(f"Checking data for user {user.email} at ({user.lat}, {user.lon})...")
            weather, _ = fetch_weather(user.lat, user.lon)
            fire, _ = get_fires_near(user.lat, user.lon)
            
            features = {**fire, **weather}
            df_input = pd.DataFrame([features])[feature_order]
            co2 = model_co2.predict(df_input)[0]
            no2 = model_no2.predict(df_input)[0]

            # Determine threats
            threats = []
            if fire["fire_count"] > 1000 or fire["avg_frp"] > 10:
                threats.append("🔥 High Fire Risk: Elevated fire activity detected nearby.")
            if weather["temperature"] > 38:
                threats.append("🌡️ Heatwave Alert: Extremely high temperatures.")
            if weather["wind_speed"] > 25 and weather["pressure"] < 1000:
                threats.append("🌪️ Storm Warning: Strong winds and low pressure.")
            if co2 > 400 and no2 > 40:
                threats.append(f"🌫️ Smog Alert: CO₂ levels at {co2:.1f} ppm and NO₂ at {no2:.1f} ppb.")

            if threats:
                print(f"⚠️ Threats found for {user.email}. Sending alert...")
                subject = "⚠️ GHG-FuseNet Urgent Environment Alert"
                
                threat_html = "".join([f"<li>{t}</li>" for t in threats])
                
                html_message = f"""
                <html>
                  <body style="font-family: Arial, sans-serif; color: #333;">
                    <div style="background-color: #f8d7da; padding: 20px; border-radius: 8px; border: 1px solid #f5c6cb;">
                        <h2 style="color: #721c24;">Urgent Environment Alert</h2>
                        <p>We detected significant environmental threats near your saved location ({user.lat}, {user.lon}):</p>
                        <ul>
                            {threat_html}
                        </ul>
                        <p>Please take necessary precautions. Visit the <a href="http://localhost:3000">GHG-FuseNet Dashboard</a> for real-time data.</p>
                    </div>
                  </body>
                </html>
                """
                send_alert_email(user.email, subject, html_message)
            else:
                print(f"✅ User {user.email} is safe. No threats detected.")

        except Exception as e:
            print(f"Error processing user {user.email}: {e}")

    db.close()
    print("✅ Background alert worker finished.\n")
