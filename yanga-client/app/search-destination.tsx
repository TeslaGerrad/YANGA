import ScheduleRideModal from "@/components/ScheduleRideModal";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import { SafeAreaView } from "react-native-safe-area-context";

const GOOGLE_MAPS_API_KEY =
  Constants.expoConfig?.extra?.googleMapsApiKey ||
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ||
  "";

export default function SearchDestinationScreen() {
  const params = useLocalSearchParams();
  const mapRef = React.useRef<MapView>(null);
  const [fromLocation, setFromLocation] = useState("Current Location");
  const [toLocation, setToLocation] = useState("");
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleTime, setScheduleTime] = useState("Now");
  const [destinationCoords, setDestinationCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [pickupCoords] = useState({
    latitude: -15.4167,
    longitude: 28.2833,
  });
  const [routeReady, setRouteReady] = useState(false);

  // Update destination when returning from search results
  useEffect(() => {
    if (params.destinationName && params.destinationName !== toLocation) {
      setToLocation(params.destinationName as string);
      if (params.destinationLat && params.destinationLng) {
        setDestinationCoords({
          latitude: parseFloat(params.destinationLat as string),
          longitude: parseFloat(params.destinationLng as string),
        });
      }
    }
  }, [params.destinationName, params.destinationLat, params.destinationLng]);

  // Auto-fit map to show full route when both points are available
  useEffect(() => {
    if (destinationCoords && mapRef.current && routeReady) {
      const coordinates = [pickupCoords, destinationCoords];

      setTimeout(() => {
        mapRef.current?.fitToCoordinates(coordinates, {
          edgePadding: { top: 100, right: 50, bottom: 400, left: 50 },
          animated: true,
        });
      }, 300);
    }
  }, [destinationCoords, routeReady]);

  const handleConfirmDestination = () => {
    if (toLocation.trim()) {
      router.push({
        pathname: "/ride-selection",
        params: {
          from: fromLocation,
          to: toLocation,
          destinationLat: destinationCoords?.latitude.toString() || "",
          destinationLng: destinationCoords?.longitude.toString() || "",
        },
      });
    }
  };

  const handleScheduleConfirm = (date: string, time: string) => {
    setScheduleTime(time);
    setShowScheduleModal(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Map Background */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: pickupCoords.latitude,
          longitude: pickupCoords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {/* Pickup Marker */}
        <Marker
          coordinate={pickupCoords}
          title="Pickup Location"
          anchor={{ x: 0.5, y: 0.5 }}
        >
          <View style={styles.pickupMarker}>
            <View style={styles.markerDot} />
          </View>
        </Marker>

        {/* Destination Marker and Route */}
        {destinationCoords && (
          <>
            <Marker
              coordinate={destinationCoords}
              title={toLocation}
              anchor={{ x: 0.5, y: 1 }}
            >
              <View style={styles.destinationMarker}>
                <View style={styles.markerPin}>
                  <Ionicons name="location-sharp" size={20} color="#000" />
                </View>
              </View>
            </Marker>

            {/* Directions - Google Maps style with outline */}
            {GOOGLE_MAPS_API_KEY && (
              <>
                {/* Outer stroke (outline) */}
                <MapViewDirections
                  origin={pickupCoords}
                  destination={destinationCoords}
                  apikey={GOOGLE_MAPS_API_KEY}
                  strokeWidth={8}
                  strokeColor="rgba(0, 0, 0, 0.3)"
                  mode="DRIVING"
                  precision="high"
                  timePrecision="now"
                  resetOnChange={false}
                />
                {/* Main stroke */}
                <MapViewDirections
                  origin={pickupCoords}
                  destination={destinationCoords}
                  apikey={GOOGLE_MAPS_API_KEY}
                  strokeWidth={5}
                  strokeColor="#000"
                  mode="DRIVING"
                  precision="high"
                  timePrecision="now"
                  resetOnChange={false}
                  optimizeWaypoints={true}
                  onReady={(result) => {
                    console.log(
                      `Route distance: ${result.distance.toFixed(2)} km`
                    );
                    console.log(
                      `Route duration: ${result.duration.toFixed(0)} min`
                    );
                    setRouteReady(true);
                  }}
                  onError={(errorMessage) => {
                    console.error("Directions Error:", errorMessage);
                    setRouteReady(false);
                  }}
                />
              </>
            )}
          </>
        )}
      </MapView>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        {/* Location Card */}
        <View style={styles.locationCard}>
          <View style={styles.locationRow}>
            <View style={styles.dotContainer}>
              <View style={styles.pickupDot} />
            </View>
            <View style={styles.locationTextContainer}>
              <Text style={styles.locationLabel}>Pickup</Text>
              <Text style={styles.locationText}>{fromLocation}</Text>
            </View>
          </View>

          <View style={styles.connectingLine} />

          <TouchableOpacity
            style={styles.locationRow}
            onPress={() => router.push("/search-results")}
            activeOpacity={0.7}
          >
            <View style={styles.dotContainer}>
              <View style={styles.destinationDot} />
            </View>
            <View style={styles.locationTextContainer}>
              <Text style={styles.locationLabel}>Destination</Text>
              <Text
                style={
                  toLocation ? styles.locationText : styles.placeholderText
                }
              >
                {toLocation || "Where to?"}
              </Text>
            </View>
            {!toLocation && (
              <Ionicons name="chevron-forward" size={20} color="#999" />
            )}
          </TouchableOpacity>

          {/* Schedule Button */}
          <TouchableOpacity
            style={styles.scheduleRow}
            onPress={() => setShowScheduleModal(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="time-outline" size={20} color="#000" />
            <Text style={styles.scheduleText}>{scheduleTime}</Text>
            <Ionicons name="chevron-down" size={16} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Confirm Button */}
        <TouchableOpacity
          style={[
            styles.confirmButton,
            !toLocation.trim() && styles.confirmButtonDisabled,
          ]}
          onPress={handleConfirmDestination}
          disabled={!toLocation.trim()}
          activeOpacity={0.9}
        >
          <Text style={styles.confirmButtonText}>
            {toLocation.trim() ? "Continue" : "Choose destination"}
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>

      <ScheduleRideModal
        visible={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        onConfirm={handleScheduleConfirm}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  header: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 30,
    left: 16,
    right: 16,
    zIndex: 10,
  },
  backButton: {
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

  keyboardView: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },

  // Location Card
  locationCard: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  dotContainer: {
    width: 36,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  pickupDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#000",
  },
  destinationDot: {
    width: 12,
    height: 12,
    borderRadius: 2,
    backgroundColor: "#000",
  },
  connectingLine: {
    width: 2,
    height: 32,
    backgroundColor: "#e0e0e0",
    marginLeft: 17,
    marginVertical: -4,
  },
  locationTextContainer: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  locationText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  placeholderText: {
    fontSize: 16,
    color: "#999",
  },

  // Schedule Row
  scheduleRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    marginTop: 8,
    gap: 8,
  },
  scheduleText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },

  // Confirm Button
  confirmButton: {
    backgroundColor: "#FF8200",
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: Platform.OS === "ios" ? 34 : 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  confirmButtonDisabled: {
    backgroundColor: "#e0e0e0",
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
});
