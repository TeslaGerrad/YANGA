import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Colors } from '@/constants/colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '@/store/useAuthStore';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
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

export default function SetupPasswordScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { phone } = useLocalSearchParams<{ phone: string }>();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});
  
  const { completeRegistration, isLoading } = useAuthStore();

  const validateForm = () => {
    const newErrors: { password?: string; confirmPassword?: string } = {};
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = async () => {
    if (!validateForm()) return;
    
    try {
      await completeRegistration(phone, password);
      
      // Navigate to profile setup
      router.replace('/setup-profile');
    } catch (error) {
      setErrors({ password: 'Registration failed. Please try again.' });
    }
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
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Create Password</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Choose a secure password for your account
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setErrors({ ...errors, password: undefined });
            }}
            error={errors.password}
            secureTextEntry
            icon="lock-closed-outline"
          />

          <Input
            label="Confirm Password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              setErrors({ ...errors, confirmPassword: undefined });
            }}
            error={errors.confirmPassword}
            secureTextEntry
            icon="lock-closed-outline"
          />

          <View style={[styles.infoBox, { backgroundColor: colors.card }]}>
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              Password should be at least 6 characters long
            </Text>
          </View>

          <Button
            title="Continue"
            onPress={handleContinue}
            loading={isLoading}
            style={styles.button}
          />
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
  backButton: {
    marginBottom: 20,
  },
  header: {
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  form: {
    marginBottom: 24,
  },
  infoBox: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
  button: {
    width: '100%',
  },
});
