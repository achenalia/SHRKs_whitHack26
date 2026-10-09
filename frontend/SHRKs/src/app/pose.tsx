import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';

import { ThemedView } from '@/components/themed-view';
import PoseDetector from '@/components/PoseDetector';

export default function PoseScreen() {
  return (
    <ThemedView style={styles.wrapper}>
      <SafeAreaView style={styles.safeArea}>
        <PoseDetector />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
});
