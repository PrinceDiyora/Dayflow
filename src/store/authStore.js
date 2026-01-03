import { create } from 'zustand'

// Simple localStorage persistence
const getStoredAuth = () => {
  try {
    const stored = localStorage.getItem('auth-storage')
    return stored ? JSON.parse(stored) : { user: null, token: null, isAuthenticated: false }
  } catch {
    return { user: null, token: null, isAuthenticated: false }
  }
}

const setStoredAuth = (state) => {
  try {
    localStorage.setItem('auth-storage', JSON.stringify(state))
  } catch (e) {
    console.error('Failed to save auth state', e)
  }
}

const initialState = getStoredAuth()

export const useAuthStore = create((set) => ({
  user: initialState.user,
  token: initialState.token,
  isAuthenticated: initialState.isAuthenticated,
  login: (user, token) => {
    const newState = { user, token, isAuthenticated: true }
    setStoredAuth(newState)
    set(newState)
  },
  logout: () => {
    const newState = { user: null, token: null, isAuthenticated: false }
    localStorage.removeItem('auth-storage')
    set(newState)
  },
  updateUser: (userData) => {
    set((state) => {
      const updatedUser = { ...state.user, ...userData }
      const newState = { ...state, user: updatedUser }
      setStoredAuth(newState)
      return newState
    })
  },
}))
