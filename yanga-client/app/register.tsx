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

export default function RegisterScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  
  const { sendVerificationCode, isLoading } = useAuthStore();

  const validatePhone = () => {
    if (!phone) {
      setError('Phone number is required');
      return false;
    }
    
    // Zambian phone number format: +260 followed by 9 digits
    const phoneRegex = /^(\+260|0)?[97]\d{8}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      setError('Invalid Zambian phone number');
      return false;
    }
    
    setError('');
    return true;
  };

  const handleContinue = async () => {
    if (!validatePhone()) return;
    
    try {
      // Format phone number
      let formattedPhone = phone.replace(/\s/g, '');
      if (formattedPhone.startsWith('0')) {
        formattedPhone = '+260' + formattedPhone.substring(1);
      } else if (!formattedPhone.startsWith('+')) {
        formattedPhone = '+260' + formattedPhone;
      }
      
      const code = await sendVerificationCode(formattedPhone);
      
      // For demo purposes, show the code
      alert(`Verification code sent: ${code}\n(In production, this would be sent via SMS)`);
      
      router.push({
        pathname: '/verify-phone',
        params: { phone: formattedPhone },
      });
    } catch (error) {
      setError('Failed to send verification code');
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
          <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Enter your phone number to get started
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Phone Number"
            placeholder="+260 97X XXX XXX"
            value={phone}
            onChangeText={(text) => {
              setPhone(text);
              setError('');
            }}
            error={error}
            keyboardType="phone-pad"
            icon="call-outline"
          />

          <View style={[styles.infoBox, { backgroundColor: colors.card }]}>
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              We'll send you a verification code via SMS to confirm your number
            </Text>
          </View>

          <Button
            title="Continue"
            onPress={handleContinue}
            loading={isLoading}
            style={styles.button}
          />
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            Already have an account?{' '}
          </Text>
          <TouchableOpacity onPress={() => router.push('/login')}>
            <Text style={[styles.link, { color: colors.text }]}>Sign In</Text>
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
