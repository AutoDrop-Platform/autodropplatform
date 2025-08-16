import { createClientComponentClient, createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

const isSupabaseConfigured = () => {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}

// Client-side Supabase client for authentication
export const createClient = () => {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase not configured")
  }
  return createClientComponentClient()
}

// Server-side Supabase client for authentication
export const createServerClient = () => {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase not configured")
  }
  return createServerComponentClient({ cookies })
}

// Auth helper functions
export const signIn = async (email: string, password: string) => {
  if (!isSupabaseConfigured()) {
    return {
      data: null,
      error: { message: "Authentication not configured. Please set up Supabase integration." },
    }
  }

  try {
    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  } catch (error) {
    return {
      data: null,
      error: { message: "Authentication not available" },
    }
  }
}

export const signUp = async (email: string, password: string) => {
  if (!isSupabaseConfigured()) {
    return {
      data: null,
      error: { message: "Authentication not configured. Please set up Supabase integration." },
    }
  }

  try {
    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/dashboard`,
      },
    })
    return { data, error }
  } catch (error) {
    return {
      data: null,
      error: { message: "Authentication not available" },
    }
  }
}

export const signOut = async () => {
  if (!isSupabaseConfigured()) {
    return { error: null }
  }

  try {
    const supabase = createClient()
    const { error } = await supabase.auth.signOut()
    return { error }
  } catch (error) {
    return { error: null }
  }
}

export const getCurrentUser = async () => {
  if (!isSupabaseConfigured()) {
    return { user: null, error: null }
  }

  try {
    const supabase = createClient()
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()
    return { user, error }
  } catch (error) {
    return { user: null, error: null }
  }
}

export { isSupabaseConfigured }
