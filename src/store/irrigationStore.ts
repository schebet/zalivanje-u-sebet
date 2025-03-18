import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Zone, Schedule, WateringSession, SystemStatus, Notification, NotificationSettings } from '../types';
import { initialSessions } from '../data/sessions';

interface IrrigationState {
  zones: Zone[];
  sessions: WateringSession[];
  activeZones: string[];
  notifications: Notification[];
  notificationSettings: NotificationSettings;
  systemStatus: SystemStatus;
  addZone: (zone: Zone) => void;
  toggleZone: (zoneId: string) => void;
  addSchedule: (schedule: Schedule) => void;
  removeSchedule: (zoneId: string, scheduleId: string) => void;
  addSession: (session: WateringSession) => void;
  updateSystemStatus: (status: Partial<SystemStatus>) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => void;
}

const defaultZone: Zone = {
  id: 'neskov-plastenik',
  name: 'Нешков пластеник',
  active: false,
  schedule: []
};

export const useIrrigationStore = create<IrrigationState>()(
  persist(
    (set) => ({
      zones: [defaultZone],
      sessions: initialSessions,
      activeZones: [],
      notifications: [],
      notificationSettings: {
        systemAlerts: true,
        wateringEvents: true,
        pressureWarnings: true,
        dailyReport: false
      },
      systemStatus: {
        waterPressure: 0,
        timestamp: new Date().toISOString(),
        operationMode: 'automatic'
      },
      addZone: (zone) =>
        set((state) => {
          // Prevent duplicate zones and ensure default zone is always present
          const existingZone = state.zones.find(z => z.id === zone.id);
          if (existingZone) return state;

          return { 
            zones: [
              defaultZone,
              ...state.zones.filter(z => z.id !== defaultZone.id),
              zone
            ]
          };
        }),
      toggleZone: (zoneId) =>
        set((state) => {
          const newActiveZones = state.activeZones.includes(zoneId)
            ? state.activeZones.filter((id) => id !== zoneId)
            : [...state.activeZones, zoneId];

          if (state.notificationSettings.wateringEvents) {
            const zone = state.zones.find(z => z.id === zoneId);
            if (zone) {
              const isActivating = !state.activeZones.includes(zoneId);
              state.addNotification({
                type: 'info',
                title: isActivating ? 'Зона активирана' : 'Зона деактивирана',
                message: `Зона "${zone.name}" је ${isActivating ? 'укључена' : 'искључена'}`
              });
            }
          }

          return { activeZones: newActiveZones };
        }),
      addSchedule: (schedule) =>
        set((state) => ({
          zones: state.zones.map((zone) =>
            zone.id === schedule.zoneId
              ? { ...zone, schedule: [...zone.schedule, schedule] }
              : zone
          ),
        })),
      removeSchedule: (zoneId, scheduleId) =>
        set((state) => ({
          zones: state.zones.map((zone) =>
            zone.id === zoneId
              ? { ...zone, schedule: zone.schedule.filter(s => s.id !== scheduleId) }
              : zone
          ),
        })),
      addSession: (session) =>
        set((state) => ({
          sessions: [...state.sessions, session],
        })),
      updateSystemStatus: (status) =>
        set((state) => {
          const newStatus = {
            ...state.systemStatus,
            ...status,
            timestamp: new Date().toISOString()
          };

          if (state.notificationSettings.pressureWarnings) {
            if (newStatus.waterPressure < 0.5 && state.systemStatus.waterPressure >= 0.5) {
              state.addNotification({
                type: 'error',
                title: 'Критично низак притисак',
                message: 'Притисак воде је пао испод критичног нивоа. Проверите довод воде.'
              });
            } else if (newStatus.waterPressure < 2 && state.systemStatus.waterPressure >= 2) {
              state.addNotification({
                type: 'warning',
                title: 'Низак притисак',
                message: 'Притисак воде је низак. Могући проблеми са радом система.'
              });
            }
          }

          return { systemStatus: newStatus };
        }),
      addNotification: (notification) =>
        set((state) => ({
          notifications: [
            ...state.notifications,
            {
              ...notification,
              id: crypto.randomUUID(),
              timestamp: new Date()
            }
          ].map(n => ({
            ...n,
            timestamp: n.timestamp instanceof Date ? n.timestamp : new Date(n.timestamp)
          }))
        })),
      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id)
        })),
      updateNotificationSettings: (settings) =>
        set((state) => ({
          notificationSettings: {
            ...state.notificationSettings,
            ...settings
          }
        }))
    }),
    {
      name: 'irrigation-storage',
      deserialize: (str) => {
        const parsed = JSON.parse(str);
        // Ensure default zone is always present after loading from storage
        if (!parsed.zones?.some((z: Zone) => z.id === defaultZone.id)) {
          parsed.zones = [defaultZone, ...(parsed.zones || [])];
        }
        return {
          ...parsed,
          notifications: parsed.notifications.map((n: any) => ({
            ...n,
            timestamp: new Date(n.timestamp)
          }))
        };
      }
    }
  )
);
