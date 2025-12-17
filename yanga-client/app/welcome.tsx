import { router } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const YANGA_LOGO =
  "https://www.figma.com/api/mcp/asset/37038641-4ec9-4657-b544-c0da2aa05084";
const WELCOME_IMAGE =
  "https://www.figma.com/api/mcp/asset/4aaa1c21-4042-4dcc-a6a9-14e0c209caec";

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={{ uri: YANGA_LOGO }}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Tagline */}
        <View style={styles.taglineContainer}>
          <Text style={styles.tagline}>
            Join YANGA for reliable rides across Zambia!
          </Text>
        </View>

        {/* Welcome Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: WELCOME_IMAGE }}
            style={styles.welcomeImage}
            resizeMode="contain"
          />
        </View>

        {/* Title */}
        <Text style={styles.title}>TRAVEL WITH SAFETY</Text>

        {/* Buttons */}
        <View style={styles.buttonsContainer}>
          {/* Register Button */}
          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => router.push("/register")}
            activeOpacity={0.8}
          >
            <Text style={styles.registerButtonText}>Register</Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push("/login")}
            activeOpacity={0.8}
          >
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Indicator */}
        <View style={styles.bottomIndicator} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 110,
    paddingBottom: 24,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    width: 60,
    height: 60,
  },
  taglineContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  tagline: {
    fontSize: 14,
    lineHeight: 20,
    color: "#A8A8A8",
    textAlign: "center",
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 60,
    flex: 1,
    justifyContent: "center",
  },
  welcomeImage: {
    width: 300,
    height: 240,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
    textAlign: "center",
    letterSpacing: 0,
    marginBottom: 40,
    textTransform: "uppercase",
  },
  buttonsContainer: {
    gap: 16,
    marginBottom: 24,
  },
  registerButton: {
    backgroundColor: "#FFF",
    borderRadius: 50,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#5B5B5B",
  },
  registerButtonText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
  },
  loginButton: {
    backgroundColor: "#FFF",
    borderRadius: 50,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#5B5B5B",
  },
  loginButtonText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
  },
  bottomIndicator: {
    width: 96,
    height: 6,
    backgroundColor: "#E7E7E7",
    borderRadius: 50,
    alignSelf: "center",
  },
});
