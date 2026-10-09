import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ThemedView } from '@/components/themed-view'
import Auth from '@/components/Auth'

export default function AuthScreen() {
  return (
    <ThemedView>
      <SafeAreaView>
        <Auth />
      </SafeAreaView>
    </ThemedView>
  )
}
