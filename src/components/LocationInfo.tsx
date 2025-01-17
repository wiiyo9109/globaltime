import React, { useState, useEffect } from 'react';
import { MapPin, Thermometer } from 'lucide-react';
import { format } from 'date-fns';

interface LocationData {
  city: string;
  country: string;
  timezone: string;
  latitude: number;
  longitude: number;
}

interface WeatherData {
  temperature: number;
  description: string;
}

const LocationInfo: React.FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [time, setTime] = useState(new Date());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocationData = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        if (!response.ok) {
          throw new Error('Failed to fetch location data');
        }

        const data = await response.json();

        setLocation({
          city: data.city,
          country: data.country_name,
          timezone: data.timezone,
          latitude: data.latitude,
          longitude: data.longitude
        });

        // Fetch weather data using coordinates
        const weatherResponse = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${data.latitude}&longitude=${data.longitude}&current=temperature_2m,weather_code`
        );

        if (!weatherResponse.ok) {
          throw new Error('Failed to fetch weather data');
        }

        const weatherData = await weatherResponse.json();

        // Convert weather code to description
        const weatherDescription = getWeatherDescription(weatherData.current.weather_code);

        setWeather({
          temperature: weatherData.current.temperature_2m,
          description: weatherDescription
        });
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('An error occurred while fetching location data.');
      }
    };

    fetchLocationData();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getWeatherDescription = (code: number): string => {
    const weatherCodes: { [key: number]: string } = {
      0: 'Clear Sky',
      1: 'Mainly Clear',
      2: 'Partly Cloudy',
      3: 'Overcast',
      45: 'Foggy',
      48: 'Rime Fog',
      51: 'Light Drizzle',
      53: 'Moderate Drizzle',
      55: 'Dense Drizzle',
      61: 'Slight Rain',
      63: 'Moderate Rain',
      65: 'Heavy Rain',
      71: 'Slight Snow',
      73: 'Moderate Snow',
      75: 'Heavy Snow',
      95: 'Thunderstorm',
    };
    return weatherCodes[code] || 'Unknown';
  };

  if (!location || !weather) {
    return (
      <div className={`mb-6 p-4 rounded-lg shadow-xl ${
        isDarkMode ? 'bg-slate-800' : 'bg-white'
      }`}>
        <div className="flex items-center justify-center h-20">
          <div className="animate-pulse text-slate-400">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`mb-6 p-4 rounded-lg shadow-xl ${
      isDarkMode ? 'bg-slate-800' : 'bg-white'
    }`}>
      {error && (
        <div className="text-red-400 text-sm mb-2">
          {error}
        </div>
      )}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex items-center gap-3">
          <MapPin className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
          <div>
            <h2 className="text-lg font-semibold">{location.city}, {location.country}</h2>
            <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {Math.abs(location.latitude).toFixed(2)}°{location.latitude >= 0 ? 'N' : 'S'},
              {Math.abs(location.longitude).toFixed(2)}°{location.longitude >= 0 ? 'E' : 'W'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-2xl font-mono font-bold text-blue-500">
              {format(time, 'HH:mm')}
              <span className="text-sm">{format(time, ':ss')}</span>
            </div>
            <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {format(time, 'EEEE, MMMM d')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Thermometer className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            <div>
              <div className="text-xl font-semibold">{weather.temperature.toFixed(1)}°C</div>
              <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {weather.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationInfo;
