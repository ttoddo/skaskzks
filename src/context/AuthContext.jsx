import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  apiSession,
  apiLogin,
  apiRegister,
  apiLogout,
  apiUpdateUser,
  apiAddTransaction,
  apiDeleteUser,
  apiVerifyPassword,
} from '../lib/mockApi'
import { uid } from '../lib/storage'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [booting, setBooting] = useState(true)

  useEffect(() => {
    const session = apiSession()
    setUser(session)
    const t = window.setTimeout(() => setBooting(false), 250)
    return () => window.clearTimeout(t)
  }, [])

  const login = useCallback(async (credentials) => {
    const next = await apiLogin(credentials)
    setUser(next)
    return next
  }, [])

  const register = useCallback(async (data) => {
    const next = await apiRegister(data)
    setUser(next)
    return next
  }, [])

  const logout = useCallback(() => {
    apiLogout()
    setUser(null)
  }, [])

  const updateUser = useCallback(
    (patch) => {
      setUser((current) => {
        if (!current) return current
        return apiUpdateUser(current.id, patch)
      })
    },
    [],
  )

  const addTransaction = useCallback(
    (transaction) => {
      setUser((current) => {
        if (!current) return current
        const withTx = apiAddTransaction(current.id, { id: uid('txn'), ts: Date.now(), ...transaction })
        return withTx
      })
    },
    [],
  )

  const topUp = useCallback(
    (amount, { method = 'Банковская карта', title = 'Пополнение баланса' } = {}) => {
      setUser((current) => {
        if (!current) return current
        const next = apiUpdateUser(current.id, { balance: current.balance + amount })
        return apiAddTransaction(next.id, {
          id: uid('txn'),
          type: 'topup',
          title,
          amount,
          method,
          ts: Date.now(),
        })
      })
    },
    [],
  )

  const purchasePlan = useCallback(
    (plan, price, { method = 'Банковская карта', title = 'Подписка' } = {}) => {
      setUser((current) => {
        if (!current) return current
        const next = apiUpdateUser(current.id, {
          plan,
          planUntil: Date.now() + 1000 * 60 * 60 * 24 * 30,
        })
        return apiAddTransaction(next.id, {
          id: uid('txn'),
          type: 'plan',
          title,
          amount: -price,
          method,
          ts: Date.now(),
        })
      })
    },
    [],
  )

  const spend = useCallback(
    (amount, meta = {}) => {
      setUser((current) => {
        if (!current) return current
        if (current.balance < amount) return current
        const next = apiUpdateUser(current.id, { balance: Math.round((current.balance - amount) * 100) / 100 })
        if (meta.silent) return next
        return apiAddTransaction(next.id, {
          id: uid('txn'),
          type: 'game',
          title: meta.title || 'Ход в приключении',
          amount: -amount,
          method: meta.model || 'ИИ-мастер',
          ts: Date.now(),
        })
      })
    },
    [],
  )

  const verifyPassword = useCallback(
    (password) => (user ? apiVerifyPassword(user.id, password) : false),
    [user],
  )

  const deleteAccount = useCallback(() => {
    setUser((current) => {
      if (current) apiDeleteUser(current.id)
      return null
    })
  }, [])

  const value = useMemo(
    () => ({ user, booting, login, register, logout, updateUser, topUp, purchasePlan, spend, addTransaction, verifyPassword, deleteAccount }),
    [user, booting, login, register, logout, updateUser, topUp, purchasePlan, spend, addTransaction, verifyPassword, deleteAccount],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
