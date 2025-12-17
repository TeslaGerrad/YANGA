import { Ionicons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Dimensions, StyleSheet, Text, View } from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";

const { width, height } = Dimensions.get("window");

export default function FindingDriver() {
  const params = useLocalSearchParams();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["50%"], []);

  const [dots, setDots] = useState("");
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const pickupLocation = (params.from as string) || "Current Location";
  const dropoffLocation = (params.to as string) || "Destination";
  const carType = (params.carType as string) || "Comfort";
  const price = (params.price as string) || "k 30";

  // Sample coordinates
  const currentLocation = {
    latitude: -15.4167,
    longitude: 28.2833,
  };

  const destinationCoords = {
    latitude: -15.4269,
    longitude: 28.2931,
  };

  const region = {
    latitude: (currentLocation.latitude + destinationCoords.latitude) / 2,
    longitude: (currentLocation.longitude + destinationCoords.longitude) / 2,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  // Animated dots for loading text
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Pulse animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Rotate animation for spinner
  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  // Navigate to driver details after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push({
        pathname: "/driver-details",
        params: {
          from: pickupLocation,
          to: dropoffLocation,
          carType,
          price,
        },
      });
    }, 10000);

    return () => clearTimeout(timer);
  }, [pickupLocation, dropoffLocation, carType, price]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={region}
      >
        <Marker coordinate={currentLocation} title="Pickup">
          <View style={styles.pickupMarker}>
            <Ionicons name="location" size={20} color="#FF8200" />
          </View>
        </Marker>
        <Marker coordinate={destinationCoords} title="Destination">
          <View style={styles.dropoffMarker}>
            <Ionicons name="location" size={20} color="#36D000" />
          </View>
        </Marker>
        <Polyline
          coordinates={[currentLocation, destinationCoords]}
          strokeColor="#FF8200"
          strokeWidth={3}
        />
      </MapView>

      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        backgroundStyle={styles.bottomSheetBackground}
        handleIndicatorStyle={styles.handleIndicator}
      >
        <BottomSheetView style={styles.contentContainer}>
          {/* Animated Loading Section */}
          <View style={styles.loadingSection}>
            <View style={styles.loaderContainer}>
              <Animated.View
                style={[
                  styles.pulseCircle,
                  {
                    transform: [{ scale: pulseAnim }],
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.spinnerContainer,
                  {
                    transform: [{ rotate: spin }],
                  },
                ]}
              >
                <View style={styles.spinner}>
                  <View style={styles.spinnerDot} />
                </View>
              </Animated.View>
            </View>

            <Text style={styles.title}>Finding your driver{dots}</Text>
            <Text style={styles.subtitle}>
              This usually takes a few seconds
            </Text>
          </View>

          {/* Trip Summary Card */}
          <View style={styles.tripCard}>
            <View style={styles.tripHeader}>
              <View style={styles.carTypeContainer}>
                <Ionicons name="car-sport" size={20} color="#FF8200" />
                <Text style={styles.carTypeText}>{carType}</Text>
              </View>
              <Text style={styles.priceText}>{price}</Text>
            </View>

            <View style={styles.routeDetails}>
              <View style={styles.routeItem}>
                <View style={styles.routeDot} />
                <Text style={styles.routeText} numberOfLines={1}>
                  {pickupLocation}
                </Text>
              </View>

              <View style={styles.routeLine} />

              <View style={styles.routeItem}>
                <Ionicons name="location-sharp" size={18} color="#FF8200" />
                <Text style={styles.routeText} numberOfLines={1}>
                  {dropoffLocation}
                </Text>
              </View>
            </View>
          </View>

          {/* Status Message */}
          <View style={styles.statusContainer}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Searching for nearby drivers</Text>
          </View>
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  map: {
    width: width,
    height: height,
  },
  pickupMarker: {
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#FF8200",
  },
  dropoffMarker: {
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#36D000",
  },
  bottomSheetBackground: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 12,
  },
  handleIndicator: {
    backgroundColor: "#E0E0E0",
    width: 40,
    height: 4,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 20,
  },
  loadingSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  loaderContainer: {
    height: 100,
    width: 100,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    position: "relative",
  },
  pulseCircle: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255, 130, 0, 0.08)",
    borderWidth: 2,
    borderColor: "rgba(255, 130, 0, 0.2)",
  },
  spinnerContainer: {
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  spinner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: "#F5F5F5",
    borderTopColor: "#FF8200",
    justifyContent: "center",
    alignItems: "center",
  },
  spinnerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF8200",
    position: "absolute",
    top: 2,
  },
  title: {
    fontSize: 24,
    fontFamily: "Lato-Bold",
    color: "#1A1A1A",
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: "Lato-Regular",
    color: "#8E8E93",
    textAlign: "center",
  },
  tripCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  tripHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  carTypeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  carTypeText: {
    fontSize: 17,
    fontFamily: "Lato-Bold",
    color: "#1A1A1A",
  },
  priceText: {
    fontSize: 20,
    fontFamily: "Lato-Bold",
    color: "#FF8200",
  },
  routeDetails: {
    gap: 0,
  },
  routeItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 4,
  },
  routeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#36D000",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    shadowColor: "#36D000",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  routeLine: {
    width: 2,
    height: 20,
    backgroundColor: "#E5E5E5",
    marginLeft: 4,
    marginVertical: 2,
  },
  routeText: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Lato-Regular",
    color: "#3C3C43",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FF8200",
  },
  statusText: {
    fontSize: 13,
    fontFamily: "Lato-Regular",
    color: "#8E8E93",
  },
});
