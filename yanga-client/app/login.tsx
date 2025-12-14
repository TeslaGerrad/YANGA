import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Colors } from '@/constants/colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '@/store/useAuthStore';
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

export default function LoginScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ phone?: string; password?: string }>({});
  
  const { login, isLoading } = useAuthStore();

  const validateForm = () => {
    const newErrors: { phone?: string; password?: string } = {};
    
    if (!phone) {
      newErrors.phone = 'Phone number is required';
    } else {
      const phoneRegex = /^(\+260|0)?[97]\d{8}$/;
      if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
        newErrors.phone = 'Invalid Zambian phone number';
      }
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    
    try {
      // Format phone number
      let formattedPhone = phone.replace(/\s/g, '');
      if (formattedPhone.startsWith('0')) {
        formattedPhone = '+260' + formattedPhone.substring(1);
      } else if (!formattedPhone.startsWith('+')) {
        formattedPhone = '+260' + formattedPhone;
      }
      
      await login(formattedPhone, password);
      router.replace('/(tabs)');
    } catch (error) {
      setErrors({ phone: 'Invalid credentials' });
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
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Welcome Back</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Sign in to continue
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Phone Number"
            placeholder="+260 97X XXX XXX"
            value={phone}
            onChangeText={(text) => {
              setPhone(text);
              setErrors({ ...errors, phone: undefined });
            }}
            error={errors.phone}
            keyboardType="phone-pad"
            icon="call-outline"
          />

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

          <TouchableOpacity 
            style={styles.forgotPassword}
            onPress={() => router.push('/forgot-password')}
          >
            <Text style={[styles.forgotPasswordText, { color: colors.textSecondary }]}>
              Forgot Password?
            </Text>
          </TouchableOpacity>

          <Button
            title="Sign In"
            onPress={handleLogin}
            loading={isLoading}
            style={styles.button}
          />
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            Don't have an account?{' '}
          </Text>
          <TouchableOpacity onPress={() => router.push('/register')}>
            <Text style={[styles.link, { color: colors.text }]}>Sign Up</Text>
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
    justifyContent: 'center',
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
  },
  button: {
    width: '100%',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
  },
  link: {
    fontSize: 14,
    fontWeight: '600',
  },
});
