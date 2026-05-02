# GHG-FuseNet: Environmental Intelligence Platform 🌍

**GHG-FuseNet** is a full-stack, proactive environmental monitoring platform. It fuses real-time weather metrics, satellite fire data (NASA FIRMS), and predictive AI models to deliver actionable insights into greenhouse gas emissions, air quality, and impending disaster risks. 

Beyond simply displaying data, the platform features a secure authentication system and an automated alerting engine that proactively notifies users via email when hazardous environmental conditions are detected in their registered "Home Base."

---

## ✨ Key Features

*   **AI-Powered Predictive Modeling**: Uses Scikit-Learn Machine Learning models (`RandomForestRegressor`, `DecisionTreeRegressor`) to predict real-time $CO_2$ and $NO_2$ levels based on environmental factors.
*   **Live Air Quality Index (AQI)**: Integrates with the Open-Meteo Air Quality API to fetch accurate, localized US AQI values.
*   **NASA FIRMS Integration**: Tracks active thermal anomalies and fire data, plotting potential wildfire threats on the interactive map.
*   **Disaster Intelligence Engine**: Dynamically analyzes threshold data to warn against heatwaves, storms, droughts, and severe smog events.
*   **Automated Background Alerting**: An `APScheduler` runs background tasks on the FastAPI server, analyzing the environment around registered users' locations and dispatching real-time email warnings via SMTP when thresholds are breached.
*   **Secure Authentication**: Full JWT-based login and registration system with Bcrypt password hashing, utilizing a persistent SQLite database.
*   **Interactive Geolocation**: Search for global coordinates or use browser GPS to jump to your exact location on a dynamic Leaflet map. Reverse-geocoding automatically displays the selected city/region.
*   **Emergency Infrastructure Mapping**: Utilizes the Overpass API to locate and map nearby hospitals and schools that may be affected during an environmental emergency.

---

## 🛠️ Technology Stack

### Frontend (User Interface)
*   **React.js**: Dynamic component-based UI.
*   **Tailwind CSS**: Premium, custom-utility styling with a clean, light-theme "glassmorphism" aesthetic.
*   **React Leaflet & GeoSearch**: Interactive mapping and location routing.
*   **Lucide React**: Modern iconography.
*   **Axios**: API communication.

### Backend (API & Engine)
*   **FastAPI**: High-performance Python backend server.
*   **SQLAlchemy**: ORM for managing SQLite (`ghg_fusenet.db`) user records and alert preferences.
*   **Scikit-Learn & Pandas**: Machine learning and data manipulation.
*   **APScheduler**: Hourly background cron-jobs for the active alerting engine.
*   **Passlib & Python-Jose**: Cryptography and JWT token generation.
*   **Requests**: Connecting to external APIs (Open-Meteo, Overpass, Nominatim).

---

## 🚀 Getting Started

We have included a streamlined shell script that handles dependency management, virtual environment creation, and concurrent execution of both the backend and frontend.

### Prerequisites
*   Node.js (v16+)
*   Python (3.9+)

### Installation & Execution

1.  **Clone the repository and navigate to the project root:**
    ```bash
    cd GHG_Fusenet
    ```

2.  **Start the platform:**
    Run the unified start script. This script will automatically create a Python virtual environment, install backend requirements, start the FastAPI server, and then spin up the React frontend.
    ```bash
    ./start.sh
    ```

3.  **Access the Application:**
    *   **Frontend Dashboard:** `http://localhost:3000`
    *   **Backend API Docs (Swagger UI):** `http://localhost:8000/docs`

*To cleanly shut down both servers, simply press `Ctrl+C` in the terminal running the script.*

---

## ⚙️ Configuration & Environment Variables

For the automated email alerting system to send real emails to your users, you need to configure an SMTP sender. 

By default, the system will print "Mock Emails" to the terminal. To enable real dispatch, locate `email_service.py` in the backend and ensure valid Gmail credentials (specifically, an App Password) are set for `SENDER_EMAIL` and `SENDER_PASSWORD`. 

---

## 🧩 Architecture Notes
*   **Location Intelligence:** The system uses the `overpass.kumi.systems` mirror for reliable Overpass queries (schools/hospitals) to prevent timeout failures on dense urban centers. Search radii are optimized at 5km.
*   **Model Compatibility:** The serialized ML models (`model_co2.pkl`, `model_no2.pkl`) should be retrained periodically to ensure compatibility across minor Scikit-Learn version updates.
*   **CORS:** The backend is configured to explicitly whitelist `http://localhost:3000` and `http://localhost:8000` to prevent cross-origin fetch failures.
