import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ThemeName = 'sovereign' | 'imperial' | 'tactical' | 'mystic' | 'stealth'

export interface ThemeInfo {
  name: ThemeName
  label: string
  description: string
  accent: string
  surface: string
}

export const THEMES: ThemeInfo[] = [
  {
    name: 'sovereign',
    label: 'Sovereign Sage',
    description: 'Cyan & Slate dark',
    accent: '#22D3EE',
    surface: '#0F172A',
  },
  {
    name: 'imperial',
    label: 'Imperial Command',
    description: 'Imperial Red & Obsidian',
    accent: '#dc2626',
    surface: '#18181b',
  },
  {
    name: 'tactical',
    label: 'Tactical Ops',
    description: 'Military Green & Dark',
    accent: '#22c55e',
    surface: '#14201a',
  },
  {
    name: 'mystic',
    label: 'Mystic Depths',
    description: 'Deep Indigo & Purple',
    accent: '#6366f1',
    surface: '#111827',
  },
  {
    name: 'stealth',
    label: 'Stealth Mode',
    description: 'Minimal near-black',
    accent: '#a1a1aa',
    surface: '#111111',
  },
]

interface ThemeStore {
  theme: ThemeName
  setTheme: (theme: ThemeName) => void
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: 'sovereign',
      setTheme: (theme) => {
        set({ theme })
        document.documentElement.setAttribute('data-theme', theme)
      },
    }),
    {
      name: 'corthex-theme',
      onRehydrateStorage: () => (state) => {
        if (state?.theme) {
          document.documentElement.setAttribute('data-theme', state.theme)
        }
      },
    }
  )
)
