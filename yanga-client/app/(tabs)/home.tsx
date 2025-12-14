import { Colors } from '@/constants/colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '@/store/useAuthStore';
import { useRideStore } from '@/store/useRideStore';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const { user } = useAuthStore();
  const { currentRide, pickup } = useRideStore();
  
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
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
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Loading map...
        </Text>
      </View>
    );
  }

  if (!location) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
        <Ionicons name="location-outline" size={64} color={colors.textSecondary} />
        <Text style={[styles.errorText, { color: colors.text }]}>
          Location permission required
        </Text>
        <Text style={[styles.errorSubtext, { color: colors.textSecondary }]}>
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

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={initialRegion}
        showsUserLocation
        showsMyLocationButton={false}
        customMapStyle={colorScheme === 'dark' ? darkMapStyle : []}
      >
        {pickup && (
          <Marker
            coordinate={{
              latitude: pickup.latitude,
              longitude: pickup.longitude,
            }}
            title="Pickup Location"
          >
            <View style={[styles.markerContainer, { backgroundColor: colors.primary }]}>
              <Ionicons name="location" size={24} color={colors.secondary} />
            </View>
          </Marker>
        )}
      </MapView>

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <View style={styles.headerContent}>
          <View>
            <Text style={[styles.greeting, { color: colors.textSecondary }]}>
              Hello,
            </Text>
            <Text style={[styles.userName, { color: colors.text }]}>
              {user?.name || 'Guest'}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.menuButton, { backgroundColor: colors.card }]}
            onPress={() => router.push('/modal')}
          >
            <Ionicons name="menu" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Action Card */}
      {!currentRide && (
        <View style={[styles.bottomCard, { backgroundColor: colors.background }]}>
          <Text style={[styles.bottomCardTitle, { color: colors.text }]}>
            Where would you like to go?
          </Text>
          <TouchableOpacity
            style={[styles.searchButton, { backgroundColor: colors.card }]}
            onPress={() => router.push('/booking')}
          >
            <Ionicons name="search" size={20} color={colors.textSecondary} />
            <Text style={[styles.searchButtonText, { color: colors.textSecondary }]}>
              Search destination
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Current Location Button */}
      <TouchableOpacity
        style={[styles.locationButton, { backgroundColor: colors.background }]}
        onPress={async () => {
          const currentLocation = await Location.getCurrentPositionAsync({});
          setLocation(currentLocation);
        }}
      >
        <Ionicons name="locate" size={24} color={colors.text} />
      </TouchableOpacity>
    </View>
  );
}

const darkMapStyle = [
  {
    elementType: 'geometry',
    stylers: [{ color: '#212121' }],
  },
  {
    elementType: 'labels.icon',
    stylers: [{ visibility: 'off' }],
  },
  {
    elementType: 'labels.text.fill',
    stylers: [{ color: '#757575' }],
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#212121' }],
  },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
  },
  errorSubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 14,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  menuButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  bottomCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  searchButtonText: {
    marginLeft: 12,
    fontSize: 16,
  },
  locationButton: {
    position: 'absolute',
    right: 20,
    bottom: 200,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  markerContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
