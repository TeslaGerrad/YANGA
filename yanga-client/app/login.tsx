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
  "https://www.figma.com/api/mcp/asset/edce8ab3-e946-4474-879e-414cec6e0011";
const DRIVER_IMAGE =
  "https://www.figma.com/api/mcp/asset/7c4e5c38-e5c3-486c-8610-0a0a047c171b";

export default function LoginScreen() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ phone?: string; password?: string }>(
    {}
  );

  const { login, isLoading } = useAuthStore();

  const validateForm = () => {
    const newErrors: { phone?: string; password?: string } = {};

    if (!phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else {
      const phoneRegex = /^[0-9]{9}$/;
      if (!phoneRegex.test(phone.trim())) {
        newErrors.phone = "Invalid phone number";
      }
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      const formattedPhone = "+260" + phone.trim();

      await login(formattedPhone, password);
      router.replace("/(tabs)");
    } catch (error) {
      setErrors({ phone: "Invalid credentials" });
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
          <Text style={styles.headerTitle}>LOGIN</Text>
        </View>

        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={{ uri: YANGA_LOGO }}
            style={styles.logo}
            resizeMode="cover"
          />
        </View>

        {/* Driver Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: DRIVER_IMAGE }}
            style={styles.driverImage}
            resizeMode="contain"
          />
        </View>

        {/* Title */}
        <Text style={styles.title}>Enter mobile number</Text>

        {/* Form */}
        <View style={styles.form}>
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
            <View style={[styles.inputUnderline, styles.phoneUnderline]} />
            {errors.phone && (
              <Text style={styles.errorText}>{errors.phone}</Text>
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
                placeholder="Enter Your Password"
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

          {/* Forgot Password */}
          <TouchableOpacity
            style={styles.forgotPasswordContainer}
            onPress={() => router.push("/forgot-password")}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            style={[
              styles.loginButton,
              isLoading && styles.loginButtonDisabled,
            ]}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <Text style={styles.loginButtonText}>Login</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFF" />
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
    paddingTop: 49,
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
    marginBottom: 24,
  },
  logo: {
    width: 60,
    height: 60,
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  driverImage: {
    width: 188,
    height: 188,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
    marginBottom: 24,
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
    color: "#111",
    marginLeft: 4,
    marginRight: 4,
  },
  phoneSeparator: {
    width: 1,
    height: 20,
    backgroundColor: "#BCBCBC",
    marginLeft: 8,
  },
  phoneInput: {
    paddingLeft: 12,
  },
  phoneUnderline: {
    backgroundColor: "#BCBCBC",
  },
  errorText: {
    fontSize: 12,
    color: "#FF0000",
    marginTop: 4,
  },
  forgotPasswordContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  forgotPasswordText: {
    fontSize: 16,
    color: "#111",
  },
  loginButton: {
    backgroundColor: "#FF8200",
    borderRadius: 50,
    paddingVertical: 16,
    paddingHorizontal: 32,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFF",
  },
});
