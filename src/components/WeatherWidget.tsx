"use client";

import { useEffect, useState } from "react";

interface CurrentWeather {
  temp: number;
  feelsLike: number;
  condition: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  location: string;
}

export default function WeatherWidget() {
  const [currentWeather, setCurrentWeather] = useState<CurrentWeather | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getLocationAndFetchWeather();
  }, []);

  const getLocationAndFetchWeather = () => {
    if (!navigator.geolocation) {
      // Fallback to default location (Melbourne)
      console.log("Geolocation not supported, using default location");
      fetchWeather(-37.8136, 144.9631);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log("Got location:", position.coords);
        fetchWeather(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        console.error("Geolocation error:", error);
        // Fallback to default location (Melbourne) on error
        console.log("Using default location due to error");
        fetchWeather(-37.8136, 144.9631);
      },
      {
        enableHighAccuracy: false,
        timeout: 10000, // 10 second timeout
        maximumAge: 300000, // Accept cached position up to 5 minutes old
      }
    );
  };

  const fetchWeather = async (lat: number, lon: number) => {
    try {
      setLoading(true);
      
      // Using Open-Meteo API (free, no API key required)
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch weather data");
      }

      const data = await response.json();

      // Get location name using reverse geocoding
      const locationName = await getLocationName(lat, lon);

      // Set current weather
      setCurrentWeather({
        temp: Math.round(data.current.temperature_2m),
        feelsLike: Math.round(data.current.apparent_temperature),
        condition: getWeatherCondition(data.current.weather_code),
        icon: getWeatherIcon(data.current.weather_code),
        humidity: data.current.relative_humidity_2m,
        windSpeed: Math.round(data.current.wind_speed_10m),
        location: locationName,
      });

      setError(null);
      setLoading(false);
    } catch (err) {
      console.error("Weather fetch error:", err);
      setError("Unable to load weather data");
      setLoading(false);
    }
  };

  const getLocationName = async (lat: number, lon: number): Promise<string> => {
    try {
      // Using OpenStreetMap's Nominatim API for reverse geocoding (free, no API key)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
        {
          headers: {
            'User-Agent': 'Discovery-Weather-Widget'
          }
        }
      );
      
      if (!response.ok) {
        return "Your Location";
      }

      const data = await response.json();
      
      // Try to get city/town, fall back to suburb or state
      const location = data.address?.city || 
                       data.address?.town || 
                       data.address?.suburb || 
                       data.address?.state || 
                       "Your Location";
      
      return location;
    } catch (error) {
      console.error("Geocoding error:", error);
      return "Your Location";
    }
  };

  const getWeatherCondition = (code: number): string => {
    const conditions: { [key: number]: string } = {
      0: "Clear Sky",
      1: "Mostly Clear",
      2: "Partly Cloudy",
      3: "Overcast",
      45: "Foggy",
      48: "Foggy",
      51: "Light Drizzle",
      53: "Drizzle",
      55: "Heavy Drizzle",
      61: "Light Rain",
      63: "Rain",
      65: "Heavy Rain",
      71: "Light Snow",
      73: "Snow",
      75: "Heavy Snow",
      77: "Snow Grains",
      80: "Light Showers",
      81: "Showers",
      82: "Heavy Showers",
      85: "Light Snow Showers",
      86: "Snow Showers",
      95: "Thunderstorm",
      96: "Thunderstorm with Hail",
      99: "Heavy Thunderstorm",
    };
    return conditions[code] || "Unknown";
  };

  const getWeatherIcon = (code: number): string => {
    if (code === 0) return "☀️";
    if (code <= 3) return "⛅";
    if (code <= 48) return "🌫️";
    if (code <= 55) return "🌦️";
    if (code <= 65) return "🌧️";
    if (code <= 77) return "🌨️";
    if (code <= 82) return "🌧️";
    if (code <= 86) return "🌨️";
    if (code >= 95) return "⛈️";
    return "🌤️";
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-[#121829] to-[#0f1318] border border-[#00be64]/20 rounded-2xl p-8 relative overflow-hidden">
        <div className="flex items-center justify-center gap-3 py-8">
          <div className="w-2 h-2 bg-[#00be64] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-[#00be64] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-[#00be64] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          <p className="text-white ml-2">Loading weather...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-[#121829] to-[#0f1318] border border-[#00be64]/20 rounded-2xl p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center">
            <span className="text-xl">⚠️</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Weather</h2>
            <p className="text-gray-400 text-sm">Unable to load</p>
          </div>
        </div>
        <p className="text-red-400 text-sm">{error}</p>
        <button
          onClick={getLocationAndFetchWeather}
          className="mt-4 px-4 py-2 text-sm text-white/80 hover:text-[#00be64] border border-white/20 hover:border-[#00be64]/50 hover:bg-white/5 rounded-full transition-all duration-200 active:scale-95"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-[#121829] to-[#0f1318] border border-[#00be64]/20 rounded-2xl p-8 relative overflow-hidden hover:border-[#00be64]/40 transition-all duration-300">
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#00be64]/5 rounded-full blur-3xl -translate-y-32 translate-x-32" />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#00be64]/10 rounded-xl flex items-center justify-center">
              <span className="text-xl">🌤️</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Current Weather</h2>
              <p className="text-gray-400 text-sm">{currentWeather?.location}</p>
            </div>
          </div>
        </div>

        {/* Current Weather */}
        {currentWeather && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-6xl">{currentWeather.icon}</span>
              <div>
                <div className="text-5xl font-bold text-white">{currentWeather.temp}°C</div>
                <p className="text-gray-400 text-sm mt-1">Feels like {currentWeather.feelsLike}°C</p>
                <p className="text-gray-300 text-sm mt-2 font-medium">{currentWeather.condition}</p>
              </div>
            </div>
            <div className="text-right space-y-3">
              <div className="flex items-center gap-2 justify-end">
                <span className="text-xl">💧</span>
                <div className="text-left">
                  <p className="text-white font-medium">{currentWeather.humidity}%</p>
                  <p className="text-gray-500 text-xs">Humidity</p>
                </div>
              </div>
              <div className="flex items-center gap-2 justify-end">
                <span className="text-xl">💨</span>
                <div className="text-left">
                  <p className="text-white font-medium">{currentWeather.windSpeed} km/h</p>
                  <p className="text-gray-500 text-xs">Wind</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}