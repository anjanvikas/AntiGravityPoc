import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents, GeoJSON, Rectangle, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

function ChangeView({ center, zoom }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, zoom || 11, {
            animate: true,
            duration: 1
        });
    }, [center, zoom, map]);
    return null;
}

function MapEvents({ onLocationSelect }) {
    useMapEvents({
        async click(e) {
            const lat = e.latlng.lat;
            const lon = e.latlng.lng;

            console.log(`🗺️ Map clicked at coordinates: ${lat.toFixed(4)}, ${lon.toFixed(4)} `);

            // Fetch location name using reverse geocoding
            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`
                );
                const data = await response.json();

                // Build a proper location name from the address components
                // Build a proper location name from the address components
                let locationName = "";
                if (data.address) {
                    const addr = data.address;

                    // 1. Identify the primary local name (City/Town/Village/Suburb)
                    const localName = addr.city ||
                        addr.town ||
                        addr.village ||
                        addr.hamlet ||
                        addr.suburb ||
                        addr.neighbourhood ||
                        addr.county;

                    // 2. Identify the broader context (State/Country)
                    const context = addr.state || addr.country;

                    // 3. Construct the display name
                    if (localName) {
                        locationName = localName;
                        if (context && context !== localName) {
                            locationName += `, ${context}`;
                        }
                    } else if (addr.road) {
                        // Fallback to road if no settlement name, but append context
                        locationName = addr.road;
                        if (context) locationName += `, ${context}`;
                    } else {
                        // Ultimate fallback
                        locationName = data.display_name.split(',')[0];
                    }
                } else {
                    locationName = "Selected Location";
                }

                console.log(`📍 Location name resolved: ${locationName}`);

                // Always create a new object reference to ensure React detects the change
                onLocationSelect({
                    lat: lat,
                    lon: lon,
                    name: locationName
                });
            } catch (error) {
                console.error("❌ Error fetching location name:", error);
                // Fallback to coordinates if geocoding fails
                onLocationSelect({
                    lat: lat,
                    lon: lon,
                    name: `Location (${lat.toFixed(4)}, ${lon.toFixed(4)})`
                });
            }
        },
    });
    return null;
}

const MapComponent = ({ location, onLocationSelect }) => {
    const position = [location.lat, location.lon];

    // Set world bounds to prevent repeating tiles
    const worldBounds = [
        [-90, -180], // Southwest coordinates
        [90, 180]    // Northeast coordinates
    ];

    return (
        <MapContainer
            center={position}
            zoom={11}
            minZoom={2}
            maxZoom={18}
            scrollWheelZoom={true}
            style={{ height: "100%", width: "100%" }}
            zoomControl={true}
            maxBounds={worldBounds}
            maxBoundsViscosity={1.0}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                maxZoom={19}
                noWrap={true}
            />
            <ChangeView center={position} zoom={location.zoom} />
            <MapEvents onLocationSelect={onLocationSelect} />

            {/* Show exact boundary if available */}
            {location.boundary && (
                <GeoJSON
                    key={location.name}  // Force re-render when location changes
                    data={location.boundary}
                    style={{
                        color: '#06b6d4',      // Cyan border
                        weight: 2,              // Border width
                        opacity: 0.8,           // Border opacity
                        fillColor: '#06b6d4',   // Cyan fill
                        fillOpacity: 0.1        // Very transparent fill
                    }}
                />
            )}

            <Marker position={position}>
                <Popup>
                    <strong>{location.name}</strong>
                </Popup>
            </Marker>
        </MapContainer>
    );
};

export default MapComponent;
