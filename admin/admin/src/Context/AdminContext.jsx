import { createContext, useEffect, useState } from 'react'
import { apiFetch } from '../utils/api'

export const AdminContext = createContext(null)

const adminTokenStorageKey = 'foodDeliveryAdminToken'

const AdminContextProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem(adminTokenStorageKey) || '')
  const [adminUser, setAdminUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(Boolean(localStorage.getItem(adminTokenStorageKey)))

  const persistToken = (nextToken) => {
    if (nextToken) {
      localStorage.setItem(adminTokenStorageKey, nextToken)
    } else {
      localStorage.removeItem(adminTokenStorageKey)
    }

    setToken(nextToken)
  }

  const logout = () => {
    persistToken('')
    setAdminUser(null)
    setAuthLoading(false)
  }

  const loadAdminProfile = async (sessionToken = token) => {
    if (!sessionToken) {
      setAdminUser(null)
      setAuthLoading(false)
      return null
    }

    setAuthLoading(true)

    try {
      const { response, result } = await apiFetch('/api/admin/me', {
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
      })

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Unable to verify admin session.')
      }

      setAdminUser(result.admin)
      return result.admin
    } catch {
      logout()
      return null
    } finally {
      setAuthLoading(false)
    }
  }

  const login = async ({ email, password }) => {
    const { response, result } = await apiFetch('/api/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Unable to login as admin.')
    }

    persistToken(result.token)
    setAdminUser(result.admin)
    setAuthLoading(false)
    return result.admin
  }

  useEffect(() => {
    loadAdminProfile(token)
  }, [])

  return (
    <AdminContext.Provider
      value={{
        token,
        adminUser,
        authLoading,
        login,
        logout,
      }}
    >
      {children}
    </AdminContext.Provider>
  )
}

export default AdminContextProvider