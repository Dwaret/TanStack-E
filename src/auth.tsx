import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
// eslint-disable-next-line import/consistent-type-specifier-style
import { type ReactNode } from 'react'

type User = {
  id: number
  email: string
  username: string
  image: string
} | null

export interface AuthContext {
  isAuthenticated: boolean
  login: (user: User) => void
  logout: () => void
  user: User
}

const AuthContext = createContext<AuthContext | null>(null)

const key = 'tanstack.auth.user'

function getStoredUser() {
  const user = localStorage.getItem(key)
  return user ? JSON.parse(user) : ''
}

function setStoredUser(user: User) {
  if (user) {
    localStorage.setItem(key, JSON.stringify(user))
  } else {
    localStorage.removeItem(key)
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(getStoredUser())
  const isAuthenticated = !!user

  const logout = useCallback(() => {
    setStoredUser(null)
    setUser(null)
  }, [])

  const login = useCallback((currentUser: User) => {
    setStoredUser(currentUser)
    setUser(currentUser)
  }, [])

  useEffect(() => {
    setUser(getStoredUser())
  }, [])

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
