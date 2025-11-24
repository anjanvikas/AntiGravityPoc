import React from 'react';
import { Cloud, Sun, CloudRain, CloudSnow, CloudLightning, CloudDrizzle, CloudFog } from 'lucide-react';

const ForecastCard = ({ forecast, loading }) => {
    if (loading) {
        return (
            <div className="glass-panel forecast-card loading-pulse">
                <div className="skeleton-text skeleton-h8"></div>
                <div className="forecast-grid">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="skeleton-box" style={{ height: '100px' }}></div>
                    ))}
                </div>
            </div>
        );
    }

    if (!forecast) return null;

    const { time, weathercode, temperature_2m_max, temperature_2m_min } = forecast;

    const getDayName = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { weekday: 'short' });
    };

    const getWeatherIcon = (code) => {
        if (code === 0) return <Sun size={32} color="#f59e0b" />;
        if (code >= 1 && code <= 3) return <Cloud size={32} color="#94a3b8" />;
        if (code >= 45 && code <= 48) return <CloudFog size={32} color="#94a3b8" />;
        if (code >= 51 && code <= 55) return <CloudDrizzle size={32} color="#06b6d4" />;
        if (code >= 56 && code <= 67) return <CloudRain size={32} color="#0ea5e9" />;
        if (code >= 71 && code <= 77) return <CloudSnow size={32} color="#e0e7ff" />;
        if (code >= 80 && code <= 82) return <CloudRain size={32} color="#0ea5e9" />;
        if (code >= 95 && code <= 99) return <CloudLightning size={32} color="#a855f7" />;
        return <Cloud size={32} color="#94a3b8" />;
    };

    return (
        <div className="glass-panel forecast-card">
            <h3 className="forecast-title">5-Day Forecast</h3>
            <div className="forecast-grid">
                {time.slice(1, 6).map((date, index) => (
                    <div key={date} className="forecast-item">
                        <span className="forecast-day">{getDayName(date)}</span>
                        <div className="forecast-icon">
                            {getWeatherIcon(weathercode[index + 1])}
                        </div>
                        <div className="forecast-temp">
                            <span className="max-temp">{Math.round(temperature_2m_max[index + 1])}°</span>
                            <span className="min-temp">{Math.round(temperature_2m_min[index + 1])}°</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ForecastCard;
