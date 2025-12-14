import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/useAuthStore';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/colors';
import { router } from 'expo-router';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const { user } = useAuthStore();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <View style={styles.headerContent}>
          <View>
            <Text style={[styles.greeting, { color: colors.textSecondary }]}>
              Hello,
            </Text>
            <Text style={[styles.userName, { color: colors.text }]}>
              {user?.name || 'Guest'}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.menuButton, { backgroundColor: colors.card }]}
            onPress={() => router.push('/modal')}
          >
            <Ionicons name="menu" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
          <Ionicons name="information-circle" size={48} color={colors.primary} />
          <Text style={[styles.infoTitle, { color: colors.text }]}>
            Complete Setup Required
          </Text>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            To enable map functionality, please install the required dependencies:
          </Text>
          <View style={[styles.codeBlock, { backgroundColor: colors.background }]}>
            <Text style={[styles.codeText, { color: colors.text }]}>
              bun add react-native-maps expo-location
            </Text>
          </View>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            Then restart the app to see the interactive map.
          </Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: colors.card }]}
            onPress={() => router.push('/booking')}
          >
            <Ionicons name="car" size={32} color={colors.primary} />
            <Text style={[styles.actionTitle, { color: colors.text }]}>
              Book a Ride
            </Text>
            <Text style={[styles.actionSubtitle, { color: colors.textSecondary }]}>
              Request your next trip
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: colors.card }]}
            onPress={() => router.push('/(tabs)/history')}
          >
            <Ionicons name="time" size={32} color={colors.primary} />
            <Text style={[styles.actionTitle, { color: colors.text }]}>
              Ride History
            </Text>
            <Text style={[styles.actionSubtitle, { color: colors.textSecondary }]}>
              View past trips
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 14,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  menuButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  infoCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 20,
  },
  codeBlock: {
    padding: 12,
    borderRadius: 8,
    marginVertical: 12,
    width: '100%',
  },
  codeText: {
    fontSize: 13,
    fontFamily: 'monospace',
    textAlign: 'center',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  actionCard: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4,
    textAlign: 'center',
  },
  actionSubtitle: {
    fontSize: 12,
    textAlign: 'center',
  },
});
