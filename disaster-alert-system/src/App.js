// src/App.js
import React, { useState } from 'react';
import WeatherInfo from './components/WeatherInfo';
import MapComponent from './components/MapComponent';
import './App.css';

function App() {
  const [darkMode, setDarkMode] = useState(true);

  // Toggle between dark and light mode
  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={darkMode ? 'dark-mode' : 'light-mode'}>
      {/* Theme Toggle Button */}
      <button onClick={toggleTheme} className="theme-toggle">
        {darkMode ? '🌞 Light Mode' : '🌙 Dark Mode'}
      </button>

      {/* Main Container */}
      <div className="container">
        {/* Header */}
        <header className="header">
          <h1>Real-Time Disaster Alert System</h1>
          <p>Get real-time weather updates and disaster probability predictions for your location.</p>
        </header>

        {/* Main Content */}
        <div className="main-content">
          <div className="row">
            {/* Map Component */}
            <div className="col-md-6">
              <div className="map-container">
                <MapComponent />
              </div>
            </div>

            {/* Weather Info Component */}
            <div className="col-md-6">
              <WeatherInfo />
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="footer">
          <p>©  Disaster Alert System. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}

export default App;