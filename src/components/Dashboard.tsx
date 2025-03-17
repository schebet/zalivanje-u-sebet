import React from 'react';
import { useIrrigationStore } from '../store/irrigationStore';
import { Droplets, Timer, History, AlertTriangle, Gauge, X, Bell, Info, AlertCircle, CheckCircle } from 'lucide-react';

export function Dashboard() {
  const { zones, activeZones, sessions, systemStatus, notifications, removeNotification } = useIrrigationStore();
  const toggleZone = useIrrigationStore((state) => state.toggleZone);

  const getPressureColor = (pressure: number) => {
    if (pressure < 0.5) return 'text-red-500';
    if (pressure < 2) return 'text-orange-500';
    if (pressure < 4) return 'text-green-500';
    return 'text-blue-500';
  };

  const getPressureStatus = (pressure: number) => {
    if (pressure < 0.5) return 'Критично низак';
    if (pressure < 2) return 'Низак';
    if (pressure < 4) return 'Оптималан';
    return 'Висок';
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'error':
        return 'bg-red-50 border-red-500';
      case 'warning':
        return 'bg-orange-50 border-orange-500';
      case 'success':
        return 'bg-green-50 border-green-500';
      default:
        return 'bg-blue-50 border-blue-500';
    }
  };

  // Calculate gauge parameters
  const radius = 80;
  const circumference = Math.PI * radius;
  const maxPressure = 5; // Maximum pressure in bars
  const pressurePercentage = (systemStatus.waterPressure / maxPressure) * 100;
  const angle = 180 - (pressurePercentage / 100) * 180; // Convert percentage to angle (180 to 0 degrees)

  // Generate gradient stops for the gauge background
  const gradientStops = [
    { offset: '0%', color: '#EF4444' },    // red-500
    { offset: '10%', color: '#EF4444' },   // red-500
    { offset: '20%', color: '#F97316' },   // orange-500
    { offset: '40%', color: '#F97316' },   // orange-500
    { offset: '60%', color: '#22C55E' },   // green-500
    { offset: '80%', color: '#22C55E' },   // green-500
    { offset: '90%', color: '#3B82F6' },   // blue-500
    { offset: '100%', color: '#3B82F6' },  // blue-500
  ];

  // Function to check if zone can be activated based on pressure
  const canActivateZone = (zoneName: string) => {
    const lowPressureZones = ['нешков пластеник', 'драгчетов цветни врт'];
    return lowPressureZones.some(zone => zoneName.toLowerCase().includes(zone)) || systemStatus.waterPressure >= 0.5;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Контролна табла</h1>
      
      {/* Notifications Section */}
      {notifications.length > 0 && (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`flex items-start p-4 rounded-lg border-l-4 ${getNotificationColor(notification.type)}`}
            >
              <div className="flex-shrink-0">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium">{notification.title}</h3>
                <div className="mt-1 text-sm">
                  <p>{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {notification.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => removeNotification(notification.id)}
                className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}
      
      {/* Pressure Warning */}
      {systemStatus.waterPressure < 0.5 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
          <div className="flex items-center">
            <AlertTriangle className="w-6 h-6 text-red-500 mr-3" />
            <div>
              <p className="text-red-700">
                Упозорење: Притисак воде је критично низак! Проверите довод воде.
              </p>
              <p className="text-red-700 text-sm mt-1">
                При овако ниском притиску можете имати проблем са веш машином.
              </p>
              <p className="text-sm text-green-700 mt-1 font-medium">
                Напомена: Зоне Нешков пластеник и Драгчетов цветни врт могу радити при ниском притиску
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Pressure Gauge Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-3 mb-4">
          <Gauge className="w-6 h-6 text-blue-500" />
          <h3 className="text-xl font-semibold">Притисак воде</h3>
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          {/* Gauge Display */}
          <div className="flex justify-center">
            <div className="relative w-[200px] h-[120px]">
              <svg width="200" height="120">
                {/* Gradient definition */}
                <defs>
                  <linearGradient id="gaugeGradient" x1="100%" y1="0%" x2="0%" y2="0%">
                    {gradientStops.map((stop, index) => (
                      <stop key={index} offset={stop.offset} stopColor={stop.color} />
                    ))}
                  </linearGradient>
                </defs>

                {/* Background arc */}
                <path
                  d="M 20,100 A 80,80 0 0 1 180,100"
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="12"
                  strokeLinecap="round"
                />

                {/* Colored arc */}
                <path
                  d="M 20,100 A 80,80 0 0 1 180,100"
                  fill="none"
                  stroke="url(#gaugeGradient)"
                  strokeWidth="12"
                  strokeLinecap="round"
                />

                {/* Needle */}
                <line
                  x1="100"
                  y1="100"
                  x2={100 + 70 * Math.cos(angle * Math.PI / 180)}
                  y2={100 - 70 * Math.sin(angle * Math.PI / 180)}
                  stroke="#3B82F6"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                {/* Center point */}
                <circle cx="100" cy="100" r="4" fill="#3B82F6" />

                {/* Markers */}
                {[0, 1, 2, 3, 4, 5].map((mark) => {
                  const markAngle = 180 - (mark / maxPressure) * 180;
                  const x = 100 + 80 * Math.cos(markAngle * Math.PI / 180);
                  const y = 100 - 80 * Math.sin(markAngle * Math.PI / 180);
                  return (
                    <g key={mark}>
                      <line
                        x1={x}
                        y1={y}
                        x2={x + 10 * Math.cos(markAngle * Math.PI / 180)}
                        y2={y - 10 * Math.sin(markAngle * Math.PI / 180)}
                        stroke="#6B7280"
                        strokeWidth="2"
                      />
                      <text
                        x={x + 20 * Math.cos(markAngle * Math.PI / 180)}
                        y={y - 20 * Math.sin(markAngle * Math.PI / 180)}
                        fill="#6B7280"
                        fontSize="12"
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        {mark}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Pressure Value */}
              <div className="absolute left-1/2 bottom-[-40px] transform -translate-x-1/2 text-center">
                <span className={`text-2xl font-bold ${getPressureColor(systemStatus.waterPressure)}`}>
                  {systemStatus.waterPressure.toFixed(1)}
                </span>
                <span className="text-sm text-gray-500 ml-1">bar</span>
              </div>
            </div>
          </div>

          {/* Status and Legend */}
          <div className="border-t pt-6">
            <div className="text-center mb-4">
              <p className="text-lg font-semibold text-gray-700">Статус притиска</p>
              <p className={`text-xl font-bold ${getPressureColor(systemStatus.waterPressure)}`}>
                {getPressureStatus(systemStatus.waterPressure)}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Ажурирано: {new Date(systemStatus.timestamp).toLocaleTimeString()}
              </p>
            </div>

            {/* Color legend */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-sm text-gray-600">Критично низак (0-0.5 bar)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500" />
                  <span className="text-sm text-gray-600">Низак (0.5-2 bar)</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-sm text-gray-600">Оптималан (2-4 bar)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-sm text-gray-600">Висок (4-5 bar)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {zones.map((zone) => (
          <div key={zone.id} className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-4">{zone.name}</h3>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">
                Статус: {activeZones.includes(zone.id) ? 'Активна' : 'Неактивна'}
              </span>
              <button
                onClick={() => toggleZone(zone.id)}
                className={`px-4 py-2 rounded-md ${
                  activeZones.includes(zone.id)
                    ? 'bg-red-500 hover:bg-red-600'
                    : canActivateZone(zone.name)
                    ? 'bg-green-500 hover:bg-green-600'
                    : 'bg-gray-300 cursor-not-allowed'
                } text-white`}
                disabled={!canActivateZone(zone.name)}
              >
                {activeZones.includes(zone.id) ? 'Искључи' : 'Укључи'}
              </button>
            </div>
            {systemStatus.waterPressure < 0.5 && (zone.name.toLowerCase().includes('нешков пластеник') || zone.name.toLowerCase().includes('драгчетов цветни врт')) && (
              <p className="text-sm text-green-600 mt-2 font-medium">
                Ова зона може радити при ниском притиску
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <Droplets className="w-6 h-6 text-blue-500" />
            <h3 className="text-xl font-semibold">Потрошња воде</h3>
          </div>
          <p className="text-2xl font-bold">
            {sessions.reduce((acc, session) => acc + session.waterUsage, 0)} л
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <Timer className="w-6 h-6 text-green-500" />
            <h3 className="text-xl font-semibold">Активни тајмери</h3>
          </div>
          <p className="text-2xl font-bold">
            {zones.reduce((acc, zone) => acc + zone.schedule.filter(s => s.active).length, 0)}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <History className="w-6 h-6 text-purple-500" />
            <h3 className="text-xl font-semibold">Укупно заливања</h3>
          </div>
          <p className="text-2xl font-bold">{sessions.length}</p>
        </div>
      </div>
    </div>
  );
}