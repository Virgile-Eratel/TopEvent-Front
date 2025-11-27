import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react"

import type { AuthResponse, AuthUser } from "@/app/features/auth/api/schema"
import {
  AUTH_TOKEN_STORAGE_KEY,
  clearAuthToken,
  getAuthToken,
  setAuthToken,
} from "@/shared/lib/http"

const AUTH_USER_STORAGE_KEY = "topevent:auth_user"

function readStoredUser(): AuthUser | null {
  if (typeof window === "undefined") {
    return null
  }

  const raw = window.localStorage.getItem(AUTH_USER_STORAGE_KEY)
  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

function writeStoredUser(user: AuthUser | null) {
  if (typeof window === "undefined") {
    return
  }

  if (!user) {
    window.localStorage.removeItem(AUTH_USER_STORAGE_KEY)
    return
  }

  window.localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user))
}

type AuthContextValue = {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  login: (auth: AuthResponse) => void
  logout: () => void
  updateUser: (user: AuthUser) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(() => readStoredUser())
  const [token, setToken] = useState<string | null>(() => getAuthToken())

  const login = useCallback((auth: AuthResponse) => {
    setAuthToken(auth.token)
    writeStoredUser(auth.user)
    setToken(auth.token)
    setUser(auth.user)
  }, [])

  const logout = useCallback(() => {
    clearAuthToken()
    writeStoredUser(null)
    setToken(null)
    setUser(null)
  }, [])

  const updateUser = useCallback((newUser: AuthUser) => {
      writeStoredUser(newUser)
      setUser(newUser)
  }, [])

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === AUTH_TOKEN_STORAGE_KEY) {
        setToken(getAuthToken())
      }

      if (event.key === AUTH_USER_STORAGE_KEY) {
        setUser(readStoredUser())
      }
    }

    window.addEventListener("storage", handleStorage)
    return () => window.removeEventListener("storage", handleStorage)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      login,
      logout,
      updateUser,
    }),
    [login, logout, updateUser, token, user]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }

  return context
}


