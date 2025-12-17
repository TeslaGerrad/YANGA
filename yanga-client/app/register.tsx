import { useAuthStore } from "@/store/useAuthStore";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
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
  "https://www.figma.com/api/mcp/asset/9b10085b-c2a1-4b13-bf86-17c779bfb3af";

export default function RegisterScreen() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { sendVerificationCode, isLoading } = useAuthStore();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else {
      const phoneRegex = /^[0-9]{9}$/;
      if (!phoneRegex.test(phone.trim())) {
        newErrors.phone = "Invalid phone number";
      }
    }

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Invalid email format";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!agreedToTerms) {
      newErrors.terms = "You must agree to terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validateForm()) return;

    try {
      const formattedPhone = "+260" + phone.trim();

      const code = await sendVerificationCode(formattedPhone);

      alert(
        `Verification code sent: ${code}\n(In production, this would be sent via SMS)`
      );

      router.push({
        pathname: "/verify-phone",
        params: {
          phone: formattedPhone,
          firstName,
          lastName,
          email,
          password,
        },
      });
    } catch (error) {
      setErrors({ phone: "Failed to send verification code" });
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
          <Text style={styles.headerTitle}>REGISTER</Text>
        </View>

        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={{ uri: YANGA_LOGO }}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Title */}
        <Text style={styles.title}>Enter your details</Text>

        {/* Form */}
        <View style={styles.form}>
          {/* First Name */}
          <View style={styles.inputContainer}>
            <View style={styles.inputRow}>
              <Ionicons
                name="person-outline"
                size={16}
                color="#FF8200"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="First Name"
                placeholderTextColor="#5B5B5B"
                value={firstName}
                onChangeText={(text) => {
                  setFirstName(text);
                  const newErrors = { ...errors };
                  delete newErrors.firstName;
                  setErrors(newErrors);
                }}
              />
            </View>
            <View style={styles.inputUnderline} />
            {errors.firstName && (
              <Text style={styles.errorText}>{errors.firstName}</Text>
            )}
          </View>

          {/* Last Name */}
          <View style={styles.inputContainer}>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, { paddingLeft: 0 }]}
                placeholder="Last Name"
                placeholderTextColor="#5B5B5B"
                value={lastName}
                onChangeText={(text) => {
                  setLastName(text);
                  const newErrors = { ...errors };
                  delete newErrors.lastName;
                  setErrors(newErrors);
                }}
              />
            </View>
            <View style={styles.inputUnderline} />
            {errors.lastName && (
              <Text style={styles.errorText}>{errors.lastName}</Text>
            )}
          </View>

          {/* Phone Number */}
          <View style={styles.inputContainer}>
            <View style={styles.inputRow}>
              <View style={styles.phonePrefix}>
                <Ionicons
                  name="call-outline"
                  size={16}
                  color="#FF8200"
                  style={styles.inputIcon}
                />
                <Text style={styles.phonePrefixText}>+26</Text>
                <Ionicons name="chevron-down" size={12} color="#5B5B5B" />
                <View style={styles.phoneSeparator} />
              </View>
              <TextInput
                style={[styles.input, styles.phoneInput]}
                placeholder="073 299 3456"
                placeholderTextColor="#111"
                value={phone}
                onChangeText={(text) => {
                  setPhone(text);
                  const newErrors = { ...errors };
                  delete newErrors.phone;
                  setErrors(newErrors);
                }}
                keyboardType="phone-pad"
                maxLength={9}
              />
              {phone.length === 9 && (
                <Ionicons name="checkmark" size={20} color="#36D000" />
              )}
            </View>
            <View style={styles.inputUnderline} />
            {errors.phone && (
              <Text style={styles.errorText}>{errors.phone}</Text>
            )}
          </View>

          {/* Email */}
          <View style={styles.inputContainer}>
            <View style={styles.inputRow}>
              <Ionicons
                name="mail-outline"
                size={16}
                color="#FF8200"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#5B5B5B"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  const newErrors = { ...errors };
                  delete newErrors.email;
                  setErrors(newErrors);
                }}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            <View style={styles.inputUnderline} />
            {errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}
          </View>

          {/* Password */}
          <View style={styles.inputContainer}>
            <View style={styles.inputRow}>
              <Ionicons
                name="lock-closed-outline"
                size={16}
                color="#FF8200"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#5B5B5B"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  const newErrors = { ...errors };
                  delete newErrors.password;
                  setErrors(newErrors);
                }}
                secureTextEntry
              />
            </View>
            <View style={styles.inputUnderline} />
            {errors.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}
          </View>

          {/* Terms and Conditions */}
          <TouchableOpacity
            style={styles.termsContainer}
            onPress={() => setAgreedToTerms(!agreedToTerms)}
            activeOpacity={0.7}
          >
            <View
              style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}
            >
              {agreedToTerms && (
                <Ionicons name="checkmark" size={14} color="#FFF" />
              )}
            </View>
            <Text style={styles.termsText}>
              By continuing, I confirm I have read the{" "}
              <Text style={styles.termsLink}>Terms and conditions</Text> and{" "}
              <Text style={styles.termsLink}>Privacy Policy.</Text>
            </Text>
          </TouchableOpacity>
          {errors.terms && <Text style={styles.errorText}>{errors.terms}</Text>}

          {/* Next Button */}
          <TouchableOpacity
            style={[styles.nextButton, isLoading && styles.nextButtonDisabled]}
            onPress={handleNext}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <Text style={styles.nextButtonText}>Next</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push("/login")}>
            <Text style={styles.footerLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
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
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  logo: {
    width: 60,
    height: 60,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
    marginBottom: 32,
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#111",
    paddingVertical: 4,
  },
  inputUnderline: {
    height: 1,
    backgroundColor: "#5B5B5B",
    marginTop: 4,
  },
  phonePrefix: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  phonePrefixText: {
    fontSize: 16,
    color: "#212B46",
    marginLeft: 4,
    marginRight: 4,
  },
  phoneSeparator: {
    width: 1,
    height: 20,
    backgroundColor: "#5B5B5B",
    marginLeft: 8,
  },
  phoneInput: {
    paddingLeft: 12,
  },
  errorText: {
    fontSize: 12,
    color: "#FF0000",
    marginTop: 4,
  },
  termsContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 8,
    marginBottom: 32,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#5B5B5B",
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: "#36D000",
    borderColor: "#36D000",
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: "#5B5B5B",
  },
  termsLink: {
    color: "#111",
    fontWeight: "400",
  },
  nextButton: {
    backgroundColor: "#FF8200",
    borderRadius: 50,
    paddingVertical: 16,
    paddingHorizontal: 32,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  nextButtonDisabled: {
    opacity: 0.6,
  },
  nextButtonText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFF",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
    color: "#5B5B5B",
  },
  footerLink: {
    fontSize: 14,
    color: "#111",
    fontWeight: "600",
  },
});
