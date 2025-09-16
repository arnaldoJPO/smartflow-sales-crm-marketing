import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

// Hook para autenticação
export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    // Verificar sessão atual
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        setError(error)
      } else {
        setUser(session?.user ?? null)
      }
      setLoading(false)
    })

    // Listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return { user, loading, error }
}

// Hook para consultas ao banco
export function useSupabaseQuery<T>(
  table: string,
  select: string = '*',
  filters?: Record<string, any>
) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let query = supabase.from(table).select(select)

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value)
      })
    }

    query.then(({ data, error }) => {
      if (error) {
        setError(error)
      } else {
        setData(data || [])
      }
      setLoading(false)
    })
  }, [table, select, JSON.stringify(filters)])

  return { data, loading, error }
}

// Hook para operações de banco
export function useSupabaseMutation() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const mutate = async <T>(
    operation: () => Promise<{ data: T | null; error: any }>
  ) => {
    setLoading(true)
    setError(null)

    try {
      const result = await operation()
      if (result.error) {
        throw result.error
      }
      return result.data
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { mutate, loading, error }
}