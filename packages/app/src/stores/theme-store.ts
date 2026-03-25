import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ThemeName = 'command' | 'studio' | 'corporate'

export interface ThemeInfo {
  name: ThemeName
  label: string
  description: string
  accent: string
  surface: string
}

export const THEMES: ThemeInfo[] = [
  {
    name: 'command',
    label: 'Command',
    description: 'Dark cyberpunk, gold accent',
    accent: '#CA8A04',
    surface: '#1C1917',
  },
  {
    name: 'studio',
    label: 'Studio',
    description: 'Light cyan, collaborative',
    accent: '#0891B2',
    surface: '#FFFFFF',
  },
  {
    name: 'corporate',
    label: 'Corporate',
    description: 'Professional blue, enterprise',
    accent: '#2563EB',
    surface: '#FFFFFF',
  },
]

interface ThemeStore {
  theme: ThemeName
  setTheme: (theme: ThemeName) => void
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: 'command',
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
