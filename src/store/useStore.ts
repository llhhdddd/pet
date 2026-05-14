import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import axios from 'axios'

const API_BASE_URL = '/api/v1'
const SESSION_TIMEOUT = 60 * 60 * 1000

interface User {
  id: number
  username: string
  role: 'student' | 'teacher'
  email?: string
  phone?: string
  is_verified?: boolean
}

interface Pet {
  id: number
  name: string
  level: number
  growth: number
  health: number
  hunger: number
  happiness: number
}

interface Group {
  id: number
  name: string
  members_count: number
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  currentRole: 'student' | 'teacher' | null
  rememberedRole: 'student' | 'teacher' | null
  lastActivity: number | null
}

interface StoreState extends AuthState {
  currentPet: Pet | null
  currentGroup: Group | null
  goldBalance: number

  login: (credentials: { username: string; password: string }) => Promise<{ success: boolean; error?: string }>
  register: (data: { username: string; password: string; email: string; role: string; phone?: string }) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  selectRole: (role: 'student' | 'teacher') => void
  checkAuth: () => Promise<boolean>
  updateLastActivity: () => void

  updatePet: (pet: Partial<Pet>) => void
  updateGold: (amount: number) => void
  setGroup: (group: Group | null) => void
  updateUser: (user: Partial<User>) => void
}

const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      currentRole: null,
      rememberedRole: null,
      lastActivity: null,
      currentPet: {
        id: 1,
        name: '小橘',
        level: 1,
        growth: 0,
        health: 100,
        hunger: 80,
        happiness: 90,
      },
      currentGroup: null,
      goldBalance: 0,

      login: async (credentials) => {
        set({ isLoading: true })
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/login`, credentials)
          const { access_token } = response.data

          const userResponse = await axios.get(`${API_BASE_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${access_token}` }
          })

          const user = userResponse.data
          const rememberedRole = get().rememberedRole

          set({
            token: access_token,
            user,
            isAuthenticated: true,
            isLoading: false,
            currentRole: rememberedRole || user.role,
            lastActivity: Date.now(),
          })

          axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`

          return { success: true }
        } catch (error: any) {
          set({ isLoading: false })
          const message = error.response?.data?.detail || '登录失败'
          return { success: false, error: message }
        }
      },

      register: async (data) => {
        set({ isLoading: true })
        try {
          await axios.post(`${API_BASE_URL}/auth/register`, data)
          set({ isLoading: false })
          return { success: true }
        } catch (error: any) {
          set({ isLoading: false })
          const message = error.response?.data?.detail || '注册失败'
          return { success: false, error: message }
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          currentRole: null,
          lastActivity: null,
          currentPet: {
            id: 1,
            name: '小橘',
            level: 1,
            growth: 0,
            health: 100,
            hunger: 80,
            happiness: 90,
          },
          currentGroup: null,
        })
        delete axios.defaults.headers.common['Authorization']
      },

      selectRole: (role) => {
        const { token, user } = get()
        if (token && user) {
          set({ currentRole: role, rememberedRole: role, lastActivity: Date.now() })
        }
      },

      updateLastActivity: () => {
        const { token, isAuthenticated } = get()
        if (token && isAuthenticated) {
          set({ lastActivity: Date.now() })
        }
      },

      checkAuth: async () => {
        const { token, lastActivity } = get()

        if (!token) return false

        if (lastActivity && Date.now() - lastActivity > SESSION_TIMEOUT) {
          get().logout()
          return false
        }

        try {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
          const response = await axios.get(`${API_BASE_URL}/auth/verify-token`)
          const userData = response.data

          set({
            user: {
              id: userData.user_id,
              username: userData.username,
              role: userData.role,
            } as User,
            isAuthenticated: true,
            lastActivity: Date.now(),
          })

          return true
        } catch {
          set({
            token: null,
            user: null,
            isAuthenticated: false,
            lastActivity: null,
          })
          delete axios.defaults.headers.common['Authorization']
          return false
        }
      },

      updatePet: (petData) => {
        set((state) => ({
          currentPet: state.currentPet ? { ...state.currentPet, ...petData } : null,
        }))
      },

      updateGold: (amount) => {
        set((state) => ({ goldBalance: state.goldBalance + amount }))
      },

      setGroup: (group) => {
        set({ currentGroup: group })
      },

      updateUser: (userData) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        }))
      },
    }),
    {
      name: 'pet-web-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        rememberedRole: state.rememberedRole,
        lastActivity: state.lastActivity,
        currentPet: state.currentPet,
        goldBalance: state.goldBalance,
      }),
    }
  )
)

export default useStore

export const requireAuth = () => {
  const { isAuthenticated, token } = useStore.getState()
  if (!isAuthenticated || !token) {
    throw new Error('Unauthorized')
  }
}

export const requireRole = (role: 'student' | 'teacher') => {
  const { currentRole } = useStore.getState()
  if (currentRole !== role) {
    throw new Error('Forbidden')
  }
}