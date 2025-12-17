import { Ionicons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useRef } from "react";
import {
  Dimensions,
  Image,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";

const { width, height } = Dimensions.get("window");

// Image assets from Figma
const imgDriverPhoto =
  "https://www.figma.com/api/mcp/asset/df35e2d5-3429-489c-8a33-024ba67bd1e7";

export default function DriverDetails() {
  const params = useLocalSearchParams();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["70%", "100%"], []);

  const pickupLocation = (params.from as string) || "MX studio";
  const dropoffLocation = (params.to as string) || "Namy code street";
  const carType = (params.carType as string) || "Toyota orange corolla";
  const price = (params.price as string) || "k 50.00";

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

  const handleCancelRide = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={region}
      >
        {/* Pickup Marker */}
        <Marker coordinate={currentLocation} title="Pickup Location">
          <View style={styles.pickupMarker}>
            <Ionicons name="location" size={24} color="#FF8200" />
          </View>
        </Marker>

        {/* Dropoff Marker */}
        <Marker coordinate={destinationCoords} title="Dropoff Location">
          <View style={styles.dropoffMarker}>
            <Ionicons name="location" size={24} color="#36D000" />
          </View>
        </Marker>

        {/* Route Polyline */}
        <Polyline
          coordinates={[currentLocation, destinationCoords]}
          strokeColor="#FF8200"
          strokeWidth={4}
        />
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
        {/* Orange Header Section */}
        <View style={styles.headerSection}>
          {/* Left side: Driver info and rating */}
          <View style={styles.driverInfoSection}>
            <View style={styles.driverDetails}>
              <Text style={styles.driverName}>Namy code</Text>
              <View style={styles.ratingContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons
                    key={star}
                    name="star"
                    size={14}
                    color="#FFD700"
                    style={styles.starIcon}
                  />
                ))}
              </View>
            </View>
          </View>

          {/* Right side: Driver photo and close button */}
          <View style={styles.driverPhotoSection}>
            <Image
              source={{ uri: imgDriverPhoto }}
              style={styles.driverPhoto}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleCancelRide}
            >
              <Ionicons name="close" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Call Button (positioned on top of content) */}
        <TouchableOpacity style={styles.callButton} onPress={handleCall}>
          <Ionicons name="call" size={18} color="#36D000" />
        </TouchableOpacity>

        <BottomSheetScrollView
          style={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.arrivalText}>
            Your ride is arriving in 10 min
          </Text>

          {/* Car Details Card */}
          <View style={styles.carCard}>
            <Text style={styles.cardTitle}>Car Type:</Text>
            <Text style={styles.carDetails}>Toyota</Text>
            <Text style={styles.carDetails}>orange corolla BCC-3213</Text>
          </View>

          {/* Trip Route */}
          <View style={styles.routeSection}>
            <Text style={styles.sectionTitle}>Trip Route</Text>

            <View style={styles.routeContainer}>
              {/* Pickup */}
              <View style={styles.routeRow}>
                <View style={styles.routeIconContainer}>
                  <View style={styles.pickupDot} />
                </View>
                <View style={styles.routeTextContainer}>
                  <Text style={styles.locationName}>{pickupLocation}</Text>
                  <Text style={styles.locationSubtext}>chalala</Text>
                </View>
              </View>

              {/* Connecting line */}
              <View style={styles.connectingLine} />

              {/* Dropoff */}
              <View style={styles.routeRow}>
                <View style={styles.routeIconContainer}>
                  <Ionicons name="location" size={20} color="#FF8200" />
                </View>
                <View style={styles.routeTextContainer}>
                  <View style={styles.locationRow}>
                    <Text style={styles.locationName}>{dropoffLocation}</Text>
                    <Text style={styles.editText}>Edit</Text>
                  </View>
                  <Text style={styles.locationSubtext}>game zone</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Add a stop */}
          <TouchableOpacity style={styles.addStopButton}>
            <Ionicons name="add-circle-outline" size={20} color="#FF8200" />
            <Text style={styles.addStopText}>Add a stop</Text>
          </TouchableOpacity>

          {/* Total Amount */}
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalPrice}>{price}</Text>
          </View>

          {/* Cancel Button */}
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancelRide}
          >
            <Text style={styles.cancelButtonText}>Cancel Ride</Text>
            <Ionicons
              name="arrow-forward"
              size={20}
              color="#fff"
              style={styles.cancelArrow}
            />
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
    backgroundColor: "#FFF5EC",
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#FF8200",
  },
  dropoffMarker: {
    backgroundColor: "#E8F9E8",
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#36D000",
  },
  bottomSheetBackground: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  handleIndicator: {
    backgroundColor: "#E0E0E0",
    width: 40,
    height: 4,
  },
  headerSection: {
    backgroundColor: "#FF8200",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: 120,
  },
  driverInfoSection: {
    flex: 1,
    justifyContent: "center",
  },
  driverDetails: {
    justifyContent: "center",
  },
  driverName: {
    fontFamily: "Lato-Bold",
    fontSize: 20,
    color: "#fff",
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: "row",
    gap: 2,
  },
  starIcon: {
    marginRight: 2,
  },
  driverPhotoSection: {
    position: "relative",
    alignItems: "flex-end",
  },
  driverPhoto: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: "#fff",
  },
  closeButton: {
    position: "absolute",
    top: -8,
    right: -8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  callButton: {
    position: "absolute",
    right: 20,
    top: 120,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    zIndex: 10,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 20,
  },
  arrivalText: {
    fontFamily: "Lato-Bold",
    fontSize: 16,
    color: "#111",
    marginBottom: 16,
  },
  carCard: {
    backgroundColor: "transparent",
    borderRadius: 0,
    padding: 0,
    marginBottom: 24,
    borderLeftWidth: 0,
    borderLeftColor: "transparent",
  },
  cardTitle: {
    fontFamily: "Lato-Bold",
    fontSize: 14,
    color: "#111",
    marginBottom: 4,
  },
  carDetails: {
    fontFamily: "Lato-Regular",
    fontSize: 14,
    color: "#111",
    lineHeight: 20,
  },
  carPlate: {
    fontFamily: "Lato-Regular",
    fontSize: 12,
    color: "#757575",
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 16,
  },
  routeSection: {
    marginBottom: 20,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: "Lato-Bold",
    fontSize: 16,
    color: "#111",
    marginBottom: 14,
  },
  routeContainer: {
    marginTop: 0,
  },
  routeRow: {
    flexDirection: "row",
    alignItems: "center", // Changed from flex-start to center
    marginBottom: 12,
  },
  routeIconContainer: {
    width: 28,
    alignItems: "center",
    paddingTop: 2,
  },
  pickupDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#36D000",
  },
  connectingLine: {
    width: 2,
    height: 40,
    backgroundColor: "#E0E0E0",
    marginLeft: 13,
    marginVertical: 2,
  },
  routeTextContainer: {
    flex: 1,
    marginLeft: 14,
  },
  locationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  routeDetails: {
    flex: 1,
    marginLeft: 12,
  },
  locationName: {
    fontFamily: "Lato-Bold",
    fontSize: 14,
    color: "#111",
    marginBottom: 2,
  },
  locationSubtext: {
    fontFamily: "Lato-Regular",
    fontSize: 12,
    color: "#757575",
  },
  editText: {
    fontFamily: "Lato-Bold",
    fontSize: 13,
    color: "#111",
  },
  addStopButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    gap: 10,
    marginBottom: 20,
  },
  addStopText: {
    fontFamily: "Lato-Bold",
    fontSize: 15,
    color: "#FF8200",
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
  },
  totalLabel: {
    fontFamily: "Lato-Bold",
    fontSize: 14,
    color: "#111",
  },
  totalPrice: {
    fontFamily: "Lato-Bold",
    fontSize: 16,
    color: "#111",
  },
  cancelButton: {
    backgroundColor: "#EC1A1A",
    borderRadius: 50,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#C41010",
  },
  cancelIcon: {
    marginRight: 8,
  },
  cancelButtonText: {
    fontFamily: "Lato-Bold",
    fontSize: 16,
    color: "#fff",
  },
  cancelArrow: {
    marginLeft: 8,
  },
});
