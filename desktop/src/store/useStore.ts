import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: number
  username: string
  email: string
  phone?: string
  role: 'teacher' | 'student'
  is_active: boolean
  avatar?: string
}

interface Group {
  id: number
  name: string
  class_id: number
  class_name: string
  gold_balance: number
  growth_value: number
  health_value: number
  member_count: number
}

interface Pet {
  id: number
  name: string
  level: number
  growth_value: number
  health_value: number
  hunger: number
  happiness: number
  max_growth: number
  status: 'happy' | 'normal' | 'sad' | 'sleeping'
}

interface Task {
  id: number
  title: string
  description: string
  task_type: 'homework' | 'preview' | 'project' | 'quiz'
  deadline: string
  status: 'draft' | 'published' | 'closed'
  class_name: string
}

interface AppState {
  user: User | null
  token: string | null
  currentGroup: Group | null
  currentPet: Pet | null
  tasks: Task[]
  goldBalance: number
  rememberMe: boolean
  petWindowVisible: boolean

  setUser: (user: User) => void
  setToken: (token: string) => void
  setCurrentGroup: (group: Group) => void
  setCurrentPet: (pet: Pet) => void
  setTasks: (tasks: Task[]) => void
  setGoldBalance: (balance: number) => void
  setRememberMe: (remember: boolean) => void
  setPetWindowVisible: (visible: boolean) => void
  logout: () => void
  clearAllData: () => void
  
  // 宠物交互方法
  feedPet: (foodType: 'normal' | 'delicious' | 'special') => void
  playPet: () => void
  updatePetStatus: () => void
}

const useStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      currentGroup: null,
      currentPet: null,
      tasks: [],
      goldBalance: 0,
      rememberMe: false,
      petWindowVisible: false,

      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setCurrentGroup: (group) => set({ currentGroup: group }),
      setCurrentPet: (pet) => set({ currentPet: pet }),
      setTasks: (tasks) => set({ tasks }),
      setGoldBalance: (balance) => set({ goldBalance: balance }),
      setRememberMe: (remember) => set({ rememberMe: remember }),
      setPetWindowVisible: (visible: boolean) => set({ petWindowVisible: visible }),
      logout: () => set({
        user: null, 
        token: null, 
        currentGroup: null, 
        currentPet: null, 
        tasks: [], 
        goldBalance: 0,
        rememberMe: false 
      }),
      clearAllData: () => set({ 
        user: null, 
        token: null, 
        currentGroup: null, 
        currentPet: null, 
        tasks: [], 
        goldBalance: 0,
        rememberMe: false 
      }),
      
      // 宠物交互方法
      feedPet: (foodType) => set((state) => {
        if (!state.currentPet) return state
        
        const foodEffects = {
          normal: { hunger: 20, health: 5, growth: 2, cost: 5 },
          delicious: { hunger: 40, health: 10, growth: 5, cost: 15 },
          special: { hunger: 60, health: 20, growth: 10, cost: 30 },
        }
        
        const effect = foodEffects[foodType]
        if (state.goldBalance < effect.cost) return state
        
        const newHunger = Math.min(100, state.currentPet.hunger + effect.hunger)
        const newHealth = Math.min(100, state.currentPet.health_value + effect.health)
        let newGrowth = state.currentPet.growth_value + effect.growth
        let newLevel = state.currentPet.level
        let newMaxGrowth = state.currentPet.max_growth
        
        // 检查升级
        while (newGrowth >= newMaxGrowth) {
          newGrowth -= newMaxGrowth
          newLevel += 1
          newMaxGrowth = Math.floor(newMaxGrowth * 1.5)
        }
        
        return {
          currentPet: {
            ...state.currentPet,
            hunger: newHunger,
            health_value: newHealth,
            growth_value: newGrowth,
            level: newLevel,
            max_growth: newMaxGrowth,
          },
          goldBalance: state.goldBalance - effect.cost,
        }
      }),
      
      playPet: () => set((state) => {
        if (!state.currentPet) return state
        
        const playCost = 3
        if (state.goldBalance < playCost) return state
        
        const newHappiness = Math.min(100, state.currentPet.happiness + 15)
        const newHealth = Math.min(100, state.currentPet.health_value + 5)
        const newGrowth = state.currentPet.growth_value + 3
        const newHunger = Math.max(0, state.currentPet.hunger - 10)
        
        return {
          currentPet: {
            ...state.currentPet,
            happiness: newHappiness,
            health_value: newHealth,
            growth_value: newGrowth,
            hunger: newHunger,
          },
          goldBalance: state.goldBalance - playCost,
        }
      }),
      
      updatePetStatus: () => set((state) => {
        if (!state.currentPet) return state
        
        let status: 'happy' | 'normal' | 'sad' | 'sleeping' = 'normal'
        const avgStatus = (state.currentPet.hunger + state.currentPet.happiness + state.currentPet.health_value) / 3
        
        if (avgStatus > 70) status = 'happy'
        else if (avgStatus < 30) status = 'sad'
        
        return {
          currentPet: {
            ...state.currentPet,
            status,
          },
        }
      }),
    }),
    {
      name: 'pet-companion-storage',
      partialize: (state) => ({
        user: state.rememberMe ? state.user : null,
        token: state.rememberMe ? state.token : null,
        rememberMe: state.rememberMe,
        currentPet: state.currentPet,
        currentGroup: state.currentGroup,
        goldBalance: state.goldBalance,
        petWindowVisible: state.petWindowVisible,
      }),
    }
  )
)

export default useStore
export type { User, Group, Pet, Task }
