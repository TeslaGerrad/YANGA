import { RideRequestSheet } from "@/components/ride-request-sheet";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/colors";
import { useDriver } from "@/context/driver-context";
import { Ride } from "@/types";
import { DrawerActions } from "@react-navigation/native";
import { useNavigation } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";

export default function HomeScreen() {
  const navigation = useNavigation();
  const {
    driver,
    pendingRides,
    acceptedRides,
    acceptRide,
    dismissRide,
    counterOffer,
    completeRide,
  } = useDriver();
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
  const [mapRegion, setMapRegion] = useState({
    latitude: -15.4167,
    longitude: 28.2833,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  });

  useEffect(() => {
    // Auto-select first pending ride when available
    if (pendingRides.length > 0 && !selectedRide) {
      setSelectedRide(pendingRides[0]);
    }
  }, [pendingRides]);

  const handleAcceptRide = (rideId: string, offeredPrice?: number) => {
    acceptRide(rideId, offeredPrice);
    setSelectedRide(null);
    Alert.alert("Ride Accepted!", "Navigate to pickup location");
  };

  const handleDismissRide = (rideId: string) => {
    dismissRide(rideId);
    setSelectedRide(null);
  };

  const handleCounterOffer = (rideId: string, price: number) => {
    counterOffer(rideId, price);
  };

  const renderRideCard = ({ item }: { item: Ride }) => (
    <TouchableOpacity
      style={[
        styles.rideCard,
        selectedRide?.id === item.id && styles.rideCardSelected,
      ]}
      onPress={() => setSelectedRide(item)}
    >
      <View style={styles.rideCardHeader}>
        <View style={styles.passengerBadge}>
          <Text style={styles.passengerInitial}>
            {item.passenger.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </Text>
        </View>
        <View style={styles.rideCardInfo}>
          <Text style={styles.passengerName}>{item.passenger.name}</Text>
          <View style={styles.ratingRow}>
            <IconSymbol name="star.fill" size={12} color="#FFD700" />
            <Text style={styles.ratingText}>
              {item.passenger.rating.toFixed(1)}
            </Text>
          </View>
        </View>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Fare</Text>
          <Text style={styles.priceValue}>ZMW {item.originalPrice}</Text>
        </View>
      </View>
      <View style={styles.rideCardBody}>
        <View style={styles.locationRow}>
          <View style={styles.locationDot} />
          <Text style={styles.locationText} numberOfLines={1}>
            {item.pickup.address}
          </Text>
        </View>
        <View style={styles.locationRow}>
          <View style={[styles.locationDot, styles.locationDotRed]} />
          <Text style={styles.locationText} numberOfLines={1}>
            {item.dropoff.address}
          </Text>
        </View>
      </View>
      <View style={styles.rideCardFooter}>
        <View style={styles.statBadge}>
          <IconSymbol name="gauge" size={14} color="#666" />
          <Text style={styles.statText}>{item.distance.toFixed(1)} km</Text>
        </View>
        <View style={styles.statBadge}>
          <IconSymbol name="clock.fill" size={14} color="#666" />
          <Text style={styles.statText}>{item.duration} min</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderAcceptedRide = ({ item }: { item: Ride }) => (
    <View style={styles.acceptedRideCard}>
      <View style={styles.acceptedRideHeader}>
        <Text style={styles.acceptedRideTitle}>Active Ride</Text>
        <TouchableOpacity
          style={styles.completeButton}
          onPress={() => {
            Alert.alert("Complete Ride", "Mark this ride as completed?", [
              { text: "Cancel", style: "cancel" },
              {
                text: "Complete",
                onPress: () => completeRide(item.id),
              },
            ]);
          }}
        >
          <Text style={styles.completeButtonText}>Complete</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.acceptedPassengerName}>{item.passenger.name}</Text>
      <View style={styles.acceptedLocationContainer}>
        <View style={styles.locationRow}>
          <View style={styles.locationDot} />
          <Text style={styles.locationText}>{item.pickup.address}</Text>
        </View>
        <View style={styles.locationRow}>
          <View style={[styles.locationDot, styles.locationDotRed]} />
          <Text style={styles.locationText}>{item.dropoff.address}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
        >
          <IconSymbol name="line.3.horizontal" size={28} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.greeting}>
            Hello, {driver.name.split(" ")[0]}!
          </Text>
          <View style={styles.statusRow}>
            <View style={styles.onlineDot} />
            <Text style={styles.statusText}>Online</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.ratingBadge}>
            <IconSymbol name="star.fill" size={16} color="#FFD700" />
            <Text style={styles.headerRating}>{driver.rating.toFixed(1)}</Text>
          </View>
        </View>
      </View>

      {/* Map */}
      <View style={styles.mapContainer}>
        <MapView
          provider={PROVIDER_DEFAULT}
          style={styles.map}
          region={mapRegion}
          onRegionChangeComplete={setMapRegion}
        >
          {pendingRides.map((ride) => (
            <Marker
              key={ride.id}
              coordinate={{
                latitude: ride.pickup.latitude,
                longitude: ride.pickup.longitude,
              }}
              title={ride.passenger.name}
              description={`ZMW ${ride.originalPrice}`}
            />
          ))}
          {acceptedRides.map((ride) => (
            <Marker
              key={ride.id}
              coordinate={{
                latitude: ride.pickup.latitude,
                longitude: ride.pickup.longitude,
              }}
              pinColor="green"
              title="Active Ride"
            />
          ))}
        </MapView>
      </View>

      {/* Active Rides Section */}
      {acceptedRides.length > 0 && (
        <View style={styles.acceptedRidesContainer}>
          <FlatList
            data={acceptedRides}
            renderItem={renderAcceptedRide}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        </View>
      )}

      {/* Pending Rides Section */}
      <View style={styles.ridesContainer}>
        <View style={styles.ridesHeader}>
          <Text style={styles.ridesTitle}>Ride Requests</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{pendingRides.length}</Text>
          </View>
        </View>
        {pendingRides.length > 0 ? (
          <FlatList
            data={pendingRides}
            renderItem={renderRideCard}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.ridesList}
          />
        ) : (
          <View style={styles.emptyState}>
            <IconSymbol name="car.fill" size={48} color="#ccc" />
            <Text style={styles.emptyStateText}>
              No ride requests at the moment
            </Text>
            <Text style={styles.emptyStateSubtext}>
              You'll be notified when new requests arrive
            </Text>
          </View>
        )}
      </View>

      {/* Ride Request Bottom Sheet */}
      <RideRequestSheet
        ride={selectedRide}
        onAccept={handleAcceptRide}
        onDismiss={handleDismissRide}
        onCounterOffer={handleCounterOffer}
      />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  greeting: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.black,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 6,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.success,
  },
  statusText: {
    fontSize: 12,
    color: Colors.mediumGray,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.offWhite,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  headerRating: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.black,
  },
  mapContainer: {
    height: 200,
    backgroundColor: Colors.offWhite,
  },
  map: {
    flex: 1,
  },
  acceptedRidesContainer: {
    backgroundColor: Colors.offWhite,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  acceptedRideCard: {
    backgroundColor: Colors.white,
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.black,
    minWidth: 300,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  acceptedRideHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  acceptedRideTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.black,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  completeButton: {
    backgroundColor: Colors.black,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  completeButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "600",
  },
  acceptedPassengerName: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.black,
    marginBottom: 8,
  },
  acceptedLocationContainer: {
    gap: 4,
  },
  ridesContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  ridesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  ridesTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.black,
  },
  countBadge: {
    backgroundColor: Colors.black,
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  countText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "bold",
  },
  ridesList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 8,
  },
  rideCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  rideCardSelected: {
    borderColor: Colors.black,
    borderWidth: 2,
    shadowOpacity: 0.15,
  },
  rideCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  passengerBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.black,
    justifyContent: "center",
    alignItems: "center",
  },
  passengerInitial: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  rideCardInfo: {
    flex: 1,
    marginLeft: 12,
  },
  passengerName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.black,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  ratingText: {
    fontSize: 12,
    color: Colors.mediumGray,
  },
  priceContainer: {
    alignItems: "flex-end",
  },
  priceLabel: {
    fontSize: 11,
    color: Colors.mediumGray,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.black,
    marginTop: 2,
  },
  rideCardBody: {
    marginBottom: 12,
    gap: 8,
    paddingLeft: 4,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  locationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.black,
  },
  locationDotRed: {
    backgroundColor: Colors.darkGray,
  },
  locationText: {
    flex: 1,
    fontSize: 14,
    color: Colors.darkGray,
  },
  rideCardFooter: {
    flexDirection: "row",
    gap: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  statBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statText: {
    fontSize: 13,
    color: Colors.mediumGray,
    fontWeight: "500",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.darkGray,
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.mediumGray,
    marginTop: 8,
    textAlign: "center",
    paddingHorizontal: 40,
  },
});
