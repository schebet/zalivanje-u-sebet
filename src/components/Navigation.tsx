import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Droplets, Map, History as HistoryIcon, Settings as SettingsIcon, Wifi, WifiOff, Smartphone } from 'lucide-react';

// Simulated networks for development
const MOCK_NETWORKS = [
  'Moj WiFi',
  'ComNet_2.4G',
  'SBB_NET',
  'MTS_Box_2G',
  'A1_Network'
];

export function Navigation() {
  const location = useLocation();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [ssid, setSsid] = useState('');
  const [password, setPassword] = useState('');
  const [deviceIp, setDeviceIp] = useState('');
  const [scanning, setScanning] = useState(false);
  const [networks, setNetworks] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Funkcija za skeniranje WiFi mreža
  const scanNetworks = async () => {
    setScanning(true);
    setError(null);
    
    try {
      if (process.env.NODE_ENV === 'development') {
        await new Promise(resolve => setTimeout(resolve, 2000));
        setNetworks(MOCK_NETWORKS);
      } else {
        const response = await fetch(`http://${deviceIp}/scan`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setNetworks(data.networks);
      }
    } catch (error) {
      console.error('Грешка при скенирању мрежа:', error);
      setError('Није могуће скенирати мреже. Проверите да ли је уређај доступан.');
    } finally {
      setScanning(false);
    }
  };

  // Funkcija za povezivanje sa ESP8266
  const connectToESP = async () => {
    setError(null);
    try {
      if (process.env.NODE_ENV === 'development') {
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsConnected(true);
        localStorage.setItem('deviceIp', deviceIp);
      } else {
        const response = await fetch(`http://${deviceIp}/connect`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ssid, password }),
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        setIsConnected(true);
        localStorage.setItem('deviceIp', deviceIp);
      }
      setShowConnectionModal(false);
    } catch (error) {
      console.error('Грешка при повезивању:', error);
      setError('Није могуће повезати се са уређајем. Проверите IP адресу и покушајте поново.');
    }
  };

  // Proveri status povezanosti pri učitavanju
  useEffect(() => {
    const savedIp = localStorage.getItem('deviceIp');
    if (savedIp) {
      setDeviceIp(savedIp);
      if (process.env.NODE_ENV === 'development') {
        setIsConnected(Math.random() > 0.5);
      } else {
        fetch(`http://${savedIp}/status`)
          .then(response => response.json())
          .then(data => setIsConnected(data.connected))
          .catch(() => setIsConnected(false));
      }
    }
  }, []);

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <nav className="bg-white shadow-lg rounded-lg mt-4 p-2">
        <div className="flex flex-wrap justify-around items-center">
          <Link
            to="/"
            className={`flex items-center gap-2 p-3 rounded-md transition-colors ${
              isActive('/') ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Droplets className="w-5 h-5" />
            <span>Контролна табла</span>
          </Link>

          <Link
            to="/zones"
            className={`flex items-center gap-2 p-3 rounded-md transition-colors ${
              isActive('/zones') ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Map className="w-5 h-5" />
            <span>Зоне</span>
          </Link>

          <Link
            to="/history"
            className={`flex items-center gap-2 p-3 rounded-md transition-colors ${
              isActive('/history') ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <HistoryIcon className="w-5 h-5" />
            <span>Историја</span>
          </Link>

          <Link
            to="/settings"
            className={`flex items-center gap-2 p-3 rounded-md transition-colors ${
              isActive('/settings') ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <SettingsIcon className="w-5 h-5" />
            <span>Подешавања</span>
          </Link>

          <button
            onClick={() => setShowConnectionModal(true)}
            className="flex items-center gap-2 p-3 rounded-md transition-colors text-gray-600 hover:bg-gray-100"
          >
            {isConnected ? (
              <>
                <Wifi className="w-5 h-5 text-green-500" />
                <span className="text-green-600">Повезано</span>
              </>
            ) : (
              <>
                <WifiOff className="w-5 h-5 text-orange-500" />
                <span className="text-orange-600">Повежи се</span>
              </>
            )}
          </button>
        </div>
      </nav>

      {/* Connection Modal */}
      {showConnectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 m-4 max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Smartphone className="w-6 h-6 text-gray-600" />
                <h2 className="text-xl font-semibold">WiFi подешавања</h2>
              </div>
              <button
                onClick={() => setShowConnectionModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                  <li>Укључите мобилни хотспот на вашем телефону</li>
                  <li>Повежите се на "IrrigationSystem" WiFi мрежу са другог уређаја</li>
                  <li>Унесите IP адресу уређаја (обично 192.168.4.1)</li>
                  <li>Скенирајте доступне мреже</li>
                  <li>Изаберите ваш мобилни хотспот из листе</li>
                  <li>Унесите лозинку вашег хотспота</li>
                  <li>Кликните на "Повежи се"</li>
                </ol>
              </div>

              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                  <p className="text-red-700">{error}</p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label htmlFor="deviceIp" className="block text-sm font-medium text-gray-700">
                    IP адреса уређаја
                  </label>
                  <input
                    type="text"
                    id="deviceIp"
                    value={deviceIp}
                    onChange={(e) => setDeviceIp(e.target.value)}
                    placeholder="нпр. 192.168.4.1"
                    className="mt-1 block w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="ssid" className="block text-sm font-medium text-gray-700">
                    Изаберите ваш мобилни хотспот
                  </label>
                  <select
                    id="ssid"
                    value={ssid}
                    onChange={(e) => setSsid(e.target.value)}
                    className="mt-1 block w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Изаберите мрежу</option>
                    {networks.map((network) => (
                      <option key={network} value={network}>
                        {network}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={scanNetworks}
                    disabled={scanning}
                    className="mt-2 w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400"
                  >
                    {scanning ? 'Скенирање...' : 'Скенирај мреже'}
                  </button>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Лозинка хотспота
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 block w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => setShowConnectionModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  Откажи
                </button>
                <button
                  onClick={connectToESP}
                  disabled={!ssid || !password || !deviceIp}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-400"
                >
                  Повежи се
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}