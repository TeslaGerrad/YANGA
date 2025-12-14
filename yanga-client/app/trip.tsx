import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRideStore } from '@/store/useRideStore';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';

const CANCELLATION_REASONS = [
  'Driver is taking too long',
  'Wrong pickup location',
  'Need to change destination',
  'Found another ride',
  'Personal emergency',
  'Other',
];

export default function TripScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const { currentRide, cancelRide, completeRide } = useRideStore();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  if (!currentRide) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.emptyState}>
          <Ionicons name="car-outline" size={64} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.text }]}>
            No active ride
          </Text>
          <Button
            title="Book a Ride"
            onPress={() => router.push('/booking')}
            style={styles.emptyButton}
          />
        </View>
      </View>
    );
  }

  const handleCancelRide = async () => {
    if (!selectedReason) return;
    
    setCancelling(true);
    try {
      await cancelRide(selectedReason);
      setShowCancelModal(false);
      router.replace('/(tabs)/home');
    } catch (error) {
      console.error('Cancellation failed:', error);
    } finally {
      setCancelling(false);
    }
  };

  const mockDriver = {
    name: 'John Smith',
    rating: 4.8,
    vehicleType: currentRide.vehicleType.name,
    vehicleNumber: 'ABC 1234',
    photo: undefined,
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
          Trip Details
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Banner */}
        <Card style={StyleSheet.flatten([styles.statusBanner, { backgroundColor: colors.primary }]) as ViewStyle}>
          <Ionicons name="time" size={24} color={colors.secondary} />
          <View style={styles.statusInfo}>
            <Text style={[styles.statusTitle, { color: colors.secondary }]}>
              {currentRide.status === 'pending' ? 'Finding Driver...' : 
               currentRide.status === 'accepted' ? 'Driver is on the way' :
               currentRide.status === 'arrived' ? 'Driver has arrived' :
               'Trip in progress'}
            </Text>
            <Text style={[styles.statusSubtitle, { color: colors.secondary }]}>
              {currentRide.status === 'pending' ? 'This will take a moment' :
               currentRide.status === 'accepted' ? `Arriving in ${currentRide.duration}` :
               currentRide.status === 'arrived' ? 'Ready to go!' :
               `Estimated ${currentRide.duration} remaining`}
            </Text>
          </View>
        </Card>

        {/* Driver Info */}
        {currentRide.status !== 'pending' && (
          <Card style={styles.driverCard}>
            <View style={styles.driverInfo}>
              <View style={[styles.driverAvatar, { backgroundColor: colors.card }]}>
                <Ionicons name="person" size={32} color={colors.text} />
              </View>
              <View style={styles.driverDetails}>
                <Text style={[styles.driverName, { color: colors.text }]}>
                  {mockDriver.name}
                </Text>
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={16} color="#FFD700" />
                  <Text style={[styles.rating, { color: colors.textSecondary }]}>
                    {mockDriver.rating}
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.vehicleInfo}>
              <Text style={[styles.vehicleType, { color: colors.text }]}>
                {mockDriver.vehicleType}
              </Text>
              <Text style={[styles.vehicleNumber, { color: colors.textSecondary }]}>
                {mockDriver.vehicleNumber}
              </Text>
            </View>
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.card }]}
              >
                <Ionicons name="call" size={24} color={colors.text} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.card }]}
              >
                <Ionicons name="chatbubble" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
          </Card>
        )}

        {/* Trip Details */}
        <Card style={styles.tripCard}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            Trip Information
          </Text>
          
          <View style={styles.locationRow}>
            <View style={styles.locationIcon}>
              <View style={[styles.dotIcon, { backgroundColor: colors.primary }]} />
            </View>
            <View style={styles.locationDetails}>
              <Text style={[styles.locationLabel, { color: colors.textSecondary }]}>
                Pickup
              </Text>
              <Text style={[styles.locationAddress, { color: colors.text }]}>
                {currentRide.pickup.address}
              </Text>
            </View>
          </View>

          <View style={[styles.dashedLine, { borderColor: colors.border }]} />

          <View style={styles.locationRow}>
            <View style={styles.locationIcon}>
              <Ionicons name="location" size={16} color={colors.primary} />
            </View>
            <View style={styles.locationDetails}>
              <Text style={[styles.locationLabel, { color: colors.textSecondary }]}>
                Destination
              </Text>
              <Text style={[styles.locationAddress, { color: colors.text }]}>
                {currentRide.destination.address}
              </Text>
            </View>
          </View>
        </Card>

        {/* Fare Details */}
        <Card style={styles.fareCard}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            Fare Details
          </Text>
          
          <View style={styles.fareRow}>
            <Text style={[styles.fareLabel, { color: colors.textSecondary }]}>
              Distance
            </Text>
            <Text style={[styles.fareValue, { color: colors.text }]}>
              {currentRide.distance} km
            </Text>
          </View>

          <View style={styles.fareRow}>
            <Text style={[styles.fareLabel, { color: colors.textSecondary }]}>
              Vehicle Type
            </Text>
            <Text style={[styles.fareValue, { color: colors.text }]}>
              {currentRide.vehicleType.name}
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.fareRow}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>
              Total Fare
            </Text>
            <Text style={[styles.totalValue, { color: colors.text }]}>
              K{currentRide.fare.toFixed(2)}
            </Text>
          </View>
        </Card>

        {/* Cancel Button */}
        {currentRide.status !== 'in-progress' && (
          <Button
            title="Cancel Ride"
            onPress={() => setShowCancelModal(true)}
            variant="outline"
            style={styles.cancelButton}
          />
        )}
      </ScrollView>

      {/* Cancel Modal */}
      <Modal
        visible={showCancelModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCancelModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Cancel Ride
              </Text>
              <TouchableOpacity onPress={() => setShowCancelModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
              Please select a reason for cancellation:
            </Text>

            <ScrollView style={styles.reasonsList}>
              {CANCELLATION_REASONS.map((reason) => (
                <TouchableOpacity
                  key={reason}
                  style={[
                    styles.reasonItem,
                    { borderColor: colors.border },
                    selectedReason === reason && {
                      borderColor: colors.primary,
                      backgroundColor: colors.card,
                    },
                  ]}
                  onPress={() => setSelectedReason(reason)}
                >
                  <Text
                    style={[
                      styles.reasonText,
                      { color: colors.text },
                      selectedReason === reason && { fontWeight: '600' },
                    ]}
                  >
                    {reason}
                  </Text>
                  {selectedReason === reason && (
                    <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.modalActions}>
              <Button
                title="Go Back"
                onPress={() => setShowCancelModal(false)}
                variant="outline"
                style={styles.modalButton}
              />
              <Button
                title="Confirm Cancel"
                onPress={handleCancelRide}
                loading={cancelling}
                disabled={!selectedReason}
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>
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
    paddingBottom: 40,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 24,
  },
  emptyButton: {
    paddingHorizontal: 32,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    marginBottom: 16,
  },
  statusInfo: {
    marginLeft: 16,
    flex: 1,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statusSubtitle: {
    fontSize: 14,
  },
  driverCard: {
    padding: 20,
    marginBottom: 16,
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  driverAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  driverDetails: {
    marginLeft: 16,
    flex: 1,
  },
  driverName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    marginLeft: 4,
    fontSize: 14,
  },
  vehicleInfo: {
    marginBottom: 16,
  },
  vehicleType: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  vehicleNumber: {
    fontSize: 14,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tripCard: {
    padding: 20,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
  },
  locationRow: {
    flexDirection: 'row',
  },
  locationIcon: {
    width: 24,
    alignItems: 'center',
    paddingTop: 2,
  },
  dotIcon: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  locationDetails: {
    flex: 1,
    marginLeft: 12,
  },
  locationLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 16,
  },
  dashedLine: {
    borderLeftWidth: 1,
    borderStyle: 'dashed',
    marginLeft: 11,
    height: 20,
    marginVertical: 8,
  },
  fareCard: {
    padding: 20,
    marginBottom: 16,
  },
  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  fareLabel: {
    fontSize: 14,
  },
  fareValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  cancelButton: {
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  modalSubtitle: {
    fontSize: 14,
    marginBottom: 20,
  },
  reasonsList: {
    marginBottom: 20,
  },
  reasonItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  reasonText: {
    fontSize: 16,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
});
