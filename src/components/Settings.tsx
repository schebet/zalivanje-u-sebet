import React, { useState, useRef } from 'react';
import { Bell, Database, Shield, HelpCircle, Download, Upload, Power, Wifi, Image } from 'lucide-react';
import { downloadBackup, uploadBackup } from '../utils/backup';
import { useIrrigationStore } from '../store/irrigationStore';
import { useSiteSettingsStore } from '../store/siteSettingsStore';
import { faqData } from '../data/faq';

export function Settings() {
  const [activeTab, setActiveTab] = useState('notifications');
  const [backupError, setBackupError] = useState<string | null>(null);
  const [backupSuccess, setBackupSuccess] = useState<string | null>(null);
  const [backupInterval, setBackupInterval] = useState('weekly');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { notificationSettings, updateNotificationSettings, systemStatus, updateSystemStatus } = useIrrigationStore();
  const { settings: siteSettings, updateSettings } = useSiteSettingsStore();

  const handleBackupUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setBackupError(null);
      setBackupSuccess(null);
      await uploadBackup(file);
      setBackupSuccess('Бекап је успешно враћен');
    } catch (error) {
      setBackupError(error instanceof Error ? error.message : 'Грешка при враћању бекапа');
    }
  };

  const handleNotificationToggle = (setting: keyof typeof notificationSettings) => {
    updateNotificationSettings({
      [setting]: !notificationSettings[setting]
    });
  };

  const handleOperationModeChange = (mode: 'automatic' | 'online') => {
    updateSystemStatus({ operationMode: mode });
  };

  const handleOgImageChange = (image: string) => {
    updateSettings({ ogImage: image });
    // Update meta tag
    const metaOgImage = document.querySelector('meta[property="og:image"]');
    if (metaOgImage) {
      metaOgImage.setAttribute('content', window.location.origin + image);
    }
  };

  const availableOgImages = [
    { path: '/images/og-default.jpg', name: 'Подразумевана слика' },
    { path: '/images/og-dashboard.jpg', name: 'Контролна табла' },
    { path: '/images/og-zones.jpg', name: 'Зоне заливања' },
    { path: '/images/og-mobile.jpg', name: 'Мобилна апликација' }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Подешавања</h1>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('notifications')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'notifications'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              <span>Обавештења</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('operation')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'operation'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Power className="w-5 h-5" />
              <span>Режим рада</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('social')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'social'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Image className="w-5 h-5" />
              <span>Друштвене мреже</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'backup'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              <span>Бекап</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'security'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <span>Сигурност</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('help')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'help'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5" />
              <span>Помоћ</span>
            </div>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {/* Social Media Tab */}
        {activeTab === 'social' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-6">Подешавања друштвених мрежа</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Facebook слика за дељење</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Изаберите слику која ће се приказивати када делите ваш сајт на Facebook-у
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {availableOgImages.map((image) => (
                      <div
                        key={image.path}
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${
                          siteSettings.ogImage === image.path
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-200'
                        }`}
                        onClick={() => handleOgImageChange(image.path)}
                      >
                        <div className="aspect-video bg-gray-100 rounded-md mb-2 overflow-hidden">
                          <img
                            src={image.path}
                            alt={image.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <p className="text-sm font-medium text-center">{image.name}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 p-4 bg-gray-50 rounded-md">
                    <h4 className="font-medium mb-2">Препоруке за слике</h4>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                      <li>Оптимална величина: 1200 x 630 пиксела</li>
                      <li>Формат: JPG или PNG</li>
                      <li>Максимална величина: 8MB</li>
                      <li>Однос страница: 1.91:1</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-6">Подешавања обавештења</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Системска обавештења</h3>
                    <p className="text-sm text-gray-500">Обавештења о статусу система</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={notificationSettings.systemAlerts}
                      onChange={() => handleNotificationToggle('systemAlerts')}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Обавештења о заливању</h3>
                    <p className="text-sm text-gray-500">Када се заливање покрене/заустави</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={notificationSettings.wateringEvents}
                      onChange={() => handleNotificationToggle('wateringEvents')}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Упозорења о притиску</h3>
                    <p className="text-sm text-gray-500">Када притисак падне испод нормале</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={notificationSettings.pressureWarnings}
                      onChange={() => handleNotificationToggle('pressureWarnings')}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Дневни извештај</h3>
                    <p className="text-sm text-gray-500">Дневни преглед активности система</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={notificationSettings.dailyReport}
                      onChange={() => handleNotificationToggle('dailyReport')}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Operation Mode Tab */}
        {activeTab === 'operation' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-6">Режим рада система</h2>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => handleOperationModeChange('automatic')}
                    className={`p-6 rounded-lg border-2 transition-all ${
                      systemStatus.operationMode === 'automatic'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-200'
                    }`}
                  >
                    <Power className={`w-8 h-8 mb-4 ${
                      systemStatus.operationMode === 'automatic' ? 'text-blue-500' : 'text-gray-400'
                    }`} />
                    <h3 className="text-lg font-medium mb-2">Аутоматски режим</h3>
                    <p className="text-sm text-gray-600">
                      Систем ради према унапред дефинисаном распореду заливања. 
                      Идеално за редовно одржавање и када нисте у могућности да 
                      ручно контролишете систем.
                    </p>
                  </button>

                  <button
                    onClick={() => handleOperationModeChange('online')}
                    className={`p-6 rounded-lg border-2 transition-all ${
                      systemStatus.operationMode === 'online'
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-green-200'
                    }`}
                  >
                    <Wifi className={`w-8 h-8 mb-4 ${
                      systemStatus.operationMode === 'online' ? 'text-green-500' : 'text-gray-400'
                    }`} />
                    <h3 className="text-lg font-medium mb-2">Онлајн режим</h3>
                    <p className="text-sm text-gray-600">
                      Директна контрола система преко интернета. Омогућава вам да 
                      ручно управљате заливањем у реалном времену са било које локације.
                    </p>
                  </button>
                </div>

                <div className="bg-blue-50 p-4 rounded-md">
                  <h3 className="font-medium mb-2">Напомена</h3>
                  <p className="text-sm text-blue-600">
                    Промена режима рада ће утицати на начин на који систем функционише. 
                    У аутоматском режиму, систем ће пратити распоред, док у онлајн режиму 
                    можете ручно контролисати заливање.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Backup Tab */}
        {activeTab === 'backup' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-6">Подешавања бекапа</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Интервал аутоматског бекапа
                  </label>
                  <select
                    value={backupInterval}
                    onChange={(e) => setBackupInterval(e.target.value)}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="daily">Дневно</option>
                    <option value="weekly">Недељно</option>
                    <option value="monthly">Месечно</option>
                  </select>
                </div>

                {backupError && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                    <p className="text-red-700">{backupError}</p>
                  </div>
                )}

                {backupSuccess && (
                  <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-md">
                    <p className="text-green-700">{backupSuccess}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={downloadBackup}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    <Download className="w-5 h-5" />
                    Преузми бекап
                  </button>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                  >
                    <Upload className="w-5 h-5" />
                    Учитај бекап
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleBackupUpload}
                    accept=".json"
                    className="hidden"
                  />
                </div>

                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="font-medium mb-2">Садржај бекапа</h3>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    <li>Подешавања зона за заливање</li>
                    <li>Распореди заливања</li>
                    <li>Историја заливања</li>
                    <li>Подешавања обавештења</li>
                    <li>Општа подешавања система</li>
                  </ul>
                </div>

                <div className="bg-blue-50 p-4 rounded-md">
                  <h3 className="font-medium mb-2">Напомена</h3>
                  <p className="text-sm text-blue-600">
                    Препоручујемо да редовно правите бекап ваших подешавања. 
                    Бекап фајл садржи сва подешавања система и можете га користити 
                    за враћање система у претходно стање или пренос на други уређај.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-6">Сигурносна подешавања</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Двофакторска аутентификација</h3>
                    <p className="text-sm text-gray-500">Додатни слој заштите за ваш налог</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Обавештења о пријави</h3>
                    <p className="text-sm text-gray-500">Примајте обавештења о новим пријавама</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Help Tab */}
        {activeTab === 'help' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-6">Помоћ и подршка</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-2">Често постављана питања</h3>
                  <div className="space-y-4">
                    {faqData.map((faq, index) => (
                      <details key={index} className="group">
                        <summary className="flex justify-between items-center font-medium cursor-pointer list-none">
                          <span>{faq.question}</span>
                          <span className="transition group-open:rotate-180">
                            <svg fill="none" height="24" shape-rendering="geometricPrecision" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                          </span>
                        </summary>
                        <p className="text-gray-600 mt-3">{faq.answer}</p>
                      </details>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Контакт подршка</h3>
                  <p className="text-gray-600">
                    За додатну помоћ контактирајте нашу подршку:
                  </p>
                  <ul className="mt-2 space-y-2 text-gray-600">
                    <li>Email: podrska@irrigation.com</li>
                    <li>Телефон: +381 11 123 4567</li>
                    <li>Радно време: Пон-Пет 09:00-17:00</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}