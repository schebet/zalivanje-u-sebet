import React from 'react';
import { useIrrigationStore } from '../store/irrigationStore';
import { format } from 'date-fns';
import { sr } from 'date-fns/locale';

export function History() {
  const { sessions } = useIrrigationStore();

  // Headers for the transposed table
  const headers = ['Датум', 'Зона', 'Трајање', 'Потрошња воде', 'Тип'];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Историја заливања</h1>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <tbody className="bg-white divide-y divide-gray-200">
              {/* Date Row */}
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                  {headers[0]}
                </th>
                {sessions.map((session) => (
                  <td key={`date-${session.id}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {format(session.startTime, 'dd.MM.yyyy HH:mm', { locale: sr })}
                  </td>
                ))}
              </tr>

              {/* Zone Row */}
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                  {headers[1]}
                </th>
                {sessions.map((session) => (
                  <td key={`zone-${session.id}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {session.zoneId}
                  </td>
                ))}
              </tr>

              {/* Duration Row */}
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {headers[2]}
                </th>
                {sessions.map((session) => (
                  <td key={`duration-${session.id}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {format(
                      new Date(session.endTime.getTime() - session.startTime.getTime()),
                      'HH:mm:ss',
                      { locale: sr }
                    )}
                  </td>
                ))}
              </tr>

              {/* Water Usage Row */}
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                  {headers[3]}
                </th>
                {sessions.map((session) => (
                  <td key={`usage-${session.id}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {session.waterUsage} л
                  </td>
                ))}
              </tr>

              {/* Type Row */}
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {headers[4]}
                </th>
                {sessions.map((session) => (
                  <td key={`type-${session.id}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {session.automatic ? 'Аутоматско' : 'Ручно'}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {sessions.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Нема забележених заливања
          </div>
        )}
      </div>
    </div>
  );
}