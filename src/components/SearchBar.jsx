import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin } from 'lucide-react';
import axios from 'axios';

const SearchBar = ({ onLocationSelect }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSearch = async (e) => {
        const value = e.target.value;
        setQuery(value);

        if (value.length > 2) {
            try {
                const response = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${value}&count=5&language=en&format=json`);
                if (response.data.results) {
                    setResults(response.data.results);
                    setIsOpen(true);
                }
            } catch (error) {
                console.error("Error searching location:", error);
            }
        } else {
            setResults([]);
            setIsOpen(false);
        }
    };

    const handleSelect = (result) => {
        // Calculate intelligent zoom level based on location type and size
        const calculateZoom = (result) => {
            const featureCode = result.feature_code;
            const population = result.population || 0;

            // Feature codes from GeoNames:
            // PCLI = Independent country
            // ADM1 = First-order administrative division (state/province)
            // PPLC = Capital city
            // PPLA = Seat of first-order admin division
            // PPL = Populated place (city/town)
            // PPLX = Section of populated place

            // Country or large region
            if (featureCode === 'PCLI' || featureCode === 'ADM1') {
                return 5; // Country/state level
            }

            // Capital cities and major cities
            if (featureCode === 'PPLC' || population > 1000000) {
                return 10; // Major city level
            }

            // Large cities
            if (featureCode === 'PPLA' || population > 100000) {
                return 11; // Large city level
            }

            // Medium cities
            if (population > 50000) {
                return 12; // Medium city level
            }

            // Small cities and towns
            if (population > 10000) {
                return 13; // Small city/town level
            }

            // Villages and small towns
            if (population > 1000) {
                return 14; // Village level
            }

            // Very small places
            return 15; // Hamlet/neighborhood level
        };

        const zoom = calculateZoom(result);

        // Fetch exact boundary polygon from Nominatim
        const fetchBoundary = async () => {
            try {
                console.log(`🗺️ Fetching boundary for: ${result.name}, ${result.country}`);
                const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
                    params: {
                        q: `${result.name}, ${result.country}`,
                        format: 'json',
                        polygon_geojson: 1,  // Request GeoJSON polygon
                        limit: 1
                    }
                });

                if (response.data && response.data.length > 0) {
                    const data = response.data[0];
                    if (data.geojson) {
                        console.log(`✅ Boundary found! Type: ${data.geojson.type}, Coordinates:`,
                            data.geojson.type === 'Polygon' ? `${data.geojson.coordinates[0].length} points` :
                                data.geojson.type === 'MultiPolygon' ? `${data.geojson.coordinates.length} polygons` :
                                    'Complex');
                        return data.geojson;
                    } else {
                        console.log(`❌ No GeoJSON boundary available for ${result.name}`);
                    }
                } else {
                    console.log(`❌ No results from Nominatim for ${result.name}`);
                }
            } catch (error) {
                console.error('❌ Error fetching boundary:', error);
            }
            return null;
        };

        // Get boundary asynchronously
        fetchBoundary().then(boundary => {
            const locationData = {
                lat: result.latitude,
                lon: result.longitude,
                name: `${result.name}, ${result.country}`,
                zoom: zoom,
                boundary: boundary  // Add GeoJSON boundary
            };

            console.log(`🔍 Search location selected:`, locationData, `| Feature: ${result.feature_code}, Pop: ${result.population || 'N/A'}, Zoom: ${zoom}`, boundary ? '| Boundary: ✅' : '| Boundary: ❌');
            onLocationSelect(locationData);
        });

        setQuery(`${result.name}, ${result.country}`);
        setIsOpen(false);
    };

    return (
        <div ref={wrapperRef} className="search-wrapper">
            <div className="search-input-container">
                <input
                    type="text"
                    value={query}
                    onChange={handleSearch}
                    placeholder="Search city..."
                    className="glass-input search-input"
                />
                <Search className="search-icon" size={20} />
            </div>

            {isOpen && results.length > 0 && (
                <div className="glass-panel search-results">
                    {results.map((result) => (
                        <button
                            key={result.id}
                            onClick={() => handleSelect(result)}
                            className="search-result-item"
                        >
                            <MapPin size={16} color="#93c5fd" />
                            <div className="search-result-text">
                                <div className="search-result-name">{result.name}</div>
                                <div className="search-result-sub">{result.admin1}, {result.country}</div>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SearchBar;
