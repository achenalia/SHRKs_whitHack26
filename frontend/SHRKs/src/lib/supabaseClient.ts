import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? ''
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? ''

const hasSupabaseConfig = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)

// Types for response shape used in this file (compatible with Supabase responses)
type SupabaseResponse<T = any> = { data: T | null; error: any | null }

// Shared mock helpers
const MOCK_USER_KEY = '@mock_user'
function makeResponse(data: any = null, error: any = null): SupabaseResponse {
  return { data, error }
}

// Implementations (will be selected at runtime)
async function _signInMock(email: string) {
  const user = { id: 'mock-id', email }
  await AsyncStorage.setItem(MOCK_USER_KEY, JSON.stringify(user))
  return makeResponse({ user }, null)
}

async function _signUpMock(email: string) {
  const user = { id: 'mock-id', email }
  await AsyncStorage.setItem(MOCK_USER_KEY, JSON.stringify(user))
  return makeResponse({ user }, null)
}

async function _signOutMock() {
  await AsyncStorage.removeItem(MOCK_USER_KEY)
  return makeResponse(null, null)
}

async function _getUserMock() {
  const raw = await AsyncStorage.getItem(MOCK_USER_KEY)
  const user = raw ? JSON.parse(raw) : null
  return makeResponse({ user }, null)
}

// Default exports (will be reassigned)
let defaultExport: any = { isMock: true }

// Public function references (exported)
export let signIn: (email: string, password?: string) => Promise<SupabaseResponse>
export let signUp: (email: string, password?: string) => Promise<SupabaseResponse>
export let signOut: () => Promise<SupabaseResponse>
export let getUser: () => Promise<SupabaseResponse>

if (hasSupabaseConfig) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

  signIn = async (email: string, password?: string) =>
    supabase.auth.signInWithPassword({ email, password: password ?? '' })

  signUp = async (email: string, password?: string) => supabase.auth.signUp({ email, password: password ?? '' })

  signOut = async () => supabase.auth.signOut()

  getUser = async () => supabase.auth.getUser()

  defaultExport = supabase
} else {
  // use mock implementations
  signIn = async (email: string) => _signInMock(email)
  signUp = async (email: string) => _signUpMock(email)
  signOut = async () => _signOutMock()
  getUser = async () => _getUserMock()

  defaultExport = {
    isMock: true,
    getUser: async () => _getUserMock(),
  }
}

export default defaultExport
