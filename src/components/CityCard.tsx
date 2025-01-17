import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { X, Thermometer, Sun, Cloud, CloudRain, Snowflake, CloudLightning, CloudSun } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cityCoordinates } from '../cityCoordinates'; // Import the city coordinates

interface CityCardProps {
  city: {
    name: string;
    timezone: string;
    image: string;
  };
  userTimezone: string;
  onRemove: (cityName: string) => void;
  isDarkMode: boolean;
}

// Cache for weather data
const weatherCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
const MAX_RETRIES = 3;
const RETRY_DELAY = 3000; // 3 seconds

const CityCard: React.FC<CityCardProps> = ({ city, userTimezone, onRemove, isDarkMode }) => {
  const { t } = useTranslation();
  const [time, setTime] = useState(new Date());
  const [imageError, setImageError] = useState(false);
  const [temperature, setTemperature] = useState<number | null>(null);
  const [weatherIcon, setWeatherIcon] = useState<React.ReactNode | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Retry mechanism for API calls
  const fetchWithRetry = async (url: string, options: RequestInit = {}, retries = MAX_RETRIES): Promise<Response> => {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response;
    } catch (error) {
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return fetchWithRetry(url, options, retries - 1);
      }
      throw error;
    }
  };

  useEffect(() => {
    let isMounted = true;

    const fetchWeatherData = async () => {
      if (!isMounted) return;

      try {
        setIsLoading(true);

        // Check cache first
        const cached = weatherCache.get(city.name);
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
          setTemperature(cached.data.temperature);
          setWeatherIcon(getWeatherIcon(cached.data.weatherCode));
          setIsLoading(false);
          return;
        }

        let lat: number, lon: number;

        if (cityCoordinates[city.name]) {
          // Use predefined coordinates for major cities
          ({ lat, lon } = cityCoordinates[city.name]);
        } else {
          // Geocode for other cities
          const geocodeResponse = await fetchWithRetry(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city.name)}&limit=1`,
            {
              headers: {
                'User-Agent': 'WorldTimeApp/1.0'
              }
            }
          );

          const geocodeData = await geocodeResponse.json();

          if (!geocodeData || geocodeData.length === 0) {
            throw new Error('City not found');
          }

          lat = parseFloat(geocodeData[0].lat);
          lon = parseFloat(geocodeData[0].lon);
        }

        // Add a small delay before the weather request
        await new Promise(resolve => setTimeout(resolve, 500));

        const weatherResponse = await fetchWithRetry(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code`
        );

        const weatherData = await weatherResponse.json();

        if (!isMounted) return;

        // Cache the results
        weatherCache.set(city.name, {
          data: {
            temperature: weatherData.current.temperature_2m,
            weatherCode: weatherData.current.weather_code
          },
          timestamp: Date.now()
        });

        setTemperature(weatherData.current.temperature_2m);
        setWeatherIcon(getWeatherIcon(weatherData.current.weather_code));
      } catch (error) {
        console.error('Error fetching weather data:', error);
        // Keep previous data if available, otherwise show loading
        if (!temperature) {
          setTemperature(null);
          setWeatherIcon(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchWeatherData();
    const weatherTimer = setInterval(fetchWeatherData, CACHE_DURATION);

    return () => {
      isMounted = false;
      clearInterval(weatherTimer);
    };
  }, [city.name]);

  const getWeatherIcon = (code: number): React.ReactNode => {
    const iconClass = "w-5 h-5 text-gray-300";

    if (code === 0) return <Sun className={iconClass} />; // Clear sky
    if (code === 1 || code === 2) return <CloudSun className={iconClass} />; // Mainly clear, partly cloudy
    if (code === 3) return <Cloud className={iconClass} />; // Overcast
    if (code >= 51 && code <= 65) return <CloudRain className={iconClass} />; // Rain
    if (code >= 71 && code <= 77) return <Snowflake className={iconClass} />; // Snow
    if (code === 95) return <CloudLightning className={iconClass} />; // Thunderstorm

    return <Cloud className={iconClass} />; // Default
  };

  const cityTime = new Date(time.toLocaleString('en-US', { timeZone: city.timezone }));
  const userTime = new Date(time.toLocaleString('en-US', { timeZone: userTimezone }));
  const timeDiff = Math.round((cityTime.getTime() - userTime.getTime()) / (1000 * 60 * 60));

  const fallbackImage = "https://images.unsplash.com/photo-1516900557549-41557d405adf?q=80&w=1528&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?auto=format&fit=crop&q=80&w=400&h=200";

  return (
    <div className="relative rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow h-48">
      <img
        src={imageError ? fallbackImage : city.image}
        alt={t(`cities.${city.name}`)}
        className="absolute inset-0 w-full h-full object-cover"
        onError={() => setImageError(true)}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/20 p-3">
        <button
          onClick={() => onRemove(city.name)}
          className="absolute top-2 right-2 p-1 hover:bg-black/30 rounded-full transition-colors"
        >
          <X className="w-3 h-3 text-white/70 hover:text-white" />
        </button>

        <div className="absolute bottom-3 left-3 right-3">
          <h2 className="text-sm font-semibold text-white mb-1">{t(`cities.${city.name}`)}</h2>
          <div className="flex items-baseline gap-2 mb-1">
            <div className="text-2xl font-mono font-bold text-blue-300">
              {format(cityTime, 'hh:mm')}
              <span className="text-sm">{format(cityTime, ':ss')}</span>
            </div>
            <div className="text-sm font-medium text-blue-300/90">
              {format(cityTime, 'a')}
            </div>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <div className="flex items-center gap-2">
              <Thermometer className="w-5 h-5 text-gray-300" />
              <p className="text-sm font-bold text-white">
                {isLoading ? 'Loading...' : temperature ? `${temperature.toFixed(1)}°C` : '--°C'}
              </p>
            </div>
            {weatherIcon && <div>{weatherIcon}</div>}
          </div>
          <div className="text-xs text-white/70">
            <p>{format(cityTime, 'EEE, MMM d')}</p>
            <p>
              {Math.abs(timeDiff)} hours {timeDiff >= 0 ? 'ahead' : 'behind'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CityCard;
