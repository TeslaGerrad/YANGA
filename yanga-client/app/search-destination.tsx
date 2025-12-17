import ScheduleRideModal from "@/components/ScheduleRideModal";
import { Ionicons } from "@expo/vector-icons";
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
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SearchDestinationScreen() {
  const params = useLocalSearchParams();
  const [fromLocation, setFromLocation] = useState("Current Location");
  const [toLocation, setToLocation] = useState("");
  const [showAddStops, setShowAddStops] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleTime, setScheduleTime] = useState("Now");
  const [destinationCoords, setDestinationCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

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

  const handleConfirmDestination = () => {
    if (toLocation.trim()) {
      // Navigate to ride selection screen with location details
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

  const handleUseCurrentLocation = () => {
    setFromLocation("Ibex hill");
  };

  const handleScheduleConfirm = (date: string, time: string) => {
    setScheduleTime(time);
    setShowScheduleModal(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Map Background */}
      <MapView
        provider={PROVIDER_DEFAULT}
        style={styles.map}
        initialRegion={{
          latitude: -15.4167,
          longitude: 28.2833,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        {/* Current Location Marker */}
        <Marker
          coordinate={{
            latitude: -15.4167,
            longitude: 28.2833,
          }}
          title="Current Location"
        />

        {/* Destination Marker and Route */}
        {destinationCoords && (
          <>
            <Marker
              coordinate={destinationCoords}
              title={toLocation}
              pinColor="#FF8200"
            />
            <Polyline
              coordinates={[
                { latitude: -15.4167, longitude: 28.2833 },
                destinationCoords,
              ]}
              strokeColor="#FF8200"
              strokeWidth={3}
            />
          </>
        )}
      </MapView>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTime}>9:41</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        {/* Add Location Card */}
        <View style={styles.addLocationCard}>
          <View style={styles.locationIndicators}>
            <View style={styles.circleGreen} />
            <View style={styles.connectingLine} />
            <View style={styles.circleRed} />
          </View>

          <View style={styles.inputContainer}>
            {/* From Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>From</Text>
              <View style={styles.locationRow}>
                <Text style={styles.locationValue}>{fromLocation}</Text>
                <TouchableOpacity
                  style={styles.locationIconButton}
                  onPress={handleUseCurrentLocation}
                >
                  <View style={styles.locationIconCircle}>
                    <Ionicons name="locate" size={16} color="#36d000" />
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.divider} />

            {/* To Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Where To</Text>
              <View style={styles.locationRow}>
                <TouchableOpacity
                  style={styles.inputTouchable}
                  onPress={() => router.push("/search-results")}
                  activeOpacity={0.7}
                >
                  <Text
                    style={
                      toLocation ? styles.locationValue : styles.placeholderText
                    }
                  >
                    {toLocation || "Enter destination"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.nowButton}
                  onPress={() => setShowScheduleModal(true)}
                >
                  <Ionicons name="time-outline" size={16} color="#fff" />
                  <Text style={styles.nowButtonText}>{scheduleTime}</Text>
                  <Ionicons name="chevron-down" size={14} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Add Stops Option */}
            <TouchableOpacity
              style={styles.addStopsButton}
              onPress={() => setShowAddStops(!showAddStops)}
            >
              <Text style={styles.addStopsText}>Add stops?</Text>
              <Ionicons
                name={showAddStops ? "chevron-up" : "chevron-down"}
                size={16}
                color="#757575"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Sheet */}
        <View style={styles.bottomSheet}>
          <View style={styles.bottomIndicator} />
          <TouchableOpacity
            style={styles.searchButton}
            onPress={handleConfirmDestination}
            disabled={!toLocation.trim()}
          >
            <Text style={styles.searchButtonText}>Confirm Destination</Text>
            <Ionicons
              name="arrow-forward"
              size={20}
              color="#fff"
              style={styles.arrowIcon}
            />
          </TouchableOpacity>
        </View>
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
  backButton: {
    marginTop: 10,
    marginLeft: 3,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: 12,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  headerTime: {
    fontFamily: "Lato-Regular",
    fontSize: 12,
    color: "#111",
    position: "absolute",
    left: 20,
    top: Platform.OS === "ios" ? 60 : 40,
  },
  keyboardView: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  addLocationCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
    flexDirection: "row",
    minHeight: 216,
  },
  locationIndicators: {
    width: 30,
    alignItems: "center",
    paddingTop: 24,
    marginRight: 14,
  },
  circleGreen: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#36d000",
  },
  circleRed: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#ff0000",
  },
  connectingLine: {
    width: 2,
    height: 60,
    backgroundColor: "#5b5b5b",
    marginVertical: 4,
  },
  inputContainer: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontFamily: "Lato-Regular",
    fontSize: 16,
    color: "#111",
    textTransform: "capitalize",
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  locationValue: {
    fontFamily: "Lato-Regular",
    fontSize: 14,
    color: "#111",
    lineHeight: 20,
    flex: 1,
  },
  locationIconButton: {
    padding: 4,
  },
  locationIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  addIconButton: {
    padding: 4,
  },
  addIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FF8200",
  },
  nowButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF8200",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  nowButtonText: {
    fontFamily: "Lato-Regular",
    fontSize: 12,
    color: "#fff",
    fontWeight: "500",
  },
  input: {
    fontFamily: "Lato-Regular",
    fontSize: 14,
    color: "#111",
    lineHeight: 20,
    paddingVertical: 4,
  },
  inputTouchable: {
    flex: 1,
    paddingVertical: 4,
    justifyContent: "center",
  },
  placeholderText: {
    fontFamily: "Lato-Regular",
    fontSize: 14,
    color: "#757575",
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: "#5b5b5b",
    marginBottom: 16,
  },
  addStopsButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  addStopsText: {
    fontFamily: "Lato-Regular",
    fontSize: 14,
    color: "#757575",
    marginRight: 4,
  },

  bottomSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 31,
    paddingVertical: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  bottomIndicator: {
    width: 95.67,
    height: 6.31,
    backgroundColor: "#e7e7e7",
    borderRadius: 50,
    marginBottom: 20,
  },
  searchButton: {
    backgroundColor: "#FF8200",
    borderRadius: 60,
    paddingVertical: 16,
    paddingHorizontal: 48,
    width: 312,
    height: 63,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#FF8200",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
    gap: 8,
  },
  searchButtonText: {
    fontFamily: "Lato-Bold",
    fontSize: 18,
    color: "#fff",
  },
  arrowIcon: {
    marginLeft: 4,
  },
});
