import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const GOOGLE_MAPS_API_KEY =
  Constants.expoConfig?.extra?.googleMapsApiKey ||
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ||
  "";

// Demo locations for testing (Lusaka, Zambia)
const DEMO_LOCATIONS = [
  {
    place_id: "demo_1",
    description: "Manda Hill Shopping Mall, Great East Road, Lusaka",
    structured_formatting: {
      main_text: "Manda Hill Shopping Mall",
      secondary_text: "Great East Road, Lusaka",
    },
    latitude: -15.3875,
    longitude: 28.3228,
  },
  {
    place_id: "demo_2",
    description: "Cairo Road, Lusaka City Centre",
    structured_formatting: {
      main_text: "Cairo Road",
      secondary_text: "Lusaka City Centre",
    },
    latitude: -15.4167,
    longitude: 28.2833,
  },
  {
    place_id: "demo_3",
    description: "Levy Junction Shopping Mall, Church Road, Lusaka",
    structured_formatting: {
      main_text: "Levy Junction",
      secondary_text: "Church Road, Lusaka",
    },
    latitude: -15.4127,
    longitude: 28.2883,
  },
  {
    place_id: "demo_4",
    description: "East Park Mall, Great East Road, Lusaka",
    structured_formatting: {
      main_text: "East Park Mall",
      secondary_text: "Great East Road, Lusaka",
    },
    latitude: -15.4247,
    longitude: 28.3133,
  },
  {
    place_id: "demo_5",
    description: "Kenneth Kaunda International Airport, Lusaka",
    structured_formatting: {
      main_text: "KK International Airport",
      secondary_text: "Airport Road, Lusaka",
    },
    latitude: -15.3308,
    longitude: 28.4526,
  },
  {
    place_id: "demo_6",
    description: "University of Zambia, Great East Road",
    structured_formatting: {
      main_text: "UNZA",
      secondary_text: "Great East Road, Lusaka",
    },
    latitude: -15.3906,
    longitude: 28.3234,
  },
  {
    place_id: "demo_7",
    description: "Arcades Shopping Centre, Great East Road, Lusaka",
    structured_formatting: {
      main_text: "Arcades Shopping Centre",
      secondary_text: "Great East Road, Lusaka",
    },
    latitude: -15.4147,
    longitude: 28.2983,
  },
  {
    place_id: "demo_8",
    description: "Levy Business Park, Levy Park, Lusaka",
    structured_formatting: {
      main_text: "Levy Business Park",
      secondary_text: "Levy Park, Lusaka",
    },
    latitude: -15.4097,
    longitude: 28.2893,
  },
  {
    place_id: "demo_9",
    description: "Mungwi Market, Chilimbulu Road, Lusaka",
    structured_formatting: {
      main_text: "Mungwi Market",
      secondary_text: "Chilimbulu Road, Lusaka",
    },
    latitude: -15.3967,
    longitude: 28.3033,
  },
  {
    place_id: "demo_10",
    description: "Shoprite Cosmopolitan Mall, Cairo Road, Lusaka",
    structured_formatting: {
      main_text: "Cosmopolitan Mall",
      secondary_text: "Cairo Road, Lusaka",
    },
    latitude: -15.4187,
    longitude: 28.2843,
  },
];

interface PlacePrediction {
  description: string;
  place_id: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
  distance_meters?: number;
}

interface LocationItemProps {
  name: string;
  address: string;
  distance?: string;
  onPress: () => void;
}

const LocationItem: React.FC<LocationItemProps> = ({
  name,
  address,
  distance,
  onPress,
}) => (
  <TouchableOpacity
    style={styles.locationItem}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.locationIconContainer}>
      <View style={styles.locationIconBg}>
        <Ionicons name="location" size={16} color="#666" />
      </View>
    </View>
    <View style={styles.locationInfo}>
      <Text style={styles.locationName} numberOfLines={1}>
        {name}
      </Text>
      <Text style={styles.locationAddress} numberOfLines={1}>
        {address}
      </Text>
    </View>
    {distance && <Text style={styles.locationDistance}>{distance}</Text>}
  </TouchableOpacity>
);

export default function SearchResultsScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  // Get current location for better search results
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const location = await Location.getCurrentPositionAsync({});
        setCurrentLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      }
    })();
  }, []);

  // Debounced search function
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length > 2) {
        searchPlaces(searchQuery);
      } else if (searchQuery.trim().length === 0) {
        // Show demo locations when search is empty
        setPredictions(DEMO_LOCATIONS as any);
      } else {
        setPredictions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const searchPlaces = async (query: string) => {
    if (!GOOGLE_MAPS_API_KEY) {
      console.warn("Google Maps API key not configured - using demo data");
      // Use demo data when API key is not available
      const filtered = DEMO_LOCATIONS.filter(
        (loc) =>
          loc.structured_formatting.main_text
            .toLowerCase()
            .includes(query.toLowerCase()) ||
          loc.structured_formatting.secondary_text
            .toLowerCase()
            .includes(query.toLowerCase())
      );
      setPredictions(filtered as any);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const locationBias = currentLocation
        ? `&location=${currentLocation.latitude},${currentLocation.longitude}&radius=50000`
        : "&components=country:zm"; // Zambia country bias

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
          query
        )}&key=${GOOGLE_MAPS_API_KEY}${locationBias}`
      );

      const data = await response.json();

      if (data.status === "OK") {
        setPredictions(data.predictions || []);
      } else {
        console.warn(
          "Places API error:",
          data.status,
          "- falling back to demo data"
        );
        // Fallback to demo data if API fails
        const filtered = DEMO_LOCATIONS.filter(
          (loc) =>
            loc.structured_formatting.main_text
              .toLowerCase()
              .includes(query.toLowerCase()) ||
            loc.structured_formatting.secondary_text
              .toLowerCase()
              .includes(query.toLowerCase())
        );
        setPredictions(filtered as any);
      }
    } catch (error) {
      console.error("Error fetching places:", error);
      // Fallback to demo data on error
      const filtered = DEMO_LOCATIONS.filter(
        (loc) =>
          loc.structured_formatting.main_text
            .toLowerCase()
            .includes(query.toLowerCase()) ||
          loc.structured_formatting.secondary_text
            .toLowerCase()
            .includes(query.toLowerCase())
      );
      setPredictions(filtered as any);
    } finally {
      setLoading(false);
    }
  };

  const getPlaceDetails = async (placeId: string) => {
    if (!GOOGLE_MAPS_API_KEY) return;

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry,name,formatted_address&key=${GOOGLE_MAPS_API_KEY}`
      );

      const data = await response.json();

      if (data.status === "OK" && data.result) {
        const { geometry, name, formatted_address } = data.result;
        return {
          latitude: geometry.location.lat,
          longitude: geometry.location.lng,
          name: name,
          address: formatted_address,
        };
      }
    } catch (error) {
      console.error("Error fetching place details:", error);
    }
    return null;
  };

  const handleLocationSelect = async (prediction: PlacePrediction) => {
    // Check if it's a demo location (has latitude/longitude properties)
    const isDemoLocation =
      "latitude" in prediction && "longitude" in prediction;

    if (isDemoLocation) {
      // Use demo location directly
      router.push({
        pathname: "/search-destination",
        params: {
          destinationName: prediction.structured_formatting.main_text,
          destinationLat: (prediction as any).latitude.toString(),
          destinationLng: (prediction as any).longitude.toString(),
          destinationAddress: prediction.description,
        },
      });
    } else {
      // Fetch from Places API
      const placeDetails = await getPlaceDetails(prediction.place_id);

      if (placeDetails) {
        router.push({
          pathname: "/search-destination",
          params: {
            destinationName: placeDetails.name,
            destinationLat: placeDetails.latitude.toString(),
            destinationLng: placeDetails.longitude.toString(),
            destinationAddress: placeDetails.address,
          },
        });
      }
    }
  };

  const handleCurrentLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === "granted") {
      const location = await Location.getCurrentPositionAsync({});

      // Reverse geocode to get address
      const address = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (address && address[0]) {
        router.push({
          pathname: "/search-destination",
          params: {
            destinationName: "Current Location",
            destinationLat: location.coords.latitude.toString(),
            destinationLng: location.coords.longitude.toString(),
            destinationAddress: `${address[0].street || ""}, ${
              address[0].city || ""
            }`,
          },
        });
      }
    }
  };

  const calculateDistance = (meters?: number): string => {
    if (!meters) return "";
    const km = meters / 1000;
    return km < 1 ? `${Math.round(meters)} m` : `${km.toFixed(1)} km`;
  };
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Search destination</Text>
      </View>

      {/* Search Input */}
      <View style={styles.searchInputContainer}>
        <View style={styles.searchIconWrapper}>
          <Ionicons name="search" size={20} color="#fff" />
        </View>
        <TextInput
          style={styles.searchInput}
          placeholder="Where to?"
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoFocus
          returnKeyType="search"
        />
        {loading && <ActivityIndicator size="small" color="#000" />}
        {searchQuery.length > 0 && !loading && (
          <TouchableOpacity
            onPress={() => setSearchQuery("")}
            activeOpacity={0.7}
          >
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {/* Current Location Button - Always visible at top */}
      <TouchableOpacity
        style={styles.currentLocationTopButton}
        onPress={handleCurrentLocation}
        activeOpacity={0.7}
      >
        <View style={styles.currentLocationIconWrapper}>
          <Ionicons name="navigate" size={18} color="#000" />
        </View>
        <Text style={styles.currentLocationTopText}>Use current location</Text>
      </TouchableOpacity>

      {/* Location Results List */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {predictions.length > 0 ? (
          predictions.map((prediction, index) => (
            <View key={prediction.place_id}>
              <LocationItem
                name={prediction.structured_formatting.main_text}
                address={prediction.structured_formatting.secondary_text}
                distance={calculateDistance(prediction.distance_meters)}
                onPress={() => handleLocationSelect(prediction)}
              />
              {index < predictions.length - 1 && (
                <View style={styles.itemDivider} />
              )}
            </View>
          ))
        ) : searchQuery.trim().length > 0 && !loading ? (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={48} color="#ddd" />
            <Text style={styles.emptyStateText}>No results found</Text>
            <Text style={styles.emptyStateSubtext}>
              Try searching for a different location
            </Text>
          </View>
        ) : !searchQuery.trim() ? (
          <View style={styles.emptyState}>
            <Ionicons name="location-outline" size={48} color="#ddd" />
            <Text style={styles.emptyStateText}>
              Where would you like to go?
            </Text>
            <Text style={styles.emptyStateSubtext}>
              Search for a place or use your current location
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    marginHorizontal: 16,
    marginVertical: 16,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 12 : 8,
    borderRadius: 12,
    gap: 12,
  },
  searchIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#000",
    padding: 0,
  },
  currentLocationTopButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
  },
  currentLocationIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  currentLocationTopText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginTop: 16,
    textAlign: "center",
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
  },
  locationItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  locationIconContainer: {
    marginRight: 12,
  },
  locationIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  locationInfo: {
    flex: 1,
    marginRight: 12,
  },
  locationName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 14,
    color: "#666",
  },
  locationDistance: {
    fontSize: 12,
    color: "#999",
    fontWeight: "500",
  },
  itemDivider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginLeft: 64,
  },
});
