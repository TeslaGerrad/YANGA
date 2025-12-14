import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRideStore, VEHICLE_TYPES } from '@/store/useRideStore';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function BookingScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const {
    pickup,
    destination,
    selectedVehicle,
    estimatedFare,
    setPickup,
    setDestination,
    setSelectedVehicle,
    bookRide,
  } = useRideStore();
  
  const [pickupAddress, setPickupAddress] = useState('');
  const [destinationAddress, setDestinationAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVehicleSelect = (vehicle: typeof VEHICLE_TYPES[0]) => {
    setSelectedVehicle(vehicle);
  };

  const handleBookRide = async () => {
    if (!pickupAddress || !destinationAddress || !selectedVehicle) {
      return;
    }
    
    setLoading(true);
    try {
      // Mock coordinates for demo
      setPickup({
        latitude: 37.78825,
        longitude: -122.4324,
        address: pickupAddress,
      });
      
      setDestination({
        latitude: 37.79825,
        longitude: -122.4424,
        address: destinationAddress,
      });
      
      await bookRide();
      router.push('/trip');
    } catch (error) {
      console.error('Booking failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Book a Ride
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Location Inputs */}
        <Card style={styles.locationCard}>
          <View style={styles.locationInputContainer}>
            <Ionicons name="ellipse" size={12} color={colors.primary} />
            <TextInput
              style={[styles.locationInput, { color: colors.text }]}
              placeholder="Pickup location"
              placeholderTextColor={colors.textSecondary}
              value={pickupAddress}
              onChangeText={setPickupAddress}
            />
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.locationInputContainer}>
            <Ionicons name="location" size={12} color={colors.primary} />
            <TextInput
              style={[styles.locationInput, { color: colors.text }]}
              placeholder="Where to?"
              placeholderTextColor={colors.textSecondary}
              value={destinationAddress}
              onChangeText={setDestinationAddress}
            />
          </View>
        </Card>

        {/* Saved Locations */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Saved Locations
          </Text>
          <Card style={styles.savedLocation}>
            <Ionicons name="home" size={20} color={colors.text} />
            <Text style={[styles.savedLocationText, { color: colors.text }]}>
              Home
            </Text>
          </Card>
          <Card style={styles.savedLocation}>
            <Ionicons name="briefcase" size={20} color={colors.text} />
            <Text style={[styles.savedLocationText, { color: colors.text }]}>
              Work
            </Text>
          </Card>
        </View>

        {/* Vehicle Selection */}
        {pickupAddress && destinationAddress && (
          <>
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Choose a Vehicle
              </Text>
              {VEHICLE_TYPES.map((vehicle) => (
                <Card
                  key={vehicle.id}
                  style={
                    selectedVehicle?.id === vehicle.id
                      ? {
                          ...styles.vehicleCard,
                          borderColor: colors.primary,
                          borderWidth: 2,
                        }
                      : styles.vehicleCard
                  }
                  onPress={() => handleVehicleSelect(vehicle)}
                >
                  <View style={styles.vehicleInfo}>
                    <Ionicons
                      name={vehicle.icon as any}
                      size={32}
                      color={colors.text}
                    />
                    <View style={styles.vehicleDetails}>
                      <Text style={[styles.vehicleName, { color: colors.text }]}>
                        {vehicle.name}
                      </Text>
                      <Text style={[styles.vehicleEta, { color: colors.textSecondary }]}>
                        {vehicle.eta} • {vehicle.capacity} seats
                      </Text>
                    </View>
                  </View>
                  {estimatedFare && selectedVehicle?.id === vehicle.id && (
                    <Text style={[styles.vehiclePrice, { color: colors.text }]}>
                      K{(estimatedFare * vehicle.priceMultiplier).toFixed(2)}
                    </Text>
                  )}
                </Card>
              ))}
            </View>

            {/* Booking Summary */}
            {selectedVehicle && estimatedFare && (
              <Card style={styles.summaryCard} elevated>
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                    Estimated Fare
                  </Text>
                  <Text style={[styles.summaryValue, { color: colors.text }]}>
                    K{estimatedFare.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                    Distance
                  </Text>
                  <Text style={[styles.summaryValue, { color: colors.text }]}>
                    ~10.5 km
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                    Est. Time
                  </Text>
                  <Text style={[styles.summaryValue, { color: colors.text }]}>
                    15 min
                  </Text>
                </View>
              </Card>
            )}
          </>
        )}
      </ScrollView>

      {/* Bottom Action */}
      {pickupAddress && destinationAddress && selectedVehicle && (
        <View style={[styles.bottomAction, { backgroundColor: colors.background }]}>
          <Button
            title={`Book ${selectedVehicle.name} - K${estimatedFare?.toFixed(2)}`}
            onPress={handleBookRide}
            loading={loading}
            style={styles.bookButton}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  locationCard: {
    padding: 0,
    marginBottom: 24,
  },
  locationInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  locationInput: {
    flex: 1,
    marginLeft: 16,
    fontSize: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginLeft: 44,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  savedLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 8,
  },
  savedLocationText: {
    marginLeft: 16,
    fontSize: 16,
  },
  vehicleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginBottom: 12,
  },
  vehicleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  vehicleDetails: {
    marginLeft: 16,
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  vehicleEta: {
    fontSize: 14,
  },
  vehiclePrice: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  summaryCard: {
    padding: 16,
    marginBottom: 24,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  bottomAction: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 32,
  },
  bookButton: {
    width: '100%',
  },
});
