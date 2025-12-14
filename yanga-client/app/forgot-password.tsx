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

export default function ForgotPasswordScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [step, setStep] = useState<'phone' | 'verify' | 'reset'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ phone?: string; code?: string; password?: string; confirmPassword?: string }>({});
  
  const { requestPasswordReset, resetPassword, verifyCode, isLoading } = useAuthStore();

  const validatePhone = () => {
    if (!phone) {
      setErrors({ phone: 'Phone number is required' });
      return false;
    }
    
    const phoneRegex = /^(\+260|0)?[97]\d{8}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      setErrors({ phone: 'Invalid Zambian phone number' });
      return false;
    }
    
    return true;
  };

  const handleSendCode = async () => {
    if (!validatePhone()) return;
    
    try {
      let formattedPhone = phone.replace(/\s/g, '');
      if (formattedPhone.startsWith('0')) {
        formattedPhone = '+260' + formattedPhone.substring(1);
      } else if (!formattedPhone.startsWith('+')) {
        formattedPhone = '+260' + formattedPhone;
      }
      
      const resetCode = await requestPasswordReset(formattedPhone);
      setPhone(formattedPhone);
      
      alert(`Verification code sent: ${resetCode}\n(In production, this would be sent via SMS)`);
      
      setStep('verify');
      setErrors({});
    } catch (error) {
      setErrors({ phone: 'Failed to send verification code' });
    }
  };

  const handleVerifyCode = async () => {
    if (!code) {
      setErrors({ code: 'Verification code is required' });
      return;
    }
    
    try {
      const isValid = await verifyCode(phone, code);
      
      if (isValid) {
        setStep('reset');
        setErrors({});
      } else {
        setErrors({ code: 'Invalid verification code' });
      }
    } catch (error) {
      setErrors({ code: 'Verification failed' });
    }
  };

  const handleResetPassword = async () => {
    const newErrors: { password?: string; confirmPassword?: string } = {};
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    try {
      await resetPassword(phone, code, password);
      
      alert('Password reset successful! Please login with your new password.');
      router.replace('/login');
    } catch (error) {
      setErrors({ password: 'Password reset failed' });
    }
  };

  const renderPhoneStep = () => (
    <>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: colors.card }]}>
          <Ionicons name="lock-closed" size={40} color={colors.primary} />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>Forgot Password</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Enter your phone number to receive a verification code
        </Text>
      </View>

      <View style={styles.form}>
        <Input
          label="Phone Number"
          placeholder="+260 97X XXX XXX"
          value={phone}
          onChangeText={(text) => {
            setPhone(text);
            setErrors({});
          }}
          error={errors.phone}
          keyboardType="phone-pad"
          icon="call-outline"
        />

        <Button
          title="Send Code"
          onPress={handleSendCode}
          loading={isLoading}
          style={styles.button}
        />
      </View>
    </>
  );

  const renderVerifyStep = () => (
    <>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: colors.card }]}>
          <Ionicons name="chatbubbles" size={40} color={colors.primary} />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>Verify Code</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Enter the 6-digit code sent to{'\n'}
          <Text style={{ fontWeight: '600' }}>{phone}</Text>
        </Text>
      </View>

      <View style={styles.form}>
        <Input
          label="Verification Code"
          placeholder="Enter 6-digit code"
          value={code}
          onChangeText={(text) => {
            setCode(text);
            setErrors({});
          }}
          error={errors.code}
          keyboardType="number-pad"
          maxLength={6}
          icon="keypad-outline"
        />

        <Button
          title="Verify Code"
          onPress={handleVerifyCode}
          loading={isLoading}
          style={styles.button}
        />

        <TouchableOpacity onPress={handleSendCode} style={styles.resendButton}>
          <Text style={[styles.resendText, { color: colors.textSecondary }]}>
            Resend Code
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );

  const renderResetStep = () => (
    <>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: colors.card }]}>
          <Ionicons name="key" size={40} color={colors.primary} />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>New Password</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Create a new password for your account
        </Text>
      </View>

      <View style={styles.form}>
        <Input
          label="New Password"
          placeholder="Enter new password"
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
          placeholder="Confirm new password"
          value={confirmPassword}
          onChangeText={(text) => {
            setConfirmPassword(text);
            setErrors({ ...errors, confirmPassword: undefined });
          }}
          error={errors.confirmPassword}
          secureTextEntry
          icon="lock-closed-outline"
        />

        <Button
          title="Reset Password"
          onPress={handleResetPassword}
          loading={isLoading}
          style={styles.button}
        />
      </View>
    </>
  );

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

        {step === 'phone' && renderPhoneStep()}
        {step === 'verify' && renderVerifyStep()}
        {step === 'reset' && renderResetStep()}
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
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    marginBottom: 24,
  },
  button: {
    marginTop: 8,
  },
  resendButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  resendText: {
    fontSize: 14,
  },
});
