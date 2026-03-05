import { create } from 'zustand'
import { api } from '../lib/api'

type AuthUser = {
  id: string
  name: string
  role: 'admin' | 'user'
  companyId: string
}

type AuthState = {
  token: string | null
  user: AuthUser | null
  isAuthenticated: boolean
  isChecking: boolean
  login: (token: string, user: AuthUser) => void
  logout: () => void
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: localStorage.getItem('corthex_token'),
  user: JSON.parse(localStorage.getItem('corthex_user') || 'null'),
  isAuthenticated: !!localStorage.getItem('corthex_token'),
  isChecking: false,

  login: (token, user) => {
    localStorage.setItem('corthex_token', token)
    localStorage.setItem('corthex_user', JSON.stringify(user))
    set({ token, user, isAuthenticated: true })
  },

  logout: () => {
    localStorage.removeItem('corthex_token')
    localStorage.removeItem('corthex_user')
    set({ token: null, user: null, isAuthenticated: false })
  },

  checkAuth: async () => {
    const token = get().token
    if (!token) {
      set({ isAuthenticated: false, user: null })
      return
    }
    set({ isChecking: true })
    try {
      const res = await api.get<{ data: { id: string; name: string; role: 'admin' | 'user'; companyId: string } }>('/auth/me')
      const user = res.data
      localStorage.setItem('corthex_user', JSON.stringify(user))
      set({ user, isAuthenticated: true, isChecking: false })
    } catch {
      set({ token: null, user: null, isAuthenticated: false, isChecking: false })
      localStorage.removeItem('corthex_token')
      localStorage.removeItem('corthex_user')
    }
  },
}))
