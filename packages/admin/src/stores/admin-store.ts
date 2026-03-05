import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type AdminState = {
  selectedCompanyId: string | null
  setSelectedCompanyId: (id: string) => void
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      selectedCompanyId: null,
      setSelectedCompanyId: (id) => set({ selectedCompanyId: id }),
    }),
    { name: 'corthex-admin-company' },
  ),
)
