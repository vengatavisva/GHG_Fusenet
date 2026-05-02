import React, { useEffect } from 'react';

const About = () => {
  useEffect(() => {
    document.title = 'About | GHG-FuseNet';
  }, []);

  return (
    <section
      id="about"
      className="bg-gradient-to-b from-white via-gray-100 to-white text-gray-800 py-16 px-6 md:px-16 scroll-mt-20"
    >
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header */}
        <h2 className="text-3xl font-bold text-black-700 text-center">About GHG-FuseNet</h2>

        <p className="text-lg leading-relaxed text-gray-700 text-center max-w-3xl mx-auto">
          <strong>GHG-FuseNet</strong> is an innovative real-time environmental monitoring platform that predicts
          greenhouse gas levels using AI by fusing satellite imagery, NASA FIRMS fire data, and meteorological data.
        </p>

        {/* Feature Highlights */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white shadow-md p-6 rounded-xl border-l-4 border-green-500 hover:scale-105 transition">
            <h3 className="font-semibold text-lg text-green-700 mb-2">🌐 Satellite & Sensor Fusion</h3>
            <p className="text-sm text-gray-600">
              Combines NASA satellite imagery and real-time sensor input for accurate carbon emissions tracking and GHG forecasting.
            </p>
          </div>

          <div className="bg-white shadow-md p-6 rounded-xl border-l-4 border-blue-500 hover:scale-105 transition">
            <h3 className="font-semibold text-lg text-blue-700 mb-2">🧠 AI-Powered Predictions</h3>
            <p className="text-sm text-gray-600">
              Uses deep learning models to estimate CO₂ and NO₂ levels and generate air quality alerts for informed decision-making.
            </p>
          </div>

          <div className="bg-white shadow-md p-6 rounded-xl border-l-4 border-yellow-500 hover:scale-105 transition">
            <h3 className="font-semibold text-lg text-yellow-700 mb-2">📊 Interactive Visual Dashboard</h3>
            <p className="text-sm text-gray-600">
              Engaging visualizations including bar charts, maps, and alerts help track environmental trends in real-time.
            </p>
          </div>
        </div>

        {/* AI Model Architecture */}
        <div className="mt-16">
          <h3 className="text-2xl font-semibold text-center text-black-700 mb-4 flex items-center justify-center gap-2">
            Advanced AI Model Architecture
          </h3>
          <p className="text-center text-gray-600 max-w-4xl mx-auto">
            Our cutting-edge machine learning system integrates multi-source satellite data, real-time weather patterns, and temporal
            analysis to deliver precise greenhouse gas predictions with unprecedented accuracy.
          </p>

          <div className="grid md:grid-cols-3 gap-8 mt-8">
            {/* Model Architecture Card */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <h4 className="text-green-700 font-semibold mb-2 flex items-center gap-1">🗂️ Model Architecture</h4>
              <div className="bg-green-50 p-2 rounded-md mb-3">
                <p className="text-green-700 font-semibold">Random Forest Regressor</p>
                <p className="text-xs text-gray-600">Ensemble learning with superior accuracy</p>
              </div>
              <div className="text-sm text-gray-700 space-y-1 mt-2">
                <div className="flex justify-between border-b py-1">
                  <span>Estimators</span>
                  <span className="font-medium text-gray-800">100 Trees</span>
                </div>
                <div className="flex justify-between border-b py-1">
                  <span>Cross Validation</span>
                  <span className="font-medium text-gray-800">5-Fold</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Feature Importance</span>
                  <span className="font-medium text-gray-800">Enabled</span>
                </div>
              </div>
            </div>

            {/* Input Features Card */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <h4 className="text-green-700 font-semibold mb-2 flex items-center gap-1">🛰️ Input Features</h4>
              <div className="text-sm text-gray-700 space-y-2">
                <div>
                  <p className="font-medium text-gray-800">Satellite Data</p>
                  <ul className="list-disc ml-5 text-gray-600">
                    <li>Fire Count & FRP</li>
                    <li>Brightness & Confidence</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-gray-800">Weather Data</p>
                  <ul className="list-disc ml-5 text-gray-600">
                    <li>Temperature & Humidity</li>
                    <li>Wind Speed & Pressure</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-gray-800">Temporal Factors</p>
                  <ul className="list-disc ml-5 text-gray-600">
                    <li>Time of Day & Day of Year</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Performance Metrics Card */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <h4 className="text-green-700 font-semibold mb-2 flex items-center gap-1">📈 Performance Metrics</h4>
              <div className="text-sm text-gray-700 space-y-3">
                <div>
                  <p className="text-gray-600 mb-1">Prediction Accuracy</p>
                  <div className="flex items-center justify-between mb-1">
                    <span>CO₂ R²</span>
                    <span className="font-medium text-green-700">0.94</span>
                  </div>
                  <div className="w-full bg-green-100 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '94%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1 mt-2">
                    <span>NO₂ R²</span>
                    <span className="font-medium text-blue-700">0.89</span>
                  </div>
                  <div className="w-full bg-blue-100 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '89%' }}></div>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-gray-600 mb-1">Status Thresholds</p>
                  <div className="text-xs space-y-1 text-gray-600">
                    <p>CO₂ Warning: <span className="text-orange-600 font-medium">400 ppm</span></p>
                    <p>CO₂ Critical: <span className="text-red-600 font-medium">450 ppm</span></p>
                    <p>NO₂ Warning: <span className="text-orange-600 font-medium">40 ppb</span></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>


        {/* Suomi-NPP Satellite Section */}
        <div className="mt-16">
          <h3 className="text-2xl font-semibold text-center text-black-700 mb-4">Advanced Satellite Integration</h3>
          <p className="text-center text-gray-600 max-w-4xl mx-auto">
            Leveraging state-of-the-art satellite technology and NASA's Fire Information for Resource Management System to provide real-time,
            high-resolution environmental monitoring capabilities.
          </p>

          <div className="bg-white shadow-md rounded-xl p-6 mt-6 grid md:grid-cols-2 gap-6 items-center">
            <div>
              <h4 className="text-green-700 font-semibold text-lg mb-2">Suomi-NPP Satellite</h4>
              <p className="text-sm text-gray-600">
                The Suomi National Polar-orbiting Partnership satellite provides comprehensive 2x daily global coverage,
                serving as the backbone for fire and climate tracking worldwide. Its VIIRS instrument enables thermal
                anomaly detection with unprecedented accuracy and reliability for environmental monitoring.
              </p>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
                  <div className="text-xl font-bold text-green-700">2x</div>
                  <div className="text-sm text-gray-600">Daily Coverage</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
                  <div className="text-xl font-bold text-green-700">824km</div>
                  <div className="text-sm text-gray-600">Orbital Altitude</div>
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <img
                src="/sat2.jpg" // Your actual uploaded path
                alt="Suomi NPP Satellite"
                className="rounded-lg shadow-md w-full max-w-md transition-transform duration-300 hover:scale-105"
              />
            </div>
          </div>
        </div>


        {/* VIIRS Instrument Section */}
        <div className="mt-16">
          <div className="bg-white shadow-md rounded-xl p-6 grid md:grid-cols-2 gap-6 items-center">
            <img
              src="sat1.png"
              alt="VIIRS Instrument"
              className="rounded-lg shadow-md"
            />
            <div>
              <h4 className="text-green-700 font-semibold text-lg mb-2">🛰️ VIIRS Instrument</h4>
              <p className="text-sm text-gray-600">
                The Visible Infrared Imaging Radiometer Suite (VIIRS) represents cutting-edge satellite sensor technology,
                delivering ultra-high resolution fire detection data to NASA FIRMS in near real-time. This enables rapid
                response to environmental changes and precise greenhouse gas monitoring.
              </p>
              <div className="mt-4 bg-green-50 p-4 rounded-lg border border-green-100">
                <h5 className="text-md font-semibold text-green-700 mb-2">🔧 Technical Specifications</h5>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li><strong>Spatial Resolution:</strong> 375m (Thermal infrared bands)</li>
                  <li><strong>Update Frequency:</strong> Every 3 hours (Global coverage rate)</li>
                  <li><strong>Data Provider:</strong> NASA FIRMS</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default About;
