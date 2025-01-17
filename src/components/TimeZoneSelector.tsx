import React, { useState } from 'react';
import { Clock } from 'lucide-react';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

interface TimeZoneSelectorProps {
  selectedTimezone: string;
  onTimezoneChange: (timezone: string) => void;
  isDarkMode: boolean;
}

const TimeZoneSelector: React.FC<TimeZoneSelectorProps> = ({
  selectedTimezone,
  onTimezoneChange,
  isDarkMode,
}) => {
  const { t } = useTranslation();
  const [tempTimezone, setTempTimezone] = useState(selectedTimezone);
  const currentTime = new Date();

  // Fallback list of timezones
  const fallbackTimeZones = [
    'UTC',
    'America/New_York',
    'Europe/London',
    'Asia/Tokyo',
    // Add more timezones as needed
  ];

  const handleApply = () => {
    onTimezoneChange(tempTimezone);
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold flex items-center gap-2">
        <Clock className="w-5 h-5" />
        {t('timeZoneSelector.selectYourTimezone')}
      </h2>
      <div className="flex flex-col md:flex-row gap-3">
        {Intl.supportedValuesOf('timeZone') ? (
          <select
            value={tempTimezone}
            onChange={(e) => setTempTimezone(e.target.value)}
            className={`w-full md:w-auto max-w-md px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${
              isDarkMode
                ? 'bg-slate-700 text-white'
                : 'bg-white text-slate-900 border border-slate-200'
            }`}
          >
            {Intl.supportedValuesOf('timeZone').map((timezone) => (
              <option key={timezone} value={timezone}>
                {timezone}
              </option>
            ))}
          </select>
        ) : (
          <select
            value={tempTimezone}
            onChange={(e) => setTempTimezone(e.target.value)}
            className={`w-full md:w-auto max-w-md px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${
              isDarkMode
                ? 'bg-slate-700 text-white'
                : 'bg-white text-slate-900 border border-slate-200'
            }`}
          >
            {fallbackTimeZones.map((timezone) => (
              <option key={timezone} value={timezone}>
                {timezone}
              </option>
            ))}
          </select>
        )}
        <button
          onClick={handleApply}
          className={`w-full md:w-auto px-4 py-2 rounded-lg transition-colors ${
            isDarkMode
              ? 'bg-blue-500 hover:bg-blue-600 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {t('timeZoneSelector.apply')}
        </button>
      </div>
      <p className={`text-sm ${isDarkMode ? 'text-slate-350' : 'text-slate-500'}`}>
        {t('timeZoneSelector.zoneTime')}
        <span className={isDarkMode ? 'text-white' : 'text-slate-600'}>
          {format(currentTime, 'hh:mm:ss a')}
        </span>
      </p>
    </div>
  );
}

export default TimeZoneSelector;
