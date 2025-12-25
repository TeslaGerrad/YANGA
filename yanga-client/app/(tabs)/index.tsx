import ScheduleRideModal from "@/components/ScheduleRideModal";
import { Colors } from "@/constants/colors";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuthStore } from "@/store/useAuthStore";
import { useRideStore } from "@/store/useRideStore";
import { Ionicons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import Constants from "expo-constants";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";

const { width, height } = Dimensions.get("window");
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

// Get Google Maps API key from environment variables
const GOOGLE_MAPS_API_KEY =
  Constants.expoConfig?.extra?.googleMapsApiKey ||
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ||
  "";

interface RideHistory {
  id: string;
  from: string;
  to: string;
  date: string;
  price: string;
  distance: string;
}

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const { user } = useAuthStore();
  const { currentRide, pickup, destination } = useRideStore();

  const mapRef = useRef<MapView>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["30%", "50%", "85%"], []);

  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [routeDistance, setRouteDistance] = useState<number | null>(null);
  const [routeDuration, setRouteDuration] = useState<number | null>(null);
  const [rideHistory, setRideHistory] = useState<RideHistory[]>([
    {
      id: "1",
      from: "Manda Hill Mall",
      to: "Cairo Road",
      date: "Today, 2:30 PM",
      price: "K 25",
      distance: "5.2 km",
    },
    {
      id: "2",
      from: "Levy Junction",
      to: "East Park Mall",
      date: "Yesterday, 4:15 PM",
      price: "K 18",
      distance: "3.8 km",
    },
    {
      id: "3",
      from: "UNZA",
      to: "Arcades Shopping",
      date: "Dec 23, 10:00 AM",
      price: "K 30",
      distance: "7.1 km",
    },
  ]);

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

  const addRideToHistory = (ride: RideHistory) => {
    setRideHistory((prev) => {
      const newHistory = [ride, ...prev];
      // Keep only the last 5 rides
      return newHistory.slice(0, 5);
    });
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
        provider={PROVIDER_GOOGLE}
        initialRegion={initialRegion}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={false}
        showsTraffic={false}
        zoomControlEnabled={false}
        customMapStyle={colorScheme === "dark" ? darkMapStyle : lightMapStyle}
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
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={styles.pickupMarker}>
              <View style={styles.markerDot} />
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
            anchor={{ x: 0.5, y: 1 }}
          >
            <View style={styles.destinationMarker}>
              <View style={styles.markerPin}>
                <Ionicons name="location-sharp" size={20} color="#000" />
              </View>
            </View>
          </Marker>
        )}

        {/* Directions - Google Maps style navigation route */}
        {pickup && destination && GOOGLE_MAPS_API_KEY && (
          <>
            {/* Outer stroke (outline) for depth effect */}
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
              strokeWidth={8}
              strokeColor="rgba(0, 0, 0, 0.3)"
              mode="DRIVING"
              precision="high"
              timePrecision="now"
              optimizeWaypoints={true}
              resetOnChange={false}
            />
            {/* Main stroke */}
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
              strokeWidth={5}
              strokeColor="#000"
              mode="DRIVING"
              precision="high"
              timePrecision="now"
              optimizeWaypoints={true}
              resetOnChange={false}
              onReady={(result) => {
                setRouteDistance(result.distance);
                setRouteDuration(result.duration);
                console.log(
                  `Navigation route ready: ${result.distance.toFixed(
                    2
                  )} km, ${result.duration.toFixed(0)} min`
                );
              }}
              onError={(errorMessage) => {
                console.error("Directions Error:", errorMessage);
              }}
            />
          </>
        )}
      </MapView>

      {/* Top Safe Area with blur effect */}
      <View style={styles.topSafeArea} />

      {/* Header - Uber style */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="menu" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Route Information Card - Shows when navigation is active */}
      {pickup && destination && routeDistance && routeDuration && (
        <View style={styles.routeInfoCard}>
          <View style={styles.routeInfoContent}>
            <View style={styles.routeInfoLeft}>
              <Text style={styles.routeInfoTime}>
                {Math.round(routeDuration)} min
              </Text>
              <Text style={styles.routeInfoDistance}>
                {routeDistance.toFixed(1)} km
              </Text>
            </View>
            <TouchableOpacity style={styles.routeInfoButton}>
              <Text style={styles.routeInfoButtonText}>View route</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* My Location Button - Uber style */}
      <TouchableOpacity
        style={styles.myLocationButton}
        onPress={() => {
          if (location && mapRef.current) {
            mapRef.current.animateToRegion({
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: LATITUDE_DELTA,
              longitudeDelta: LONGITUDE_DELTA,
            });
          }
        }}
      >
        <Ionicons name="navigate" size={20} color="#000" />
      </TouchableOpacity>

      {/* Draggable Bottom Sheet */}
     
        <BottomSheet
          ref={bottomSheetRef}
          index={0}
          snapPoints={snapPoints}
          backgroundStyle={styles.bottomSheetBackground}
          handleIndicatorStyle={styles.handleIndicator}
          android_keyboardInputMode="adjustResize"
        >
          <BottomSheetScrollView
            contentContainerStyle={styles.bottomSheetContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Where To Button */}
            <TouchableOpacity
              style={styles.whereToButton}
              activeOpacity={0.9}
              onPress={() => router.push("/search-destination")}
            >
              <View style={styles.whereToContent}>
                <View style={styles.searchIconContainer}>
                  <Ionicons name="search" size={20} color="#FF8200" />
                </View>
                <Text style={styles.whereToText}>Where to?</Text>
              </View>
            </TouchableOpacity>

            {/* Quick Actions */}
            <View style={styles.quickActions}>
              <TouchableOpacity
                style={styles.quickActionButton}
                onPress={() => setShowScheduleModal(true)}
              >
                <View style={styles.quickActionIcon}>
                  <Ionicons name="time-outline" size={18} color="#000" />
                </View>
                <Text style={styles.quickActionText}>Schedule</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.quickActionButton}>
                <View style={styles.quickActionIcon}>
                  <Ionicons name="heart-outline" size={18} color="#000" />
                </View>
                <Text style={styles.quickActionText}>Favorites</Text>
              </TouchableOpacity>
            </View>

            {/* Ride History Section */}
            {rideHistory.length > 0 && (
              <View style={styles.historySection}>
                <Text style={styles.historyTitle}>Recent trips</Text>
                {rideHistory.map((ride) => (
                  <TouchableOpacity
                    key={ride.id}
                    style={styles.historyItem}
                    activeOpacity={0.7}
                    onPress={() => {
                      // Navigate to ride details or rebook
                      console.log("Selected ride:", ride);
                    }}
                  >
                    <View style={styles.historyIconContainer}>
                      <Ionicons name="time-outline" size={20} color="#666" />
                    </View>
                    <View style={styles.historyDetails}>
                      <View style={styles.historyRoute}>
                        <Text style={styles.historyLocation} numberOfLines={1}>
                          {ride.from}
                        </Text>
                        <Ionicons
                          name="arrow-forward"
                          size={14}
                          color="#999"
                          style={{ marginHorizontal: 6 }}
                        />
                        <Text style={styles.historyLocation} numberOfLines={1}>
                          {ride.to}
                        </Text>
                      </View>
                      <View style={styles.historyMeta}>
                        <Text style={styles.historyDate}>{ride.date}</Text>
                        <Text style={styles.historyDot}>•</Text>
                        <Text style={styles.historyDistance}>
                          {ride.distance}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.historyPrice}>{ride.price}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </BottomSheetScrollView>
        </BottomSheet>
   

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
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#2c2c2c" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#212121" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#17263c" }],
  },
];

const lightMapStyle = [
  {
    featureType: "poi",
    elementType: "labels",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "transit",
    elementType: "labels.icon",
    stylers: [{ visibility: "off" }],
  },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
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

  // Header
  topSafeArea: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: Platform.OS === "ios" ? 50 : 30,
    backgroundColor: "transparent",
  },
  header: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 30,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "transparent",
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  // Markers
  pickupMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#000",
  },
  markerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#000",
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

  // Route Info Card
  routeInfoCard: {
    position: "absolute",
    top: Platform.OS === "ios" ? 110 : 90,
    left: 16,
    right: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  routeInfoContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  routeInfoLeft: {
    flex: 1,
  },
  routeInfoTime: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000",
    marginBottom: 2,
  },
  routeInfoDistance: {
    fontSize: 14,
    color: "#666",
  },
  routeInfoButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#000",
    borderRadius: 20,
  },
  routeInfoButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },

  // My Location Button
  myLocationButton: {
    position: "absolute",
    right: 16,
    bottom: 220,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },

  // Bottom Sheet
  bottomSheetBackground: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  handleIndicator: {
    backgroundColor: "#D1D1D6",
    width: 36,
    height: 5,
    borderRadius: 3,
  },
  bottomSheetContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
  },

  // Where To Button
  whereToButton: {
    backgroundColor: "#f0f0f0",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  whereToContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  searchIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  whereToText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },

  // Quick Actions
  quickActions: {
    flexDirection: "row",
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  quickActionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
  },

  // Ride History
  historySection: {
    marginTop: 24,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f7f7f7",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  historyIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  historyDetails: {
    flex: 1,
  },
  historyRoute: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  historyLocation: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
    flex: 1,
  },
  historyMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  historyDate: {
    fontSize: 12,
    color: "#666",
  },
  historyDot: {
    fontSize: 12,
    color: "#999",
    marginHorizontal: 6,
  },
  historyDistance: {
    fontSize: 12,
    color: "#666",
  },
  historyPrice: {
    fontSize: 15,
    fontWeight: "700",
    color: "#000",
    marginLeft: 8,
  },
});
