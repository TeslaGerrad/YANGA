import { useAuthStore } from "@/store/useAuthStore";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const YANGA_LOGO =
  "https://www.figma.com/api/mcp/asset/3dd8b250-5515-4795-9825-53f82aec4099";

export default function VerifyPhoneScreen() {
  const { phone, firstName, lastName, email, password } = useLocalSearchParams<{
    phone: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
  }>();

  const [code, setCode] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const { verifyCode, sendVerificationCode, completeRegistration, isLoading } =
    useAuthStore();

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleCodeChange = (text: string, index: number) => {
    if (text.length > 1) {
      // Handle paste
      const digits = text
        .slice(0, 4)
        .split("")
        .filter((c) => /\d/.test(c));
      const newCode = [...code];
      digits.forEach((digit, i) => {
        if (index + i < 4) {
          newCode[index + i] = digit;
        }
      });
      setCode(newCode);

      const nextIndex = Math.min(index + digits.length, 3);
      inputRefs.current[nextIndex]?.focus();
    } else if (/\d/.test(text)) {
      const newCode = [...code];
      newCode[index] = text;
      setCode(newCode);

      if (text && index < 3) {
        inputRefs.current[index + 1]?.focus();
      }
    }

    setError("");
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace") {
      if (!code[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      } else {
        const newCode = [...code];
        newCode[index] = "";
        setCode(newCode);
      }
    }
  };

  const handleVerify = async () => {
    const enteredCode = code.join("");

    if (enteredCode.length !== 4) {
      setError("Please enter complete verification code");
      return;
    }

    try {
      const isValid = await verifyCode(phone, enteredCode);

      if (isValid) {
        // If we have registration data, complete registration
        if (firstName && password) {
          await completeRegistration(
            phone,
            password,
            firstName + (lastName ? " " + lastName : ""),
            email
          );
          router.replace("/setup-profile");
        } else {
          // Just phone verification for password reset
          router.replace("/setup-password");
        }
      } else {
        setError("Invalid verification code");
        setCode(["", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      setError("Verification failed. Please try again.");
    }
  };

  const handleResend = async () => {
    try {
      const newCode = await sendVerificationCode(phone);
      alert(
        `New verification code sent: ${newCode}\n(In production, this would be sent via SMS)`
      );
      setCode(["", "", "", ""]);
      setError("");
      inputRefs.current[0]?.focus();
    } catch (error) {
      setError("Failed to resend code");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={24} color="#111" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>VERIFICATION</Text>
        </View>

        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={{ uri: YANGA_LOGO }}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Title and Description */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>Verify mobile number</Text>
          <Text style={styles.description}>
            Check your SMS messages. We've sent you{"\n"}
            the code at <Text style={styles.phoneNumber}>{phone}</Text>
          </Text>
        </View>

        {/* Code Input */}
        <View style={styles.codeContainer}>
          {code.map((digit, index) => (
            <View key={index} style={styles.codeInputWrapper}>
              <TextInput
                ref={(ref) => {
                  inputRefs.current[index] = ref;
                }}
                style={[styles.codeInput, error && styles.codeInputError]}
                value={digit}
                onChangeText={(text) => handleCodeChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
              />
              <View style={styles.codeInputUnderline} />
            </View>
          ))}
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}

        {/* Resend Code */}
        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Didn't receive SMS? </Text>
          <TouchableOpacity onPress={handleResend} disabled={isLoading}>
            <Text style={styles.resendLink}>Resend Code</Text>
          </TouchableOpacity>
        </View>

        {/* Verify Button */}
        <TouchableOpacity
          style={[
            styles.verifyButton,
            isLoading && styles.verifyButtonDisabled,
          ]}
          onPress={handleVerify}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          <Text style={styles.verifyButtonText}>Verify</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFF" />
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: 56,
    paddingBottom: 40,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  backButton: {
    position: "absolute",
    left: 0,
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  logo: {
    width: 60,
    height: 60,
  },
  textContainer: {
    marginBottom: 48,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: "#5B5B5B",
  },
  phoneNumber: {
    color: "#111",
    fontWeight: "400",
  },
  codeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  codeInputWrapper: {
    alignItems: "center",
  },
  codeInput: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111",
    textAlign: "center",
    width: 58,
    paddingVertical: 8,
  },
  codeInputError: {
    color: "#FF0000",
  },
  codeInputUnderline: {
    width: 58,
    height: 1,
    backgroundColor: "#5B5B5B",
    marginTop: 4,
  },
  errorText: {
    fontSize: 12,
    color: "#FF0000",
    textAlign: "center",
    marginBottom: 16,
  },
  resendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 120,
  },
  resendText: {
    fontSize: 16,
    color: "#5B5B5B",
  },
  resendLink: {
    fontSize: 16,
    color: "#111",
    fontWeight: "700",
  },
  verifyButton: {
    backgroundColor: "#FF8200",
    borderRadius: 50,
    paddingVertical: 16,
    paddingHorizontal: 32,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  verifyButtonDisabled: {
    opacity: 0.6,
  },
  verifyButtonText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFF",
  },
});
