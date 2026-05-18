import axios, { type AxiosInstance } from 'axios'
import useStore from '../store/useStore'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(
  (config) => {
    const token = useStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useStore.getState().logout()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authApi = {
  login: (username: string, password: string) =>
    api.post('/auth/login', { username, password }),

  register: (username: string, email: string, password: string, role: 'teacher' | 'student' = 'student') =>
    api.post('/auth/register', { username, email, password, role }),

  getProfile: () =>
    api.get('/auth/me'),

  refreshToken: () =>
    api.post('/auth/refresh'),

  deleteAccount: () =>
    api.delete('/auth/account'),

  updateProfile: (data: { username?: string; email?: string; phone?: string; avatar?: string }) =>
    api.put('/auth/profile', data),
}

export const classApi = {
  getClasses: () =>
    api.get('/classes/'),

  getClassDetail: (classId: number) =>
    api.get(`/classes/${classId}`),

  createClass: (name: string) =>
    api.post('/classes/', { name }),

  updateClass: (classId: number, name: string) =>
    api.put(`/classes/${classId}`, { name }),

  deleteClass: (classId: number) =>
    api.delete(`/classes/${classId}`),

  joinClass: (classId: number, inviteCode: string) =>
    api.post(`/classes/${classId}/join`, { invite_code: inviteCode }),

  getClassStatistics: (classId: number) =>
    api.get(`/classes/${classId}/statistics`),

  getClassRanking: (classId: number) =>
    api.get(`/classes/${classId}/ranking`),
}

export const groupApi = {
  getGroups: (classId?: number) =>
    api.get('/groups/', { params: { class_id: classId } }),

  getGroupDetail: (groupId: number) =>
    api.get(`/groups/${groupId}`),

  createGroup: (classId: number, name: string) =>
    api.post('/groups/', { class_id: classId, name }),

  updateGroup: (groupId: number, name: string) =>
    api.put(`/groups/${groupId}`, { name }),

  deleteGroup: (groupId: number) =>
    api.delete(`/groups/${groupId}`),

  getGroupMembers: (groupId: number) =>
    api.get(`/groups/${groupId}/members`),

  addMember: (groupId: number, userId: number) =>
    api.post(`/groups/${groupId}/members/${userId}`),

  removeMember: (groupId: number, userId: number) =>
    api.delete(`/groups/${groupId}/members/${userId}`),

  getGroupStatistics: (groupId: number) =>
    api.get(`/groups/${groupId}/statistics`),

  getGroupRanking: (classId: number) =>
    api.get('/groups/ranking', { params: { class_id: classId } }),
}

export const petApi = {
  getPets: () =>
    api.get('/pets/'),

  getPetDetail: (petId: number) =>
    api.get(`/pets/${petId}`),

  createPet: (groupId: number, name: string) =>
    api.post('/pets/', { group_id: groupId, name }),

  feedPet: (petId: number, itemId: number) =>
    api.put(`/pets/${petId}/feed`, { item_id: itemId }),

  playPet: (petId: number) =>
    api.put(`/pets/${petId}/play`),

  getPetPrivileges: (petId: number) =>
    api.get(`/pets/${petId}/privileges`),
}

export const taskApi = {
  getTasks: (classId?: number) =>
    api.get('/tasks/', { params: { class_id: classId } }),

  getTaskDetail: (taskId: number) =>
    api.get(`/tasks/${taskId}`),

  createTask: (data: {
    class_id: number
    title: string
    description: string
    task_type: string
    deadline: string
  }) => api.post('/tasks/', data),

  updateTask: (taskId: number, data: {
    title?: string
    description?: string
    deadline?: string
    status?: string
  }) => api.put(`/tasks/${taskId}`, data),

  deleteTask: (taskId: number) =>
    api.delete(`/tasks/${taskId}`),

  submitTask: (taskId: number, content: string) =>
    api.post(`/tasks/${taskId}/submit`, { content }),

  getSubmissions: (taskId: number) =>
    api.get(`/tasks/${taskId}/submissions`),

  gradeSubmission: (submissionId: number, score: number, feedback: string) =>
    api.put(`/tasks/submissions/${submissionId}/grade`, { score, feedback }),
}

export const goldApi = {
  getBalance: () =>
    api.get('/gold/balance'),

  getTransactions: () =>
    api.get('/gold/transactions'),

  earnGold: (amount: number, sourceType: string, description: string) =>
    api.post('/gold/earn', { amount, source_type: sourceType, description }),

  spendGold: (amount: number, description: string) =>
    api.post('/gold/spend', { amount, description }),

  getShopItems: () =>
    api.get('/gold/shop'),

  getShopItemDetail: (itemId: number) =>
    api.get(`/gold/shop/${itemId}`),

  purchaseItem: (itemId: number) =>
    api.post(`/gold/shop/${itemId}/purchase`),
}

export default api
