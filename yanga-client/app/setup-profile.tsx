import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Colors } from '@/constants/colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '@/store/useAuthStore';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function SetupProfileScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  
  const { setupProfile } = useAuthStore();

  const handleComplete = () => {
    setupProfile({ name, username, email: email || undefined });
    router.replace('/(tabs)');
  };

  const handleSkip = () => {
    router.replace('/(tabs)');
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: colors.card }]}>
            <Ionicons name="person" size={40} color={colors.primary} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>
            Setup Your Profile
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Tell us a bit about yourself (you can skip this for now)
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Full Name"
            placeholder="Enter your full name"
            value={name}
            onChangeText={setName}
            icon="person-outline"
          />

          <Input
            label="Username"
            placeholder="Choose a username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            icon="at-outline"
          />

          <Input
            label="Email (Optional)"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            icon="mail-outline"
          />

          <View style={[styles.infoBox, { backgroundColor: colors.card }]}>
            <Ionicons name="information-circle" size={20} color={colors.textSecondary} />
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              You can always update your profile later in settings
            </Text>
          </View>

          <Button
            title="Complete Setup"
            onPress={handleComplete}
            style={styles.button}
          />

          <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
            <Text style={[styles.skipText, { color: colors.textSecondary }]}>
              Skip for now
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    marginBottom: 24,
  },
  infoBox: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  button: {
    width: '100%',
    marginBottom: 16,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  skipText: {
    fontSize: 16,
  },
});
