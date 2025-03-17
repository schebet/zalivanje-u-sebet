import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SiteSettings } from '../types';

interface SiteSettingsState {
  settings: SiteSettings;
  updateSettings: (settings: Partial<SiteSettings>) => void;
}

export const useSiteSettingsStore = create<SiteSettingsState>()(
  persist(
    (set) => ({
      settings: {
        ogImage: '/images/og-default.jpg'
      },
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings }
        }))
    }),
    {
      name: 'site-settings'
    }
  )
);