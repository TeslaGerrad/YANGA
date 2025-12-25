import { Ionicons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import Constants from "expo-constants";
import * as Location from "expo-location";
import { router, useLocalSearchParams } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
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
const GOOGLE_MAPS_API_KEY =
  Constants.expoConfig?.extra?.googleMapsApiKey ||
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ||
  "";

interface CarOption {
  id: string;
  type: string;
  waitTime: string;
  price: number;
  capacity: number;
  description: string;
}

const carOptions: CarOption[] = [
  {
    id: "standard",
    type: "Yanga",
    waitTime: "2 min",
    price: 23,
    capacity: 4,
    description: "Affordable rides",
  },
  {
    id: "comfort",
    type: "Comfort",
    waitTime: "5 min",
    price: 30,
    capacity: 4,
    description: "Newer cars with extra legroom",
  },
  {
    id: "xl",
    type: "XL",
    waitTime: "8 min",
    price: 38,
    capacity: 6,
    description: "Affordable rides for groups",
  },
  {
    id: "executive",
    type: "Executive",
    waitTime: "10 min",
    price: 52,
    capacity: 4,
    description: "High-end cars and top drivers",
  },
];

export default function RideSelection() {
  const params = useLocalSearchParams();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const mapRef = useRef<MapView>(null);

  const [selectedCar, setSelectedCar] = useState<string>("standard");
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [destinationCoords, setDestinationCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [routeDistance, setRouteDistance] = useState<number | null>(null);
  const [routeDuration, setRouteDuration] = useState<number | null>(null);

  const pickupLocation = (params.from as string) || "Current Location";
  const dropoffLocation = (params.to as string) || "Destination";

  // Bottom sheet snap points
  const snapPoints = useMemo(() => ["25%", "50%", "90%"], []);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.error("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setCurrentLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    })();
  }, []);

  useEffect(() => {
    if (params.destinationLat && params.destinationLng) {
      setDestinationCoords({
        latitude: parseFloat(params.destinationLat as string),
        longitude: parseFloat(params.destinationLng as string),
      });
    }
  }, [params.destinationLat, params.destinationLng]);

  // Fit map to show route
  useEffect(() => {
    if (currentLocation && destinationCoords && mapRef.current) {
      setTimeout(() => {
        mapRef.current?.fitToCoordinates([currentLocation, destinationCoords], {
          edgePadding: { top: 100, right: 50, bottom: 400, left: 50 },
          animated: true,
        });
      }, 500);
    }
  }, [currentLocation, destinationCoords]);

  const handleSheetChanges = useCallback((index: number) => {
    console.log("Bottom sheet index:", index);
  }, []);

  const handleCarSelect = (carId: string) => {
    setSelectedCar(carId);
  };

  const handleConfirmRide = () => {
    const selectedCarOption = carOptions.find((car) => car.id === selectedCar);
    router.push({
      pathname: "/finding-driver",
      params: {
        from: pickupLocation,
        to: dropoffLocation,
        carType: selectedCarOption?.type || "Yanga",
        price: `K${selectedCarOption?.price || 23}`,
      },
    });
  };

  const selectedCarData = carOptions.find((car) => car.id === selectedCar);

  const initialRegion = currentLocation
    ? {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }
    : {
        latitude: -15.4167,
        longitude: 28.2833,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={initialRegion}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={false}
      >
        {currentLocation && (
          <Marker
            coordinate={currentLocation}
            title="Pickup"
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={styles.pickupMarker}>
              <View style={styles.markerDot} />
            </View>
          </Marker>
        )}

        {destinationCoords && (
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
        )}

        {currentLocation && destinationCoords && GOOGLE_MAPS_API_KEY && (
          <MapViewDirections
            origin={currentLocation}
            destination={destinationCoords}
            apikey={GOOGLE_MAPS_API_KEY}
            strokeWidth={4}
            strokeColor="#000"
            mode="DRIVING"
            precision="high"
            onReady={(result) => {
              setRouteDistance(result.distance);
              setRouteDuration(result.duration);
            }}
          />
        )}
      </MapView>

      {/* Back Button */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Route Info */}
      {routeDistance && routeDuration && (
        <View style={styles.routeInfo}>
          <View style={styles.routeInfoContent}>
            <Text style={styles.routeTime}>
              {Math.round(routeDuration)} min
            </Text>
            <Text style={styles.routeDistance}>
              {routeDistance.toFixed(1)} km
            </Text>
          </View>
        </View>
      )}

      {/* Interactive Bottom Sheet */}
      <BottomSheet
        ref={bottomSheetRef}
        index={1}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        enablePanDownToClose={false}
        backgroundStyle={styles.bottomSheetBackground}
        handleIndicatorStyle={styles.handleIndicator}
      >
        <BottomSheetScrollView
          contentContainerStyle={styles.bottomSheetContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Locations Header */}
          <View style={styles.locationsContainer}>
            <View style={styles.locationRow}>
              <View style={styles.pickupDot} />
              <Text style={styles.locationText} numberOfLines={1}>
                {pickupLocation}
              </Text>
            </View>

            <View style={styles.locationConnector} />

            <View style={styles.locationRow}>
              <View style={styles.destinationDot} />
              <Text style={styles.locationText} numberOfLines={1}>
                {dropoffLocation}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Section Title */}
          <Text style={styles.sectionTitle}>Choose a ride</Text>

          {/* Car Options */}
          <View style={styles.carOptionsContainer}>
            {carOptions.map((car) => {
              const isSelected = selectedCar === car.id;
              return (
                <TouchableOpacity
                  key={car.id}
                  style={[
                    styles.carOption,
                    isSelected && styles.carOptionSelected,
                  ]}
                  onPress={() => handleCarSelect(car.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.carLeft}>
                    <View
                      style={[
                        styles.carIconContainer,
                        isSelected && styles.carIconContainerSelected,
                      ]}
                    >
                      <Ionicons
                        name={
                          car.id === "xl"
                            ? "car"
                            : car.id === "executive"
                            ? "car-sport"
                            : "car-outline"
                        }
                        size={24}
                        color={isSelected ? "#000" : "#666"}
                      />
                    </View>
                    <View style={styles.carInfo}>
                      <View style={styles.carHeader}>
                        <Text
                          style={[
                            styles.carType,
                            isSelected && styles.carTypeSelected,
                          ]}
                        >
                          {car.type}
                        </Text>
                        <View style={styles.carCapacity}>
                          <Ionicons name="person" size={12} color="#666" />
                          <Text style={styles.capacityText}>
                            {car.capacity}
                          </Text>
                        </View>
                      </View>
                      <Text
                        style={[
                          styles.carWaitTime,
                          isSelected && styles.carWaitTimeSelected,
                        ]}
                      >
                        {car.waitTime} away
                      </Text>
                      <Text style={styles.carDescription}>
                        {car.description}
                      </Text>
                    </View>
                  </View>
                  <Text
                    style={[
                      styles.carPrice,
                      isSelected && styles.carPriceSelected,
                    ]}
                  >
                    K{car.price}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Payment Method */}
          <TouchableOpacity style={styles.paymentMethod} activeOpacity={0.7}>
            <View style={styles.paymentLeft}>
              <Ionicons name="cash-outline" size={20} color="#000" />
              <Text style={styles.paymentText}>Cash</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          {/* Confirm Button */}
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirmRide}
            activeOpacity={0.9}
          >
            <Text style={styles.confirmButtonText}>
              Confirm {selectedCarData?.type}
            </Text>
          </TouchableOpacity>

          {/* Extra spacing for better UX */}
          <View style={{ height: 20 }} />
        </BottomSheetScrollView>
      </BottomSheet>
    </GestureHandlerRootView>
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

  // Header
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

  // Route Info
  routeInfo: {
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
    alignItems: "center",
    gap: 16,
  },
  routeTime: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
  },
  routeDistance: {
    fontSize: 14,
    color: "#666",
  },

  // Bottom Sheet
  bottomSheetBackground: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  handleIndicator: {
    backgroundColor: "#e0e0e0",
    width: 40,
  },
  bottomSheetContent: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === "ios" ? 20 : 10,
  },

  // Locations
  locationsContainer: {
    marginBottom: 20,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
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
  locationConnector: {
    width: 2,
    height: 24,
    backgroundColor: "#e0e0e0",
    marginLeft: 5,
    marginVertical: 4,
  },
  locationText: {
    fontSize: 14,
    color: "#000",
    fontWeight: "500",
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginBottom: 20,
  },

  // Section Title
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
    marginBottom: 16,
  },

  // Car Options
  carOptionsContainer: {
    gap: 12,
    marginBottom: 20,
  },
  carOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  carOptionSelected: {
    backgroundColor: "#f5f5f5",
    borderColor: "#000",
  },
  carLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  carIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  carIconContainerSelected: {
    backgroundColor: "#e8e8e8",
  },
  carInfo: {
    flex: 1,
  },
  carHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  carType: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  carTypeSelected: {
    color: "#000",
  },
  carCapacity: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#fff",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  capacityText: {
    fontSize: 11,
    color: "#666",
  },
  carWaitTime: {
    fontSize: 13,
    color: "#666",
    marginBottom: 2,
  },
  carWaitTimeSelected: {
    color: "#000",
  },
  carDescription: {
    fontSize: 12,
    color: "#999",
  },
  carPrice: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
  },
  carPriceSelected: {
    color: "#000",
  },

  // Payment Method
  paymentMethod: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    marginBottom: 20,
  },
  paymentLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  paymentText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },

  // Confirm Button
  confirmButton: {
    backgroundColor: "#FF8200",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
});
