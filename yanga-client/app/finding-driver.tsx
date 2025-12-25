import { Ionicons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import Constants from "expo-constants";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";

const { width, height } = Dimensions.get("window");

const GOOGLE_MAPS_API_KEY =
  Constants.expoConfig?.extra?.googleMapsApiKey ||
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ||
  "";

export default function FindingDriver() {
  const params = useLocalSearchParams();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const mapRef = useRef<MapView>(null);
  const snapPoints = useMemo(() => ["45%"], []);

  const [dots, setDots] = useState("");
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

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
          toValue: 1.15,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Fade and scale in animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Auto-fit map to route
  useEffect(() => {
    if (mapRef.current) {
      setTimeout(() => {
        mapRef.current?.fitToCoordinates([currentLocation, destinationCoords], {
          edgePadding: { top: 100, right: 50, bottom: 400, left: 50 },
          animated: true,
        });
      }, 500);
    }
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

  const handleCancel = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={region}
        showsMyLocationButton={false}
        showsUserLocation
      >
        {/* Pickup Marker */}
        <Marker
          coordinate={currentLocation}
          title="Pickup"
          anchor={{ x: 0.5, y: 0.5 }}
        >
          <View style={styles.pickupMarker}>
            <View style={styles.markerDot} />
          </View>
        </Marker>

        {/* Destination Marker */}
        <Marker
          coordinate={destinationCoords}
          title="Destination"
          anchor={{ x: 0.5, y: 1 }}
        >
          <View style={styles.destinationMarker}>
            <View style={styles.markerPin}>
              <Ionicons name="location-sharp" size={20} color="#000" />
            </View>
          </View>
        </Marker>

        {/* Navigation Polyline */}
        {GOOGLE_MAPS_API_KEY && (
          <>
            <MapViewDirections
              origin={currentLocation}
              destination={destinationCoords}
              apikey={GOOGLE_MAPS_API_KEY}
              strokeWidth={8}
              strokeColor="rgba(0, 0, 0, 0.3)"
              mode="DRIVING"
              precision="high"
            />
            <MapViewDirections
              origin={currentLocation}
              destination={destinationCoords}
              apikey={GOOGLE_MAPS_API_KEY}
              strokeWidth={5}
              strokeColor="#000"
              mode="DRIVING"
              precision="high"
            />
          </>
        )}
      </MapView>

      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        backgroundStyle={styles.bottomSheetBackground}
        handleIndicatorStyle={styles.handleIndicator}
        enablePanDownToClose={false}
      >
        <BottomSheetView style={styles.contentContainer}>
          {/* Animated Loading Section */}
          <Animated.View
            style={[
              styles.loadingSection,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <View style={styles.loaderContainer}>
              <Animated.View
                style={[
                  styles.pulseOuter,
                  {
                    transform: [{ scale: pulseAnim }],
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.pulseMiddle,
                  {
                    transform: [{ scale: pulseAnim }],
                  },
                ]}
              />
              <View style={styles.carIcon}>
                <Ionicons name="car-sport" size={28} color="#000" />
              </View>
            </View>

            <Text style={styles.title}>Finding your driver{dots}</Text>
            <Text style={styles.subtitle}>
              We're connecting you with nearby drivers
            </Text>
          </Animated.View>

          {/* Trip Summary Card */}
          <View style={styles.tripCard}>
            <View style={styles.tripHeader}>
              <View style={styles.carTypeContainer}>
                <Ionicons name="car-sport-outline" size={22} color="#000" />
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
                <Ionicons name="location-sharp" size={16} color="#000" />
                <Text style={styles.routeText} numberOfLines={1}>
                  {dropoffLocation}
                </Text>
              </View>
            </View>
          </View>

          {/* Cancel Button */}
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancel}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
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
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#fff",
    borderWidth: 3,
    borderColor: "#000",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  markerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#000",
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -5,
    marginLeft: -5,
  },
  destinationMarker: {
    alignItems: "center",
  },
  markerPin: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  bottomSheetBackground: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  handleIndicator: {
    backgroundColor: "#D1D1D6",
    width: 36,
    height: 5,
    borderRadius: 3,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  loadingSection: {
    alignItems: "center",
    marginBottom: 28,
  },
  loaderContainer: {
    height: 90,
    width: 90,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    position: "relative",
  },
  pulseOuter: {
    position: "absolute",
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "rgba(0, 0, 0, 0.04)",
  },
  pulseMiddle: {
    position: "absolute",
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(0, 0, 0, 0.08)",
  },
  carIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#000",
    textAlign: "center",
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: "400",
    color: "#8E8E93",
    textAlign: "center",
  },
  tripCard: {
    backgroundColor: "#F7F7F7",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  tripHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  carTypeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  carTypeText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  priceText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
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
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#000",
  },
  routeLine: {
    width: 2,
    height: 20,
    backgroundColor: "#C7C7CC",
    marginLeft: 3,
    marginVertical: 2,
  },
  routeText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "400",
    color: "#000",
  },
  cancelButton: {
    backgroundColor: "#F7F7F7",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
});
