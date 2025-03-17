import { WateringSession } from '../types';

// Inicijalni podaci za demonstraciju
export const initialSessions: WateringSession[] = [
  {
    id: '1',
    zoneId: 'Нешков пластеник',
    startTime: new Date('2025-03-17T06:00:00'),
    endTime: new Date('2025-03-17T06:30:00'),
    waterUsage: 1250,
    automatic: true
  },
  {
    id: '2',
    zoneId: 'Башта',
    startTime: new Date('2024-03-20T07:00:00'),
    endTime: new Date('2024-03-20T07:45:00'),
    waterUsage: 200,
    automatic: false
  },
  {
    id: '3',
    zoneId: 'Травњак',
    startTime: new Date('2024-03-21T05:30:00'),
    endTime: new Date('2024-03-21T06:00:00'),
    waterUsage: 180,
    automatic: true
  }
];