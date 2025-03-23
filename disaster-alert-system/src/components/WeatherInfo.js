// src/components/WeatherInfo.js
import React, { useState, useEffect, useCallback } from 'react';
import { fetchWeatherData } from '../services/WeatherService';
import { fetchDisasterProbability } from '../services/GeminiService';
import '../App.css';

const WeatherInfo = () => {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [disasterProbability, setDisasterProbability] = useState(null);
  const [loading, setLoading] = useState(false);

  // State for disaster probabilities
  const [floodProbability, setFloodProbability] = useState(0);
  const [droughtProbability, setDroughtProbability] = useState(0);
  const [cycloneProbability, setCycloneProbability] = useState(0);
  const [heatwaveProbability, setHeatwaveProbability] = useState(0);

  // State for notifications
  const [notification, setNotification] = useState(null);

  // Detect user's location
  useEffect(() => {
    let isMounted = true; // Flag to track if the component is mounted

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (isMounted) {
            const { latitude, longitude } = position.coords;
            setUserLocation({ latitude, longitude });
            fetchWeatherByCoords(latitude, longitude);
          }
        },
        (error) => {
          if (isMounted) {
            console.error('Error fetching location:', error);
            setError('Unable to fetch your location. Please enter a city manually.');
          }
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
    }

    return () => {
      isMounted = false; // Cleanup function to prevent state updates on unmounted component
    };
  }, []);

  // Fetch weather data by coordinates
  const fetchWeatherByCoords = async (lat, lon) => {
    setLoading(true);
    try {
      const data = await fetchWeatherData(`${lat},${lon}`);
      if (data) {
        setWeather(data);
        setError('');
        fetchDisasterData(data);
      } else {
        setError('Unable to fetch weather data for your location.');
      }
    } catch (error) {
      console.error('Error fetching weather data:', error);
      setError('Failed to fetch weather data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch disaster probability
  const fetchDisasterData = async (weatherData) => {
    setLoading(true);
    try {
      const location = weatherData.location.name;
      const probability = await fetchDisasterProbability(location, weatherData);
      if (probability) {
        console.log('Gemini API Response:', probability); // Debugging: Check the response
        setDisasterProbability(probability);
        parseDisasterProbabilities(probability); // Parse probabilities
      }
    } catch (error) {
      console.error('Error fetching disaster probability:', error);
      setError('Failed to fetch disaster probability. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Parse disaster probabilities from the Gemini API response
  const parseDisasterProbabilities = (response) => {
    // Reset probabilities
    setFloodProbability(0);
    setDroughtProbability(0);
    setCycloneProbability(0);
    setHeatwaveProbability(0);

    // Split the response into lines
    const lines = response.split('\n');

    // Parse each line
    lines.forEach((line) => {
      const match = line.match(/(Flood|Drought|Cyclone|Heatwave).*?(\d+)%/);
      if (match) {
        const disasterType = match[1];
        const probability = parseInt(match[2]);

        switch (disasterType) {
          case 'Flood':
            setFloodProbability(probability > 100 ? 100 : probability);
            if (probability > 50) setNotification(`Flood Alert: ${probability}% chance of flooding.`);
            break;
          case 'Drought':
            setDroughtProbability(probability > 100 ? 100 : probability);
            if (probability > 50) setNotification(`Drought Alert: ${probability}% chance of drought.`);
            break;
          case 'Cyclone':
            setCycloneProbability(probability > 100 ? 100 : probability);
            if (probability > 50) setNotification(`Cyclone Alert: ${probability}% chance of cyclone.`);
            break;
          case 'Heatwave':
            setHeatwaveProbability(probability > 100 ? 100 : probability);
            if (probability > 50) setNotification(`Heatwave Alert: ${probability}% chance of heatwave.`);
            break;
          default:
            break;
        }
      }
    });
  };

  // Fetch weather data by city name
  const handleSearch = useCallback(async () => {
    if (!city) return;

    // Reset states
    setWeather(null);
    setDisasterProbability(null);
    setFloodProbability(0);
    setDroughtProbability(0);
    setCycloneProbability(0);
    setHeatwaveProbability(0);
    setError('');
    setNotification(null);

    setLoading(true);
    try {
      const data = await fetchWeatherData(city);
      if (data) {
        setWeather(data);
        fetchDisasterData(data);
      } else {
        setError('City not found. Please try again.');
      }
    } catch (error) {
      console.error('Error fetching weather data:', error);
      setError('Failed to fetch weather data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [city]);

  // Close notification after 5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000); // Notification disappears after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [notification]);

  return (
    <div>
      {/* Notification Popup */}
      {notification && (
        <div className="notification-popup">
          <p>{notification}</p>
        </div>
      )}

      {/* Search Bar */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Enter city name"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      {/* Loading Spinner */}
      {loading && <div className="spinner"></div>}

      {/* Error Message */}
      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

      {/* Weather Display */}
      {weather && (
        <div className="weather-display">
          <h3>Current Weather in {weather.location.name}</h3>
          <p>Temperature: {weather.current.temp_c}°C</p>
          <p>Wind Speed: {weather.current.wind_kph} km/h</p>
          <p>Humidity: {weather.current.humidity}%</p>
          <p>Pressure: {weather.current.pressure_mb} hPa
          </p>
          <p>Visibility: {weather.current.vis_km} km</p>
        </div>
      )}

      {/* Disaster Probability Section */}
      {disasterProbability && (
        <div className="disaster-probability">
          <h3>Disaster Probability</h3>
          <div className="probability-bars">
            {/* Flood */}
            <div className="probability-bar">
              <div className="label">Flood</div>
              <div className="bar-container">
                <div
                  className="bar flood"
                  style={{ width: `${floodProbability}%` }}
                ></div>
              </div>
              <div className="percentage">{floodProbability}%</div>
            </div>

            {/* Drought */}
            <div className="probability-bar">
              <div className="label">Drought</div>
              <div className="bar-container">
                <div
                  className="bar drought"
                  style={{ width: `${droughtProbability}%` }}
                ></div>
              </div>
              <div className="percentage">{droughtProbability}%</div>
            </div>

            {/* Cyclone */}
            <div className="probability-bar">
              <div className="label">Cyclone</div>
              <div className="bar-container">
                <div
                  className="bar cyclone"
                  style={{ width: `${cycloneProbability}%` }}
                ></div>
              </div>
              <div className="percentage">{cycloneProbability}%</div>
            </div>

            {/* Heatwave */}
            <div className="probability-bar">
              <div className="label">Heatwave</div>
              <div className="bar-container">
                <div
                  className="bar heatwave"
                  style={{ width: `${heatwaveProbability}%` }}
                ></div>
              </div>
              <div className="percentage">{heatwaveProbability}%</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherInfo;