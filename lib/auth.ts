import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

// Client-side environment check
const isSupabaseConfigured = () => {
  if (typeof window === "undefined") return false // Ensure client-side only
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}

// Client-side Supabase client for authentication
export const createClient = () => {
  if (typeof window === "undefined") {
    throw new Error("Auth functions can only be used on the client side")
  }

  if (!isSupabaseConfigured()) {
    throw new Error("Supabase not configured")
  }
  return createClientComponentClient()
}

// Auth helper functions
export const signIn = async (email: string, password: string) => {
  if (typeof window === "undefined") {
    return {
      data: null,
      error: { message: "Authentication only available on client side" },
    }
  }

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
  if (typeof window === "undefined") {
    return {
      data: null,
      error: { message: "Authentication only available on client side" },
    }
  }

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
        emailRedirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
          `${typeof window !== "undefined" ? window.location.origin : ""}/dashboard`,
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
  if (typeof window === "undefined") {
    return { error: null }
  }

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
  if (typeof window === "undefined") {
    return { user: null, error: null }
  }

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
