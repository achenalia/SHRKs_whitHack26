import React, { useEffect, useState } from 'react';
import { Button, SafeAreaView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import supabaseClient, { getUser, signOut } from '@/lib/supabaseClient';

export default function HomeScreen() {
  const [user, setUser] = useState<any | null>(null);
  const router = useRouter();

  async function loadUser() {
    try {
      const result = await getUser();
      setUser(result?.data?.user ?? null);
    } catch {
      setUser(null);
    }
  }

  useEffect(() => {
    loadUser();
  }, []);

  async function handleSignOut() {
    await signOut();
    await loadUser();
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.hero}>
          <ThemedText type="title" style={styles.title}>
            SHRKs
          </ThemedText>

          <ThemedText type="subtitle" style={styles.subtitle}>
            Better posture starts here.
          </ThemedText>

          {((supabaseClient as any)?.isMock ?? false) && (
            <ThemedText type="small" style={styles.mockBanner}>
              Demo mode enabled
            </ThemedText>
          )}
        </View>

        <View style={styles.card}>
          <ThemedText type="smallBold">Session</ThemedText>
          <ThemedText style={styles.statusText}>
            {user ? `Signed in as ${user.email ?? user.id}` : 'No account yet'}
          </ThemedText>

          <View style={styles.actions}>
            <View style={styles.buttonWrap}>
              <Button title="Open Auth" onPress={() => router.push('/auth')} color="#2f6bf6" />
            </View>
            <View style={styles.buttonWrap}>
              <Button title="Sign Out" onPress={handleSignOut} color="#d9534f" />
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <ThemedText type="smallBold">Prototype</ThemedText>
          <ThemedText style={styles.bodyText}>
            Start building your exercise posture tracker, movement scoring, and coaching experience.
          </ThemedText>

          <View style={styles.buttonWrapPrimary}>
            <Button title="Open Pose Detector" onPress={() => router.push('/pose')} color="#2563eb" />
          </View>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 28,
    justifyContent: 'center',
    gap: 18,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginTop: 8,
    color: '#64748b',
  },
  mockBanner: {
    marginTop: 10,
    color: '#b45309',
    fontWeight: '600',
  },
  card: {
    backgroundColor: 'rgba(148, 163, 184, 0.08)',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.18)',
  },
  statusText: {
    marginTop: 8,
    lineHeight: 22,
  },
  bodyText: {
    marginTop: 8,
    lineHeight: 22,
    color: '#475569',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
  },
  buttonWrap: {
    flex: 1,
  },
  buttonWrapPrimary: {
    marginTop: 14,
  },
});
