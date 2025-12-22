import ScheduleRideModal from "@/components/ScheduleRideModal";
import { Colors } from "@/constants/colors";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuthStore } from "@/store/useAuthStore";
import { useRideStore } from "@/store/useRideStore";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";

const { width, height } = Dimensions.get("window");
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

// Add your Google Maps API key here
const GOOGLE_MAPS_API_KEY = "YOUR_GOOGLE_MAPS_API_KEY"; // Replace with your actual API key

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const { user } = useAuthStore();
  const { currentRide, pickup, destination } = useRideStore();

  const mapRef = useRef<MapView>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [routeDistance, setRouteDistance] = useState<number | null>(null);
  const [routeDuration, setRouteDuration] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLoading(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
      setLoading(false);
    })();
  }, []);

  // Auto-fit map to show pickup and destination when both are available
  useEffect(() => {
    if (pickup && destination && mapRef.current) {
      const coordinates = [
        { latitude: pickup.latitude, longitude: pickup.longitude },
        { latitude: destination.latitude, longitude: destination.longitude },
      ];

      setTimeout(() => {
        mapRef.current?.fitToCoordinates(coordinates, {
          edgePadding: { top: 150, right: 50, bottom: 300, left: 50 },
          animated: true,
        });
      }, 500);
    }
  }, [pickup, destination]);

  if (loading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Loading map...
        </Text>
      </View>
    );
  }

  if (!location) {
    return (
      <View
        style={[styles.errorContainer, { backgroundColor: colors.background }]}
      >
        <Ionicons
          name="location-outline"
          size={64}
          color={colors.textSecondary}
        />
        <Text style={[styles.errorText, { color: colors.text }]}>
          Location permission required
        </Text>
        <Text style={[styles.errorSubtext, { color: colors.textSecondary }]}>
          Please enable location services to use the app
        </Text>
      </View>
    );
  }

  const initialRegion = {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA,
  };

  const handleScheduleRide = (date: string, time: string) => {
    console.log("Scheduled ride:", { date, time });
    // Handle scheduled ride logic here
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />

      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={initialRegion}
        showsUserLocation
        showsMyLocationButton={false}
        customMapStyle={colorScheme === "dark" ? darkMapStyle : []}
      >
        {/* Pickup Marker */}
        {pickup && (
          <Marker
            coordinate={{
              latitude: pickup.latitude,
              longitude: pickup.longitude,
            }}
            title="Pickup Location"
            description={pickup.address}
          >
            <View
              style={[styles.markerContainer, { backgroundColor: "#FF8200" }]}
            >
              <Ionicons name="location" size={24} color="#fff" />
            </View>
          </Marker>
        )}

        {/* Destination Marker */}
        {destination && (
          <Marker
            coordinate={{
              latitude: destination.latitude,
              longitude: destination.longitude,
            }}
            title="Destination"
            description={destination.address}
          >
            <View
              style={[styles.markerContainer, { backgroundColor: "#1E88E5" }]}
            >
              <Ionicons name="flag" size={24} color="#fff" />
            </View>
          </Marker>
        )}

        {/* Polyline/Directions - Shows navigation route */}
        {pickup && destination && (
          <MapViewDirections
            origin={{
              latitude: pickup.latitude,
              longitude: pickup.longitude,
            }}
            destination={{
              latitude: destination.latitude,
              longitude: destination.longitude,
            }}
            apikey={GOOGLE_MAPS_API_KEY}
            strokeWidth={4}
            strokeColor="#FF8200"
            optimizeWaypoints={true}
            onReady={(result) => {
              setRouteDistance(result.distance);
              setRouteDuration(result.duration);
            }}
            onError={(errorMessage) => {
              console.log("Directions Error:", errorMessage);
            }}
            lineDashPattern={[0]}
            lineCap="round"
            lineJoin="round"
          />
        )}
      </MapView>

      {/* Current Location Card */}
      <View style={styles.currentLocationCard}>
        <Ionicons name="menu" size={20} color="#111" style={styles.menuIcon} />
        <Text style={styles.currentLocationText}>Your Current Location</Text>
      </View>

      {/* Route Information Card - Shows when navigation is active */}
      {pickup && destination && routeDistance && routeDuration && (
        <View style={styles.routeInfoCard}>
          <View style={styles.routeInfoRow}>
            <Ionicons name="navigate" size={24} color="#FF8200" />
            <View style={styles.routeInfoTextContainer}>
              <Text style={styles.routeInfoLabel}>Distance</Text>
              <Text style={styles.routeInfoValue}>
                {routeDistance.toFixed(1)} km
              </Text>
            </View>
          </View>
          <View style={styles.routeInfoDivider} />
          <View style={styles.routeInfoRow}>
            <Ionicons name="time" size={24} color="#FF8200" />
            <View style={styles.routeInfoTextContainer}>
              <Text style={styles.routeInfoLabel}>Duration</Text>
              <Text style={styles.routeInfoValue}>
                {Math.round(routeDuration)} min
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Current Location Pin */}
      <View style={styles.currentLocationPin}>
        <View style={styles.pinOuter}>
          <View style={styles.pinInner} />
        </View>
      </View>

      {/* Where To Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.whereToButton}
          onPress={() => router.push("/search-destination")}
        >
          <View style={styles.whereToLeft}>
            <Ionicons name="search" size={20} color="#5b5b5b" />
            <Text style={styles.whereToText}>Where To?</Text>
          </View>
          <View style={styles.verticalDivider} />
          <TouchableOpacity
            style={styles.scheduleIconButton}
            onPress={() => setShowScheduleModal(true)}
          >
            <Ionicons name="time-outline" size={24} color="#111" />
          </TouchableOpacity>
        </TouchableOpacity>
      </View>

      {/* Schedule Ride Modal */}
      <ScheduleRideModal
        visible={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        onConfirm={handleScheduleRide}
      />
    </View>
  );
}

const darkMapStyle = [
  {
    elementType: "geometry",
    stylers: [{ color: "#212121" }],
  },
  {
    elementType: "labels.icon",
    stylers: [{ visibility: "off" }],
  },
  {
    elementType: "labels.text.fill",
    stylers: [{ color: "#757575" }],
  },
  {
    elementType: "labels.text.stroke",
    stylers: [{ color: "#212121" }],
  },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorText: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 16,
  },
  errorSubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
  currentLocationCard: {
    position: "absolute",
    top: 66,
    left: 20,
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingVertical: 15,
    paddingHorizontal: 20,
    width: 335,
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  menuIcon: {
    marginRight: 12,
  },
  currentLocationText: {
    fontFamily: "Lato-Regular",
    fontSize: 16,
    color: "#5b5b5b",
  },
  currentLocationPin: {
    position: "absolute",
    top: "40%",
    left: "50%",
    marginLeft: -30,
    marginTop: -60,
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  pinOuter: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 130, 0, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  pinInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FF8200",
    borderWidth: 3,
    borderColor: "#fff",
  },
  bottomContainer: {
    position: "absolute",
    bottom: 40,
    left: 20,
    right: 20,
  },
  whereToButton: {
    backgroundColor: "#f5f5f5",
    borderRadius: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  whereToLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  whereToText: {
    fontFamily: "Lato-Bold",
    fontSize: 16,
    color: "#111",
    marginLeft: 12,
  },
  verticalDivider: {
    width: 1,
    height: 30,
    backgroundColor: "#ebebeb",
    marginHorizontal: 16,
  },
  scheduleIconButton: {
    padding: 4,
  },
  markerContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  routeInfoCard: {
    position: "absolute",
    top: 130,
    left: 20,
    right: 20,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  routeInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  routeInfoTextContainer: {
    marginLeft: 12,
  },
  routeInfoLabel: {
    fontSize: 12,
    color: "#5b5b5b",
    fontFamily: "Lato-Regular",
  },
  routeInfoValue: {
    fontSize: 16,
    color: "#111",
    fontWeight: "700",
    fontFamily: "Lato-Bold",
    marginTop: 2,
  },
  routeInfoDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#ebebeb",
    marginHorizontal: 16,
  },
});
