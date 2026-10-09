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
          <View style={styles.logoBadge}>
            <ThemedText type="smallBold" style={styles.logoText}>
              S
            </ThemedText>
          </View>

          <ThemedText type="title" style={styles.title}>
            SHRKs
          </ThemedText>

          <ThemedText type="subtitle" style={styles.subtitle}>
            Better posture starts here.
          </ThemedText>

          {((supabaseClient as any)?.isMock ?? false) && (
            <View style={styles.demoBadge}>
              <ThemedText type="smallBold" style={styles.demoText}>
                Demo mode enabled
              </ThemedText>
            </View>
          )}
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <ThemedText type="smallBold">Session</ThemedText>
            <View style={styles.pill}>
              <ThemedText type="small" style={styles.pillText}>
                {user ? 'Live' : 'Guest'}
              </ThemedText>
            </View>
          </View>

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
          <View style={styles.cardHeader}>
            <ThemedText type="smallBold">Prototype</ThemedText>
            <View style={styles.pillSecondary}>
              <ThemedText type="small" style={styles.pillTextSecondary}>
                v1
              </ThemedText>
            </View>
          </View>

          <ThemedText style={styles.bodyText}>
            Build your exercise posture tracker, movement scoring, and coaching experience with posture-aware feedback.
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
    backgroundColor: '#f8fafc',
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
    marginBottom: 10,
  },
  logoBadge: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dbeafe',
    marginBottom: 12,
    shadowColor: '#2563eb',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  logoText: {
    color: '#1d4ed8',
    fontSize: 24,
  },
  title: {
    textAlign: 'center',
    color: '#0f172a',
  },
  subtitle: {
    textAlign: 'center',
    marginTop: 8,
    color: '#64748b',
  },
  demoBadge: {
    marginTop: 12,
    backgroundColor: '#fef3c7',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  demoText: {
    color: '#92400e',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pill: {
    backgroundColor: '#dbeafe',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pillSecondary: {
    backgroundColor: '#e2e8f0',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pillText: {
    color: '#1d4ed8',
  },
  pillTextSecondary: {
    color: '#334155',
  },
  statusText: {
    marginTop: 8,
    lineHeight: 22,
    color: '#0f172a',
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
