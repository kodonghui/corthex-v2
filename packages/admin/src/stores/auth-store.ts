import { create } from 'zustand'

type AuthUser = {
  id: string
  name: string
  role: 'admin' | 'user'
}

type AuthState = {
  token: string | null
  user: AuthUser | null
  isAuthenticated: boolean
  login: (token: string, user: AuthUser) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('corthex_admin_token'),
  user: (() => { try { return JSON.parse(localStorage.getItem('corthex_admin_user') || 'null') } catch { return null } })(),
  isAuthenticated: !!localStorage.getItem('corthex_admin_token'),

  login: (token, user) => {
    localStorage.setItem('corthex_admin_token', token)
    localStorage.setItem('corthex_admin_user', JSON.stringify(user))
    set({ token, user, isAuthenticated: true })
  },

  logout: () => {
    localStorage.removeItem('corthex_admin_token')
    localStorage.removeItem('corthex_admin_user')
    set({ token: null, user: null, isAuthenticated: false })
  },
}))
