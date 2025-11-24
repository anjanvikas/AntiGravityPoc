import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MapComponent from './components/MapComponent';
import WeatherCard from './components/WeatherCard';
import ForecastCard from './components/ForecastCard';
import SearchBar from './components/SearchBar';
import './App.css';

function App() {
  // Default location: London
  const [location, setLocation] = useState({
    lat: 51.505,
    lon: -0.09,
    name: "London, United Kingdom"
  });

  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchWeather = async (lat, lon) => {
    console.log(`🌤️ Fetching weather for coordinates: ${lat.toFixed(4)}, ${lon.toFixed(4)}`);
    setLoading(true);
    setError(null);
    // Clear previous weather data to show loading state
    setWeather(null);
    setForecast(null);

    try {
      const response = await axios.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=temperature_2m,relativehumidity_2m,windspeed_10m&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto`
      );

      console.log(`✅ Weather data received for (${lat.toFixed(4)}, ${lon.toFixed(4)}):`, response.data.current_weather);

      // Enhance current weather with humidity from hourly data
      const current = response.data.current_weather;
      const hourly = response.data.hourly;
      const currentHourIndex = new Date().getHours();
      const humidity = hourly.relativehumidity_2m[currentHourIndex];

      setWeather({
        ...current,
        humidity
      });

      setForecast(response.data.daily);

    } catch (err) {
      console.error("❌ Error fetching weather:", err);
      setError("Failed to fetch weather data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Use specific lat/lon in dependencies to ensure updates trigger
  useEffect(() => {
    console.log(`📍 Location changed to: ${location.name} (${location.lat.toFixed(4)}, ${location.lon.toFixed(4)})`);
    fetchWeather(location.lat, location.lon);
  }, [location.lat, location.lon]);

  const handleLocationSelect = (newLocation) => {
    setLocation(newLocation);
  };

  return (
    <div className="app-container">
      {/* Map Background */}
      <div className="map-background">
        <MapComponent location={location} onLocationSelect={handleLocationSelect} />
      </div>

      {/* Overlay Content */}
      <div className="app-overlay">
        {/* Top Bar */}
        <div className="search-container">
          <SearchBar onLocationSelect={handleLocationSelect} />
        </div>

        {/* Weather Content (Bottom Left) */}
        <div className="weather-card-container">
          {error && <div className="error-message">{error}</div>}

          <WeatherCard
            weather={weather}
            locationName={location.name}
            loading={loading}
          />

          <ForecastCard
            forecast={forecast}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
