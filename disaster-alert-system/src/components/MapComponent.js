// src/components/MapComponent.js
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, LayersControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { fetchIndianCitiesWeather } from '../services/WeatherService';

const { BaseLayer } = LayersControl;

const MapComponent = () => {
  const [weatherData, setWeatherData] = useState([]);

  // Fetch weather data for Indian cities
  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchIndianCitiesWeather();
      setWeatherData(data);
    };

    fetchData();
  }, []);

  // Function to determine marker color based on temperature
  const getColor = (temp) => {
    if (temp > 35) return '#ff0000'; // Extreme heat - Red
    if (temp > 30) return '#ff6600'; // Hot - Orange
    if (temp > 20) return '#ffcc00'; // Warm - Yellow
    if (temp > 10) return '#3399ff'; // Cool - Blue
    return '#0033cc'; // Cold - Dark Blue
  };

  // Function to determine marker size based on severity
  const getSize = (temp) => {
    if (temp > 35) return 15;
    if (temp > 30) return 12;
    if (temp > 20) return 10;
    return 8;
  };

  return (
    <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: '500px', width: '100%', borderRadius: '10px' }}>
      {/* Layer Control for Base Maps */}
      <LayersControl position="topright">
        {/* Default OpenStreetMap */}
        <BaseLayer checked name="Street View">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="© OpenStreetMap contributors"
          />
        </BaseLayer>
        
        {/* Satellite View */}
        <BaseLayer name="Satellite View">
          <TileLayer
            url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
            attribution="© OpenTopoMap contributors"
          />
        </BaseLayer>
      </LayersControl>

      {/* Circle Markers for Weather Data */}
      {weatherData.map((data, index) => (
        <CircleMarker
          key={index}
          center={data.coordinates}
          radius={getSize(data.temperature)}
          fillColor={getColor(data.temperature)}
          color="#fff"
          weight={1}
          opacity={0.9}
          fillOpacity={0.7}
        >
          <Popup>
            <div>
              <h3>{data.city}</h3>
              <p><strong>Temperature:</strong> {data.temperature}°C</p>
              <p><strong>Humidity:</strong> {data.humidity}%</p>
              <p><strong>Wind Speed:</strong> {data.windSpeed} km/h</p>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
};

export default MapComponent;