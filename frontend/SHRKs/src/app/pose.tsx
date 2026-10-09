import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ThemedView } from '@/components/themed-view'
import PoseDetector from '@/components/PoseDetector'

export default function PoseScreen() {
  return (
    <ThemedView>
      <SafeAreaView>
        <PoseDetector />
      </SafeAreaView>
    </ThemedView>
  )
}
