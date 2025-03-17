import React, { useState } from 'react';
import { useIrrigationStore } from '../store/irrigationStore';
import { Plus, Clock, Calendar, Trash2 } from 'lucide-react';

export function Zones() {
  const { zones, addZone, addSchedule, removeSchedule } = useIrrigationStore();
  const [newZoneName, setNewZoneName] = useState('');
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [scheduleForm, setScheduleForm] = useState({
    startTime: '06:00',
    duration: 30,
    days: [] as number[]
  });

  const handleAddZone = () => {
    if (newZoneName.trim()) {
      addZone({
        id: crypto.randomUUID(),
        name: newZoneName,
        active: false,
        schedule: []
      });
      setNewZoneName('');
    }
  };

  const handleAddSchedule = (zoneId: string) => {
    if (scheduleForm.days.length === 0) return;

    addSchedule({
      id: crypto.randomUUID(),
      zoneId,
      startTime: scheduleForm.startTime,
      duration: scheduleForm.duration,
      days: scheduleForm.days,
      active: true
    });

    setScheduleForm({
      startTime: '06:00',
      duration: 30,
      days: []
    });
  };

  const toggleDay = (day: number) => {
    setScheduleForm(prev => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day]
    }));
  };

  const getDayName = (day: number) => {
    const days = ['Нед', 'Пон', 'Уто', 'Сре', 'Чет', 'Пет', 'Суб'];
    return days[day];
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Зоне заливања</h1>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Додај нову зону</h2>
        <div className="flex gap-4">
          <input
            type="text"
            value={newZoneName}
            onChange={(e) => setNewZoneName(e.target.value)}
            placeholder="Име зоне"
            className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleAddZone}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            <Plus className="w-5 h-5" />
            <span>Додај</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {zones.map((zone) => (
          <div key={zone.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">{zone.name}</h3>
              <button
                onClick={() => setSelectedZone(selectedZone === zone.id ? null : zone.id)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                <Clock className="w-5 h-5" />
                <span>Распоред</span>
              </button>
            </div>

            {selectedZone === zone.id && (
              <div className="space-y-6 border-t pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-4">Нови распоред</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Време почетка
                        </label>
                        <input
                          type="time"
                          value={scheduleForm.startTime}
                          onChange={(e) => setScheduleForm(prev => ({
                            ...prev,
                            startTime: e.target.value
                          }))}
                          className="px-4 py-2 border rounded-md w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Трајање (минути)
                        </label>
                        <input
                          type="number"
                          value={scheduleForm.duration}
                          onChange={(e) => setScheduleForm(prev => ({
                            ...prev,
                            duration: parseInt(e.target.value)
                          }))}
                          min="1"
                          max="180"
                          className="px-4 py-2 border rounded-md w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Дани
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {[0, 1, 2, 3, 4, 5, 6].map((day) => (
                            <button
                              key={day}
                              onClick={() => toggleDay(day)}
                              className={`px-3 py-1 rounded-md text-sm ${
                                scheduleForm.days.includes(day)
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {getDayName(day)}
                            </button>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={() => handleAddSchedule(zone.id)}
                        disabled={scheduleForm.days.length === 0}
                        className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-300"
                      >
                        Додај распоред
                      </button>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-4">Активни распореди</h4>
                    <div className="space-y-4">
                      {zone.schedule.map((schedule) => (
                        <div
                          key={schedule.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-md"
                        >
                          <div>
                            <p className="font-medium">{schedule.startTime}</p>
                            <p className="text-sm text-gray-600">
                              {schedule.duration} минута
                            </p>
                            <p className="text-sm text-gray-600">
                              {schedule.days.map(d => getDayName(d)).join(', ')}
                            </p>
                          </div>
                          <button
                            onClick={() => removeSchedule(zone.id, schedule.id)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                      {zone.schedule.length === 0 && (
                        <p className="text-gray-500 text-center py-4">
                          Нема активних распореда
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}