import { BackupData } from '../types';
import { useIrrigationStore } from '../store/irrigationStore';

export const createBackup = (): BackupData => {
  const state = useIrrigationStore.getState();
  
  const backup: BackupData = {
    version: '1.0',
    timestamp: new Date().toISOString(),
    data: {
      zones: state.zones,
      sessions: state.sessions,
      settings: {
        notifications: {
          systemAlerts: true,
          wateringEvents: true,
          pressureWarnings: true,
          dailyReport: false
        },
        backupInterval: 'weekly'
      }
    }
  };

  return backup;
};

export const restoreBackup = (backupData: BackupData) => {
  const state = useIrrigationStore.getState();
  
  // Restore zones
  state.zones = backupData.data.zones;
  
  // Restore sessions
  state.sessions = backupData.data.sessions.map(session => ({
    ...session,
    startTime: new Date(session.startTime),
    endTime: new Date(session.endTime)
  }));
};

export const downloadBackup = () => {
  const backup = createBackup();
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `irrigation-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const uploadBackup = async (file: File): Promise<void> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const backupData = JSON.parse(e.target?.result as string) as BackupData;
        
        // Validate backup data
        if (!backupData.version || !backupData.timestamp || !backupData.data) {
          throw new Error('Неисправан формат бекап фајла');
        }
        
        restoreBackup(backupData);
        resolve();
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Грешка при читању фајла'));
    reader.readAsText(file);
  });
};