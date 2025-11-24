import React, { useEffect, useState } from 'react';
import { Cloud, Droplets, Wind, Sun, CloudRain, CloudSnow, CloudDrizzle, CloudLightning, CloudFog } from 'lucide-react';

const WeatherCard = ({ weather, locationName, loading }) => {
    const [displayTemp, setDisplayTemp] = useState(0);

    // Animate temperature counter
    useEffect(() => {
        if (weather && typeof weather.temperature === 'number') {
            const target = Math.round(weather.temperature);
            let current = displayTemp;

            // If difference is too large, jump to target to avoid long animation
            if (Math.abs(target - current) > 50) {
                setDisplayTemp(target);
                return;
            }

            const increment = target > current ? 1 : -1;

            // If already at target, do nothing
            if (current === target) return;

            const timer = setInterval(() => {
                current += increment;
                setDisplayTemp(current);

                // Safety check to stop animation
                if ((increment > 0 && current >= target) ||
                    (increment < 0 && current <= target)) {
                    setDisplayTemp(target); // Ensure exact target
                    clearInterval(timer);
                }
            }, 20);
            return () => clearInterval(timer);
        }
    }, [weather?.temperature]);

    if (loading) {
        return (
            <div className="glass-panel weather-card loading-pulse">
                <div className="skeleton-text skeleton-h8"></div>
                <div className="skeleton-text skeleton-h16"></div>
                <div className="weather-stats">
                    <div className="skeleton-box"></div>
                    <div className="skeleton-box"></div>
                </div>
            </div>
        );
    }

    if (!weather) return null;

    const { windspeed, weathercode, humidity } = weather;

    // Enhanced weather code mapping
    const getWeatherInfo = (code) => {
        if (code === 0) return { description: "Clear sky", icon: <Sun size={20} /> };
        if (code >= 1 && code <= 3) return { description: "Partly cloudy", icon: <Cloud size={20} /> };
        if (code >= 45 && code <= 48) return { description: "Foggy", icon: <CloudFog size={20} /> };
        if (code >= 51 && code <= 55) return { description: "Light drizzle", icon: <CloudDrizzle size={20} /> };
        if (code >= 56 && code <= 67) return { description: "Rain", icon: <CloudRain size={20} /> };
        if (code >= 71 && code <= 77) return { description: "Snow", icon: <CloudSnow size={20} /> };
        if (code >= 80 && code <= 82) return { description: "Rain showers", icon: <CloudRain size={20} /> };
        if (code >= 95 && code <= 99) return { description: "Thunderstorm", icon: <CloudLightning size={20} /> };
        return { description: "Partly cloudy", icon: <Cloud size={20} /> };
    };

    const weatherInfo = getWeatherInfo(weathercode);

    return (
        <div className="glass-panel weather-card">
            <div className="weather-header">
                <div>
                    <h2 className="location-name">{locationName}</h2>
                    <p className="weather-condition">
                        {weatherInfo.icon}
                        {weatherInfo.description}
                    </p>
                </div>
                <div className="temperature">
                    {displayTemp}°
                </div>
            </div>

            <div className="weather-stats">
                <div className="stat-item">
                    <Wind size={28} color="#06b6d4" />
                    <span className="stat-label">Wind</span>
                    <span className="stat-value">{windspeed} km/h</span>
                </div>
                <div className="stat-item">
                    <Droplets size={28} color="#a855f7" />
                    <span className="stat-label">Humidity</span>
                    <span className="stat-value">{humidity || 'N/A'}%</span>
                </div>
            </div>
        </div>
    );
};

export default WeatherCard;
