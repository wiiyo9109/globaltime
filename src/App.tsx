import React, { useState, useEffect } from 'react';
import { Clock as ClockIcon, Plus, Heart, Search, Sun, Moon, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import { defaultCities } from './cities';
import CityCard from './components/CityCard';
import AddCityModal from './components/AddCityModal';
import TimeZoneSelector from './components/TimeZoneSelector';
import LocationInfo from './components/LocationInfo';
import LanguageSwitcher from './components/LanguageSwitcher';

function App() {
  const { t } = useTranslation();
  const [userTimezone, setUserTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [showSettings, setShowSettings] = useState(false);
  const [showAddCity, setShowAddCity] = useState(false);
  const [cities, setCities] = useState(defaultCities);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      return saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const addCity = (city: typeof defaultCities[0]) => {
    setCities([...cities, city]);
    setShowAddCity(false);
  };

  const removeCity = (cityName: string) => {
    setCities(cities.filter(city => city.name !== cityName));
  };

  const filteredCities = cities.filter(city => {
    const cityName = city.name.toLowerCase();
    const translatedCityName = t(`cities.${city.name}`).toLowerCase();
    const lowerCaseQuery = searchQuery.toLowerCase();
    return cityName.includes(lowerCaseQuery) || translatedCityName.includes(lowerCaseQuery);
  });

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${isDarkMode ? 'bg-gradient-to-br from-slate-900 to-slate-800 text-white' : 'bg-gradient-to-br from-blue-50 to-slate-100 text-slate-900'}`}>
      <div className="max-w-[1600px] mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <ClockIcon className={`w-6 h-6 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            <h1 className="text-2xl font-bold">{t('app.title')}</h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={toggleTheme}
              title={t('app.toggleTheme')}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode
                  ? 'bg-slate-700 hover:bg-slate-600'
                  : 'bg-white hover:bg-gray-100 shadow-sm'
              }`}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setShowAddCity(true)}
              title={t('app.addCity')}
              className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                isDarkMode
                  ? 'bg-blue-500 hover:bg-blue-600'
                  : 'bg-white hover:bg-gray-100 shadow-sm'
              }`}
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowSettings(true)}
              title={t('app.settings')}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                isDarkMode
                  ? 'bg-slate-700 hover:bg-slate-600'
                  : 'bg-white hover:bg-gray-100 shadow-sm'
              }`}
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        <LocationInfo isDarkMode={isDarkMode} />

        {showSettings && (
          <div className={`mb-6 p-4 rounded-lg shadow-xl ${
            isDarkMode ? 'bg-slate-800' : 'bg-white'
          }`}>
            <TimeZoneSelector
              selectedTimezone={userTimezone}
              onTimezoneChange={setUserTimezone}
              isDarkMode={isDarkMode}
            />
          </div>
        )}

        <div className="relative mb-4">
          <Search className={`absolute left-3 top-2.5 w-5 h-5 ${
            isDarkMode ? 'text-slate-400' : 'text-slate-500'
          }`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('app.searchPlaceholder')}
            className={`w-full pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors ${
              isDarkMode
                ? 'bg-slate-700/50 placeholder-slate-400'
                : 'bg-white placeholder-slate-400 shadow-sm'
            }`}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {filteredCities.map((city) => (
            <CityCard
              key={city.name}
              city={city}
              userTimezone={userTimezone}
              onRemove={removeCity}
              isDarkMode={isDarkMode}
            />
          ))}
        </div>

        {filteredCities.length === 0 && (
          <div className="text-center py-8 text-slate-400">
            <p>{t('app.noCitiesFound')}</p>
          </div>
        )}

        {showAddCity && (
          <AddCityModal
            onClose={() => setShowAddCity(false)}
            onAdd={addCity}
            existingCities={cities}
            isDarkMode={isDarkMode}
          />
        )}

        <footer className="mt-8 text-center text-sm text-slate-400">
          <div className="flex flex-col items-center gap-4">
            <LanguageSwitcher isDarkMode={isDarkMode} />
            <p className="flex items-center justify-center gap-1">
              {t('app.madeBy')}{' '}
              <Heart className="w-4 h-4 text-red-400 fill-red-400" />{' '}
              <a
                href="https://wiiyo.ppap.io"
                target="_blank"
                rel="noreferrer"
                className="text-blue-400 hover:text-blue-300"
              >
                Wiiyo Innovative
              </a>
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;
