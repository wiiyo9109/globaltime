import React, { useState } from 'react';
import { X, Search, Loader2 } from 'lucide-react';
import { cityList } from '../cityList';
import { useTranslation } from 'react-i18next';

interface AddCityModalProps {
  onClose: () => void;
  onAdd: (city: { name: string; timezone: string; image: string }) => void;
  existingCities: Array<{ name: string; timezone: string; image: string }>;
  isDarkMode: boolean;
}

const AddCityModal: React.FC<AddCityModalProps> = ({
  onClose,
  onAdd,
  existingCities,
  isDarkMode,
}) => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState<{ name: string; timezone: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const filteredCities = search
    ? cityList.filter(city =>
        city.timezone.toLowerCase().includes(search.toLowerCase()) &&
        !existingCities.some(existing => existing.timezone === city.timezone)
      )
    : [];

  const handleCitySelect = (city: typeof cityList[0]) => {
    setSelectedCity(city);
    setSearch(city.timezone);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedCity) {
      setError(t('AddCityModal.Please select a city'));
      return;
    }

    setLoading(true);
    try {
      // 獲取城市的背景圖片 URL
      const image = `https://source.unsplash.com/1600x900/?${selectedCity.name}`;
      await onAdd({ ...selectedCity, image });
      onClose();
    } catch (error) {
      setError(t('An error occurred while adding the city. Please try again later.'));
      console.error('Error adding city:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className={`bg-${isDarkMode ? 'slate-800' : 'white'} rounded-xl p-6 w-full max-w-md relative`}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 hover:bg-slate-700 rounded-full"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className={`text-xl font-semibold mb-6 ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`}>{t('Add City')}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none`}
                placeholder={t('app.searchPlaceholder')}
                autoComplete="off"
              />
            </div>

            {search && filteredCities.length > 0 && !selectedCity && (
              <div className={`absolute z-10 mt-1 w-full rounded-lg shadow-lg max-h-60 overflow-auto ${isDarkMode ? 'bg-slate-700' : 'bg-gray-100'}`}>
                {filteredCities.map((city) => (
                  <button
                    key={`${city.name}-${city.timezone}`}
                    type="button"
                    onClick={() => handleCitySelect(city)}
                    className="w-full px-4 py-2 text-left hover:bg-slate-600 focus:bg-slate-600 focus:outline-none"
                  >
                    {t(`${city.name}`)} ({city.timezone})
                  </button>
                ))}
              </div>
            )}
          </div>

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <div className="flex gap-4 mt-6">
            <button
              type="submit"
              disabled={loading || !selectedCity}
              className={`flex-1 px-4 py-2 ${isDarkMode ? 'bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50' : 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50'} rounded-lg transition-colors flex items-center justify-center gap-2`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('addCityModal.addaCity')}
                </>
              ) : (
                t('addCityModal.add')
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 px-4 py-2 ${isDarkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-200 hover:bg-gray-300'} rounded-lg transition-colors`}
            >
              {t('addCityModal.cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCityModal;
