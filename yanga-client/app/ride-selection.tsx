import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

interface CarOption {
  id: string;
  type: string;
  waitTime: string;
  price: string;
  image: string;
}

const carOptions: CarOption[] = [
  {
    id: "standard",
    type: "Standard",
    waitTime: "5 min",
    price: "k23",
    image:
      "https://www.figma.com/api/mcp/asset/fe0fea8e-057c-46c0-b310-6db8f805de3f",
  },
  {
    id: "comfort",
    type: "Comfort",
    waitTime: "15 min",
    price: "k 30",
    image:
      "https://www.figma.com/api/mcp/asset/fe0fea8e-057c-46c0-b310-6db8f805de3f",
  },
  {
    id: "executive",
    type: "Executive",
    waitTime: "10 min",
    price: "k32",
    image:
      "https://www.figma.com/api/mcp/asset/fe0fea8e-057c-46c0-b310-6db8f805de3f",
  },
];

export default function RideSelection() {
  const params = useLocalSearchParams();
  const [selectedCar, setSelectedCar] = useState<string>("comfort");
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [destinationCoords, setDestinationCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const pickupLocation = (params.from as string) || "fx lion";
  const dropoffLocation = (params.to as string) || "Mexton ave";

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

  const handleCarSelect = (carId: string) => {
    setSelectedCar(carId);
  };

  const handleConfirmRide = () => {
    // Navigate to booking screen with selected car details
    router.push({
      pathname: "/booking",
      params: {
        carType: selectedCar,
        pickup: pickupLocation,
        destination: dropoffLocation,
      },
    });
  };

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
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={initialRegion}
        showsUserLocation={true}
        showsMyLocationButton={false}
      >
        {currentLocation && (
          <Marker
            coordinate={currentLocation}
            title="Current Location"
            pinColor="#FF8200"
          >
            <View style={styles.currentLocationMarker}>
              <View style={styles.currentLocationDot} />
            </View>
          </Marker>
        )}

        {destinationCoords && (
          <Marker
            coordinate={destinationCoords}
            title="Destination"
            pinColor="#36D000"
          >
            <View style={styles.destinationMarker}>
              <View style={styles.destinationDot} />
            </View>
          </Marker>
        )}

        {currentLocation && destinationCoords && (
          <Polyline
            coordinates={[currentLocation, destinationCoords]}
            strokeColor="#FF8200"
            strokeWidth={3}
          />
        )}
      </MapView>

      {/* Back Button */}
      <SafeAreaView style={styles.backButtonContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="#111" />
        </TouchableOpacity>
      </SafeAreaView>

      {/* Bottom Sheet with Car Options */}
      <View style={styles.bottomSheet}>
        <View style={styles.handleBar} />

        {/* Locations */}
        <View style={styles.locationsContainer}>
          <View style={styles.locationRow}>
            <View style={styles.redDot} />
            <Text style={styles.locationText}>{pickupLocation}</Text>
          </View>

          <View style={styles.locationConnector} />

          <View style={styles.locationRow}>
            <View style={styles.greenDot} />
            <Text style={styles.locationText}>{dropoffLocation}</Text>
          </View>
        </View>

        <View style={styles.separator} />

        {/* Car Options */}
        <View style={styles.carOptionsContainer}>
          {carOptions.map((car) => (
            <TouchableOpacity
              key={car.id}
              style={[
                styles.carOption,
                selectedCar === car.id && styles.carOptionSelected,
              ]}
              onPress={() => handleCarSelect(car.id)}
            >
              <View style={styles.carImageContainer}>
                <Image
                  source={{ uri: car.image }}
                  style={styles.carImage}
                  resizeMode="none"
                />
              </View>
              <View style={styles.carDetails}>
                <Text
                  style={[
                    styles.carType,
                    selectedCar === car.id && styles.carTypeSelected,
                  ]}
                >
                  {car.type}
                </Text>
                <Text
                  style={[
                    styles.carWaitTime,
                    selectedCar === car.id && styles.carWaitTimeSelected,
                  ]}
                >
                  {car.waitTime}
                </Text>
              </View>
              <Text
                style={[
                  styles.carPrice,
                  selectedCar === car.id && styles.carPriceSelected,
                ]}
              >
                {car.price}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Confirm Button */}
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={handleConfirmRide}
        >
          <Text style={styles.confirmButtonText}>Confirm Ride</Text>
        </TouchableOpacity>
      </View>
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
  currentLocationMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 130, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  currentLocationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#FF8200",
  },
  destinationMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(54, 208, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  destinationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#FF8200",
  },
  backButtonContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  backButton: {
    marginTop: 10,
    marginLeft: 15,
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
  bottomSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 0,
    paddingTop: 15,
    paddingBottom: 30,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -8,
    },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 10,
  },
  handleBar: {
    width: 95,
    height: 6,
    backgroundColor: "#EDEDED",
    borderRadius: 50,
    alignSelf: "center",
    marginBottom: 20,
  },
  locationsContainer: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
  },
  redDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FF8200",
    marginRight: 13,
  },
  greenDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#36D000",
    marginRight: 13,
  },
  locationConnector: {
    width: 1,
    height: 29,
    backgroundColor: "#5B5B5B",
    marginLeft: 5,
    marginVertical: 3,
  },
  locationText: {
    fontSize: 14,
    fontFamily: "Lato-Regular",
    color: "#111",
    lineHeight: 20,
  },
  separator: {
    height: 1,
    backgroundColor: "#E8E8E8",
    marginHorizontal: 63,
    marginVertical: 16,
  },
  carOptionsContainer: {
    paddingHorizontal: 12,
    gap: 12,
  },
  carOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  carOptionSelected: {
    backgroundColor: "#FFF5EC",
    borderColor: "#FF8200",
  },
  carImageContainer: {
    width: 97,
    height: 50,
    backgroundColor: "#fff",
    marginRight: 16,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    borderRadius: 8,
  },
  carImage: {
    width: "100%",
    height: "100%",
  },
  carDetails: {
    flex: 1,
  },
  carType: {
    fontSize: 16,
    fontFamily: "Lato-Regular",
    color: "#111",
    lineHeight: 18,
    marginBottom: 4,
    fontWeight: "600",
  },
  carTypeSelected: {
    color: "#FF8200",
  },
  carWaitTime: {
    fontSize: 13,
    fontFamily: "Lato-Regular",
    color: "#5B5B5B",
    lineHeight: 18,
  },
  carWaitTimeSelected: {
    color: "#111",
  },
  carPrice: {
    fontSize: 16,
    fontFamily: "Lato-Regular",
    color: "#111",
    textAlign: "right",
    lineHeight: 20,
    fontWeight: "700",
  },
  carPriceSelected: {
    color: "#FF8200",
  },
  confirmButton: {
    backgroundColor: "#FF8200",
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",

    elevation: 0,
  },
  confirmButtonText: {
    fontSize: 16,
    fontFamily: "Lato-Regular",
    color: "#fff",
    fontWeight: "700",
  },
});
