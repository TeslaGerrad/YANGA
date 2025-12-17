import ScheduleRideModal from "@/components/ScheduleRideModal";
import { useRideStore } from "@/store/useRideStore";
import { Ionicons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
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
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from "react-native-maps";

const { width, height } = Dimensions.get("window");
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

export default function HomeScreen() {
  const { currentRide, pickup } = useRideStore();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["15%", "30%"], []);

  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleTime, setScheduleTime] = useState("Now");
  const [isExpanded, setIsExpanded] = useState(false);
  const [destination, setDestination] = useState<{
    latitude: number;
    longitude: number;
    name?: string;
  } | null>(null);

  const handleWhereToPress = () => {
    bottomSheetRef.current?.snapToIndex(1);
    setIsExpanded(true);
  };

  const handleSheetChange = (index: number) => {
    setIsExpanded(index === 1);
  };

  const handleScheduleConfirm = (date: string, time: string) => {
    setScheduleTime(time);
    setShowScheduleModal(false);
  };

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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF8200" />
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  if (!location) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="location-outline" size={64} color="#5b5b5b" />
        <Text style={styles.errorText}>Location permission required</Text>
        <Text style={styles.errorSubtext}>
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
    setScheduleTime(time);
    setShowScheduleModal(false);
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />

      <MapView
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={initialRegion}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {pickup && (
          <Marker
            coordinate={{
              latitude: pickup.latitude,
              longitude: pickup.longitude,
            }}
            title="Pickup Location"
          >
            <View style={styles.markerContainer}>
              <Ionicons name="location" size={24} color="#fff" />
            </View>
          </Marker>
        )}

        {/* Show destination marker and route polyline */}
        {destination && (
          <>
            <Marker
              coordinate={destination}
              title={destination.name || "Destination"}
              pinColor="#FF8200"
            />
            <Polyline
              coordinates={[initialRegion, destination]}
              strokeColor="#FF8200"
              strokeWidth={3}
            />
          </>
        )}
      </MapView>

      {/* Current Location Card */}
      <View style={styles.currentLocationCard}>
        <Ionicons name="menu" size={20} color="#111" style={styles.menuIcon} />
        <Text style={styles.currentLocationText}>Your Current Location</Text>
      </View>

      {/* Current Location Pin */}
      <View style={styles.currentLocationPin}>
        <View style={styles.pinOuter}>
          <View style={styles.pinInner} />
        </View>
      </View>

      {/* Bottom Sheet */}
      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        backgroundStyle={styles.bottomSheetBackground}
        handleIndicatorStyle={styles.bottomSheetIndicator}
        onChange={handleSheetChange}
      >
        <BottomSheetView style={styles.bottomSheetContent}>
          <View style={styles.expandedContent}>
            <TouchableOpacity
              style={styles.searchInputCard}
              onPress={() => router.push("/search-destination")}
              activeOpacity={0.7}
            >
              <View style={styles.searchInputRow}>
                <Ionicons name="search" size={20} color="#5b5b5b" />
                <Text style={styles.searchPlaceholder}>
                  Where would you like to go?
                </Text>
                <TouchableOpacity
                  style={styles.nowButtonInSearch}
                  onPress={(e) => {
                    e.stopPropagation();
                    setShowScheduleModal(true);
                  }}
                >
                  <Ionicons name="time-outline" size={16} color="#fff" />
                  <Text style={styles.nowButtonInSearchText}>
                    {scheduleTime}
                  </Text>
                  <Ionicons name="chevron-down" size={14} color="#fff" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </View>
        </BottomSheetView>
      </BottomSheet>

      {/* Schedule Ride Modal */}
      <ScheduleRideModal
        visible={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        onConfirm={handleScheduleRide}
      />
    </GestureHandlerRootView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#111",
    fontFamily: "Lato-Regular",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#fff",
  },
  errorText: {
    fontSize: 20,
    fontFamily: "Lato-Bold",
    marginTop: 16,
    color: "#111",
  },
  errorSubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
    color: "#5b5b5b",
    fontFamily: "Lato-Regular",
  },
  currentLocationCard: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 40,
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
    top: "45%",
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
    backgroundColor: "rgba(54, 208, 0, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  pinInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#36D000",
    borderWidth: 3,
    borderColor: "#fff",
  },
  bottomSheetBackground: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  bottomSheetIndicator: {
    backgroundColor: "#e0e0e0",
    width: 40,
    height: 4,
  },
  bottomSheetContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  bottomButtonsRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  expandedContent: {
    gap: 16,
  },
  searchInputCard: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  searchInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  searchPlaceholder: {
    fontFamily: "Lato-Regular",
    fontSize: 16,
    color: "#5b5b5b",
    flex: 1,
  },
  expandedButtonsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  nowButtonExpanded: {
    backgroundColor: "#FF8200",
    borderRadius: 60,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    shadowColor: "#FF8200",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  whereToButton: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 60,
    paddingVertical: 18,
    paddingHorizontal: 24,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  whereToText: {
    fontFamily: "Lato-Bold",
    fontSize: 18,
    color: "#111",
  },
  nowButton: {
    backgroundColor: "#FF8200",
    borderRadius: 60,
    paddingVertical: 18,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    shadowColor: "#FF8200",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  clockIcon: {
    marginRight: 2,
  },
  nowButtonText: {
    fontFamily: "Lato-Bold",
    fontSize: 18,
    color: "#fff",
  },
  nowButtonInSearch: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF8200",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  nowButtonInSearchText: {
    fontFamily: "Lato-Regular",
    fontSize: 12,
    color: "#fff",
    fontWeight: "500",
  },
  markerContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FF8200",
    justifyContent: "center",
    alignItems: "center",
  },
});
