import { Ionicons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import Constants from "expo-constants";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useRef } from "react";
import {
  Dimensions,
  Image,
  Linking,
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

// Image assets from Figma
const imgDriverPhoto =
  "https://www.figma.com/api/mcp/asset/df35e2d5-3429-489c-8a33-024ba67bd1e7";

export default function DriverDetails() {
  const params = useLocalSearchParams();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const mapRef = useRef<MapView>(null);
  const snapPoints = useMemo(() => ["65%", "90%"], []);

  const pickupLocation = (params.from as string) || "MX studio";
  const dropoffLocation = (params.to as string) || "Namy code street";
  const carType = (params.carType as string) || "Comfort";
  const price = (params.price as string) || "K 30";

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

  const handleCall = () => {
    Linking.openURL("tel:+260123456789");
  };

  const handleMessage = () => {
    // Handle messaging
    console.log("Message driver");
  };

  const handleCancelRide = () => {
    router.back();
  };

  // Auto-fit map to route
  useEffect(() => {
    if (mapRef.current) {
      setTimeout(() => {
        mapRef.current?.fitToCoordinates([currentLocation, destinationCoords], {
          edgePadding: { top: 100, right: 50, bottom: 500, left: 50 },
          animated: true,
        });
      }, 500);
    }
  }, []);

  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={region}
        showsMyLocationButton={false}
        showsUserLocation
      >
        {/* Pickup Marker */}
        <Marker
          coordinate={currentLocation}
          title="Pickup Location"
          anchor={{ x: 0.5, y: 0.5 }}
        >
          <View style={styles.pickupMarker}>
            <View style={styles.markerDot} />
          </View>
        </Marker>

        {/* Dropoff Marker */}
        <Marker
          coordinate={destinationCoords}
          title="Dropoff Location"
          anchor={{ x: 0.5, y: 1 }}
        >
          <View style={styles.destinationMarker}>
            <View style={styles.markerPin}>
              <Ionicons name="location-sharp" size={20} color="#000" />
            </View>
          </View>
        </Marker>

        {/* Route Polyline - Google Maps style */}
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

      {/* Driver Details Bottom Sheet */}
      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        enablePanDownToClose={false}
        backgroundStyle={styles.bottomSheetBackground}
        handleIndicatorStyle={styles.handleIndicator}
      >
        <BottomSheetScrollView
          style={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Driver Info Header */}
          <View style={styles.driverHeader}>
            <Image
              source={{ uri: imgDriverPhoto }}
              style={styles.driverPhoto}
            />
            <View style={styles.driverInfo}>
              <Text style={styles.driverName}>Namy Code</Text>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={16} color="#000" />
                <Text style={styles.ratingText}>4.9</Text>
                <Text style={styles.ratingCount}>(245 trips)</Text>
              </View>
              <View style={styles.carInfo}>
                <Text style={styles.carText}>{carType} • </Text>
                <Text style={styles.plateText}>BCC-3213</Text>
              </View>
            </View>
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={handleMessage}
              >
                <Ionicons name="chatbubble-outline" size={22} color="#000" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={handleCall}>
                <Ionicons name="call-outline" size={22} color="#000" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Arrival Time */}
          <View style={styles.arrivalSection}>
            <View style={styles.arrivalBadge}>
              <Ionicons name="time-outline" size={18} color="#000" />
              <Text style={styles.arrivalText}>Arrives in 3 min</Text>
            </View>
          </View>

          {/* Trip Route */}
          <View style={styles.routeSection}>
            <Text style={styles.sectionTitle}>Trip details</Text>

            <View style={styles.routeContainer}>
              {/* Pickup */}
              <View style={styles.routeRow}>
                <View style={styles.routeIconContainer}>
                  <View style={styles.pickupDot} />
                </View>
                <View style={styles.routeTextContainer}>
                  <Text style={styles.locationLabel}>Pickup</Text>
                  <Text style={styles.locationName}>{pickupLocation}</Text>
                </View>
              </View>

              {/* Connecting line */}
              <View style={styles.connectingLine} />

              {/* Dropoff */}
              <View style={styles.routeRow}>
                <View style={styles.routeIconContainer}>
                  <Ionicons name="location-sharp" size={18} color="#000" />
                </View>
                <View style={styles.routeTextContainer}>
                  <Text style={styles.locationLabel}>Dropoff</Text>
                  <Text style={styles.locationName}>{dropoffLocation}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Price */}
          <View style={styles.priceSection}>
            <Text style={styles.priceLabel}>Estimated fare</Text>
            <Text style={styles.priceValue}>{price}</Text>
          </View>

          {/* Cancel Button */}
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancelRide}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelButtonText}>Cancel trip</Text>
          </TouchableOpacity>
        </BottomSheetScrollView>
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  driverHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    marginBottom: 16,
  },
  driverPhoto: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#F0F0F0",
  },
  driverInfo: {
    flex: 1,
    marginLeft: 14,
  },
  driverName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#000",
    marginLeft: 4,
  },
  ratingCount: {
    fontSize: 14,
    fontWeight: "400",
    color: "#8E8E93",
    marginLeft: 4,
  },
  carInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  carText: {
    fontSize: 14,
    fontWeight: "400",
    color: "#000",
  },
  plateText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F7F7F7",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  arrivalSection: {
    marginBottom: 20,
  },
  arrivalBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7F7F7",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  arrivalText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#000",
  },
  routeSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#000",
    marginBottom: 16,
  },
  routeContainer: {
    backgroundColor: "#F7F7F7",
    borderRadius: 12,
    padding: 16,
  },
  routeRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  routeIconContainer: {
    width: 24,
    alignItems: "center",
    paddingTop: 2,
  },
  pickupDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#000",
  },
  connectingLine: {
    width: 2,
    height: 24,
    backgroundColor: "#C7C7CC",
    marginLeft: 11,
    marginVertical: 8,
  },
  routeTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  locationLabel: {
    fontSize: 13,
    fontWeight: "400",
    color: "#8E8E93",
    marginBottom: 2,
  },
  locationName: {
    fontSize: 15,
    fontWeight: "500",
    color: "#000",
  },
  priceSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F7F7F7",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 24,
  },
  priceLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: "#000",
  },
  priceValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
  },
  cancelButton: {
    backgroundColor: "#F7F7F7",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 30,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
});
