// App.tsx
import { useTranslation } from 'react-i18next';
import Calculator from './components/Calculator';

export default function App() {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 font-sans">
      <div className="w-full max-w-[1400px] mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-1 sm:mb-2">{t('title')}</h1>
            <p className="text-base sm:text-lg text-gray-600">{t('subtitle')}</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => changeLanguage('en')}
              className={`px-4 py-2 rounded-lg border ${
                i18n.language === 'en' 
                  ? 'text-indigo-600 border-indigo-600' 
                  : 'text-gray-800 border-gray-800'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => changeLanguage('zh')}
              className={`px-4 py-2 rounded-lg border ${
                i18n.language === 'zh' 
                  ? 'text-indigo-600 border-indigo-600' 
                  : 'text-gray-800 border-gray-800'
              }`}
            >
              中文
            </button>
          </div>
        </div>

        <Calculator />

        <div className="mt-6 sm:mt-8 text-center text-xs sm:text-sm text-gray-500">
          <p>{t('footer')}</p>
        </div>
      </div>
    </div>
  );
}
