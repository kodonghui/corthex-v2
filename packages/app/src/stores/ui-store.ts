import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type UiState = {
  sidebarCollapsed: boolean
  mobileMenuOpen: boolean
  commandPaletteOpen: boolean

  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setMobileMenuOpen: (open: boolean) => void
  setCommandPaletteOpen: (open: boolean) => void
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      mobileMenuOpen: false,
      commandPaletteOpen: false,

      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
    }),
    {
      name: 'corthex-ui',
      partialize: (state) => ({ sidebarCollapsed: state.sidebarCollapsed }),
    }
  )
)
