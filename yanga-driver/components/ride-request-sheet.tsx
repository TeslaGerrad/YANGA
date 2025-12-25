import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/colors";
import { Ride } from "@/types";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface RideRequestSheetProps {
  ride: Ride | null;
  onAccept: (rideId: string, offeredPrice?: number) => void;
  onDismiss: (rideId: string) => void;
  onCounterOffer: (rideId: string, price: number) => void;
}

export const RideRequestSheet = ({
  ride,
  onAccept,
  onDismiss,
  onCounterOffer,
}: RideRequestSheetProps) => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["65%", "90%"], []);
  const [counterOfferPrice, setCounterOfferPrice] = useState("");
  const [showCounterOffer, setShowCounterOffer] = useState(false);

  const handleAccept = useCallback(() => {
    if (ride) {
      onAccept(ride.id);
      bottomSheetRef.current?.close();
      setShowCounterOffer(false);
    }
  }, [ride, onAccept]);

  const handleDismiss = useCallback(() => {
    if (ride) {
      onDismiss(ride.id);
      bottomSheetRef.current?.close();
      setShowCounterOffer(false);
    }
  }, [ride, onDismiss]);

  const handleCounterOffer = useCallback(() => {
    if (ride && counterOfferPrice) {
      const price = parseFloat(counterOfferPrice);
      if (price > 0 && price !== ride.originalPrice) {
        onCounterOffer(ride.id, price);
        Alert.alert(
          "Counter Offer Sent",
          `You offered ZMW ${price.toFixed(2)}`
        );
        setCounterOfferPrice("");
        setShowCounterOffer(false);
      }
    }
  }, [ride, counterOfferPrice, onCounterOffer]);

  React.useEffect(() => {
    if (ride) {
      bottomSheetRef.current?.expand();
    } else {
      bottomSheetRef.current?.close();
    }
  }, [ride]);

  if (!ride) return null;

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={() => setShowCounterOffer(false)}
      backgroundStyle={styles.bottomSheetBackground}
      handleIndicatorStyle={styles.handleIndicator}
    >
      <BottomSheetView style={styles.contentContainer}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>New Ride Request</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {Math.floor(
                  (Date.now() - new Date(ride.requestedAt).getTime()) / 1000
                )}
                s ago
              </Text>
            </View>
          </View>

          {/* Passenger Info */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <IconSymbol name="person.fill" size={20} color="#666" />
              <Text style={styles.sectionTitle}>Passenger</Text>
            </View>
            <View style={styles.passengerInfo}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {ride.passenger.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </Text>
              </View>
              <View style={styles.passengerDetails}>
                <Text style={styles.passengerName}>{ride.passenger.name}</Text>
                <View style={styles.ratingContainer}>
                  <IconSymbol name="star.fill" size={14} color="#FFD700" />
                  <Text style={styles.rating}>
                    {ride.passenger.rating.toFixed(1)}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Trip Details */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <IconSymbol name="location.fill" size={20} color="#666" />
              <Text style={styles.sectionTitle}>Trip Details</Text>
            </View>

            <View style={styles.locationContainer}>
              <View style={styles.locationDot} />
              <View style={styles.locationInfo}>
                <Text style={styles.locationLabel}>Pickup</Text>
                <Text style={styles.locationAddress}>
                  {ride.pickup.address}
                </Text>
              </View>
            </View>

            <View style={styles.locationLine} />

            <View style={styles.locationContainer}>
              <View
                style={[styles.locationDot, styles.locationDotDestination]}
              />
              <View style={styles.locationInfo}>
                <Text style={styles.locationLabel}>Dropoff</Text>
                <Text style={styles.locationAddress}>
                  {ride.dropoff.address}
                </Text>
              </View>
            </View>
          </View>

          {/* Trip Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <IconSymbol name="gauge" size={20} color="#666" />
              <Text style={styles.statValue}>
                {ride.distance.toFixed(1)} km
              </Text>
              <Text style={styles.statLabel}>Distance</Text>
            </View>
            <View style={styles.statItem}>
              <IconSymbol name="clock.fill" size={20} color="#666" />
              <Text style={styles.statValue}>{ride.duration} min</Text>
              <Text style={styles.statLabel}>Duration</Text>
            </View>
            <View style={styles.statItem}>
              <IconSymbol name="banknote" size={20} color={Colors.black} />
              <Text style={[styles.statValue, styles.priceValue]}>
                ZMW {ride.originalPrice.toFixed(2)}
              </Text>
              <Text style={styles.statLabel}>Fare</Text>
            </View>
          </View>

          {/* Counter Offer Section */}
          {!showCounterOffer ? (
            <TouchableOpacity
              style={styles.counterOfferButton}
              onPress={() => setShowCounterOffer(true)}
            >
              <IconSymbol name="dollarsign.circle" size={20} color="#2196F3" />
              <Text style={styles.counterOfferButtonText}>
                Make Counter Offer
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.counterOfferSection}>
              <Text style={styles.counterOfferLabel}>Your Counter Offer</Text>
              <View style={styles.counterOfferInputContainer}>
                <Text style={styles.currencySymbol}>ZMW</Text>
                <TextInput
                  style={styles.counterOfferInput}
                  placeholder={ride.originalPrice.toString()}
                  keyboardType="numeric"
                  value={counterOfferPrice}
                  onChangeText={setCounterOfferPrice}
                />
              </View>
              <View style={styles.counterOfferActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setShowCounterOffer(false);
                    setCounterOfferPrice("");
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.sendOfferButton}
                  onPress={handleCounterOffer}
                >
                  <Text style={styles.sendOfferButtonText}>Send Offer</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.dismissButton}
              onPress={handleDismiss}
            >
              <IconSymbol name="xmark.circle.fill" size={24} color="#fff" />
              <Text style={styles.dismissButtonText}>Dismiss</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.acceptButton}
              onPress={handleAccept}
            >
              <IconSymbol name="checkmark.circle.fill" size={24} color="#fff" />
              <Text style={styles.acceptButtonText}>Accept Ride</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </BottomSheetView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  bottomSheetBackground: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  handleIndicator: {
    backgroundColor: Colors.lightGray,
    width: 40,
    height: 4,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    paddingTop: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.black,
  },
  badge: {
    backgroundColor: Colors.offWhite,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  badgeText: {
    color: Colors.mediumGray,
    fontSize: 12,
    fontWeight: "600",
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.darkGray,
  },
  passengerInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.black,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: "bold",
  },
  passengerDetails: {
    flex: 1,
  },
  passengerName: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.black,
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  rating: {
    fontSize: 14,
    color: Colors.mediumGray,
    fontWeight: "500",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  locationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.black,
    marginTop: 4,
  },
  locationDotDestination: {
    backgroundColor: Colors.darkGray,
  },
  locationInfo: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 12,
    color: Colors.mediumGray,
    marginBottom: 2,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  locationAddress: {
    fontSize: 15,
    color: Colors.black,
    lineHeight: 20,
  },
  locationLine: {
    width: 2,
    height: 20,
    backgroundColor: Colors.border,
    marginLeft: 5,
    marginVertical: 4,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: Colors.offWhite,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statItem: {
    alignItems: "center",
    gap: 6,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.black,
  },
  priceValue: {
    fontSize: 18,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.mediumGray,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  counterOfferButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.offWhite,
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  counterOfferButtonText: {
    color: Colors.black,
    fontSize: 16,
    fontWeight: "600",
  },
  counterOfferSection: {
    backgroundColor: Colors.offWhite,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  counterOfferLabel: {
    fontSize: 14,
    color: Colors.mediumGray,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  counterOfferInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.mediumGray,
    marginRight: 8,
  },
  counterOfferInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.black,
    paddingVertical: 12,
  },
  counterOfferActions: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: Colors.white,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelButtonText: {
    color: Colors.mediumGray,
    fontSize: 16,
    fontWeight: "600",
  },
  sendOfferButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: Colors.black,
    alignItems: "center",
  },
  sendOfferButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  dismissButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    gap: 8,
    borderWidth: 2,
    borderColor: Colors.black,
  },
  dismissButtonText: {
    color: Colors.black,
    fontSize: 16,
    fontWeight: "bold",
  },
  acceptButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.black,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  acceptButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "bold",
  },
});
