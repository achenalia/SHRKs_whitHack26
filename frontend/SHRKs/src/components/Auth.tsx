import React, { useState } from 'react'
import { View, TextInput, Button, Text, StyleSheet } from 'react-native'
import supabaseClient, { signIn, signUp, getUser, signOut } from '@/lib/supabaseClient'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState<string | null>(null)

  async function handleSignIn() {
    setMessage(null)
    const { error } = await signIn(email, password)
    if (error) setMessage(error.message)
    else setMessage('Signed in')
  }

  async function handleSignUp() {
    setMessage(null)
    const { error } = await signUp(email, password)
    if (error) setMessage(error.message)
    else setMessage('Signup email sent (or account created)')
  }

  async function handleSignOut() {
    await signOut()
    setMessage('Signed out')
  }

  async function handleGetUser() {
    const { data, error } = await getUser()
    if (error) setMessage(error.message)
    else setMessage(JSON.stringify(data?.user ?? 'no user'))
  }

  return (
    <View style={styles.container}>
      {((supabaseClient as any)?.isMock ?? false) && (
        <Text style={{ color: '#b35', marginBottom: 8 }}>Running in mock mode (no Supabase)</Text>
      )}
      <Text style={styles.label}>Email</Text>
      <TextInput value={email} onChangeText={setEmail} style={styles.input} />
      <Text style={styles.label}>Password</Text>
      <TextInput value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />

      <View style={styles.buttons}>
        <Button title="Sign In" onPress={handleSignIn} />
        <Button title="Sign Up" onPress={handleSignUp} />
      </View>
      <View style={styles.buttons}>
        <Button title="Get User" onPress={handleGetUser} />
        <Button title="Sign Out" onPress={handleSignOut} />
      </View>

      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 8, marginBottom: 8, borderRadius: 6 },
  label: { marginBottom: 4 },
  buttons: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, marginBottom: 8 },
  message: { marginTop: 12 },
})
