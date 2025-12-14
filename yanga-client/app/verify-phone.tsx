import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '@/store/useAuthStore';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function VerifyPhoneScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { phone } = useLocalSearchParams<{ phone: string }>();
  
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const inputRefs = useRef<(TextInput | null)[]>([]);
  
  const { verifyCode, sendVerificationCode, isLoading } = useAuthStore();

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  const handleCodeChange = (text: string, index: number) => {
    if (text.length > 1) {
      // Handle paste
      const digits = text.slice(0, 6).split('');
      const newCode = [...code];
      digits.forEach((digit, i) => {
        if (index + i < 6) {
          newCode[index + i] = digit;
        }
      });
      setCode(newCode);
      
      // Focus last filled input or next empty
      const nextIndex = Math.min(index + digits.length, 5);
      inputRefs.current[nextIndex]?.focus();
    } else {
      // Single digit entry
      const newCode = [...code];
      newCode[index] = text;
      setCode(newCode);
      
      // Move to next input
      if (text && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
    
    setError('');
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const enteredCode = code.join('');
    
    if (enteredCode.length !== 6) {
      setError('Please enter complete verification code');
      return;
    }
    
    try {
      const isValid = await verifyCode(phone, enteredCode);
      
      if (isValid) {
        router.push({
          pathname: '/setup-password',
          params: { phone },
        });
      } else {
        setError('Invalid verification code');
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      setError('Verification failed. Please try again.');
    }
  };

  const handleResend = async () => {
    try {
      const newCode = await sendVerificationCode(phone);
      alert(`New verification code sent: ${newCode}\n(In production, this would be sent via SMS)`);
      setCode(['', '', '', '', '', '']);
      setError('');
      inputRefs.current[0]?.focus();
    } catch (error) {
      setError('Failed to resend code');
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: colors.card }]}>
            <Ionicons name="chatbubbles" size={40} color={colors.primary} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>
            Verify Phone Number
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Enter the 6-digit code sent to{'\n'}
            <Text style={{ fontWeight: '600' }}>{phone}</Text>
          </Text>
        </View>

        <View style={styles.codeContainer}>
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                inputRefs.current[index] = ref;
              }}
              style={[
                styles.codeInput,
                {
                  backgroundColor: colors.card,
                  color: colors.text,
                  borderColor: error ? colors.error : colors.border,
                },
              ]}
              value={digit}
              onChangeText={(text) => handleCodeChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>

        {error && (
          <Text style={[styles.error, { color: colors.error }]}>{error}</Text>
        )}

        <Button
          title="Verify"
          onPress={handleVerify}
          loading={isLoading}
          style={styles.button}
        />

        <View style={styles.resendContainer}>
          <Text style={[styles.resendText, { color: colors.textSecondary }]}>
            Didn't receive the code?{' '}
          </Text>
          <TouchableOpacity onPress={handleResend} disabled={isLoading}>
            <Text style={[styles.resendLink, { color: colors.text }]}>
              Resend
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
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
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  codeInput: {
    width: 50,
    height: 60,
    borderRadius: 12,
    borderWidth: 2,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  error: {
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  button: {
    marginBottom: 24,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendText: {
    fontSize: 14,
  },
  resendLink: {
    fontSize: 14,
    fontWeight: '600',
  },
});
