import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRideStore } from '@/store/useRideStore';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';

export default function HistoryScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const { rideHistory } = useRideStore();

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return colors.success;
      case 'cancelled':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return 'checkmark-circle';
      case 'cancelled':
        return 'close-circle';
      default:
        return 'time';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Ride History
        </Text>
      </View>

      {rideHistory.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="car-outline" size={64} color={colors.textSecondary} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            No ride history
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Your completed and cancelled rides will appear here
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {rideHistory.map((ride) => (
            <Card
              key={ride.id}
              style={styles.rideCard}
              onPress={() => {
                // Could navigate to ride details
              }}
            >
              <View style={styles.rideHeader}>
                <View style={styles.dateContainer}>
                  <Text style={[styles.date, { color: colors.text }]}>
                    {formatDate(ride.createdAt)}
                  </Text>
                  <Text style={[styles.time, { color: colors.textSecondary }]}>
                    {formatTime(ride.createdAt)}
                  </Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: `${getStatusColor(ride.status)}20` },
                  ]}
                >
                  <Ionicons
                    name={getStatusIcon(ride.status) as any}
                    size={16}
                    color={getStatusColor(ride.status)}
                  />
                  <Text
                    style={[
                      styles.statusText,
                      { color: getStatusColor(ride.status) },
                    ]}
                  >
                    {ride.status.charAt(0).toUpperCase() + ride.status.slice(1)}
                  </Text>
                </View>
              </View>

              <View style={styles.locationContainer}>
                <View style={styles.locationRow}>
                  <View style={[styles.locationDot, { backgroundColor: colors.primary }]} />
                  <Text
                    style={[styles.locationText, { color: colors.text }]}
                    numberOfLines={1}
                  >
                    {ride.pickup.address}
                  </Text>
                </View>
                <View style={[styles.dashedLine, { borderColor: colors.border }]} />
                <View style={styles.locationRow}>
                  <Ionicons name="location" size={12} color={colors.primary} />
                  <Text
                    style={[styles.locationText, { color: colors.text }]}
                    numberOfLines={1}
                  >
                    {ride.destination.address}
                  </Text>
                </View>
              </View>

              <View style={styles.rideFooter}>
                <View style={styles.vehicleContainer}>
                  <Ionicons
                    name={ride.vehicleType.icon as any}
                    size={20}
                    color={colors.text}
                  />
                  <Text style={[styles.vehicleType, { color: colors.textSecondary }]}>
                    {ride.vehicleType.name}
                  </Text>
                </View>
                <Text style={[styles.fare, { color: colors.text }]}>
                  ${ride.fare.toFixed(2)}
                </Text>
              </View>
            </Card>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  rideCard: {
    padding: 16,
    marginBottom: 16,
  },
  rideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  dateContainer: {
    flex: 1,
  },
  date: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  time: {
    fontSize: 14,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  locationContainer: {
    marginBottom: 16,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  locationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  locationText: {
    fontSize: 14,
    flex: 1,
  },
  dashedLine: {
    borderLeftWidth: 1,
    borderStyle: 'dashed',
    marginLeft: 6,
    height: 16,
    marginVertical: 4,
  },
  rideFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  vehicleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  vehicleType: {
    fontSize: 14,
  },
  fare: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
