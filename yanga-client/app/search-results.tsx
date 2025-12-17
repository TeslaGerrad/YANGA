import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Image assets from Figma (7-day CDN URLs)
const images = {
  path14:
    "https://www.figma.com/api/mcp/asset/b5f62970-d437-4464-9afc-73c95bcbd8b0",
  batteryShape1:
    "https://www.figma.com/api/mcp/asset/89c6bf5a-3edb-4834-b94a-88282dd904f4",
  batteryShape2:
    "https://www.figma.com/api/mcp/asset/ce8f9372-1ade-4179-8d39-bfd161a5cdb6",
  batteryShape3:
    "https://www.figma.com/api/mcp/asset/0b62a13f-f6df-42ee-b3c1-b52f737763b7",
  wifiShape:
    "https://www.figma.com/api/mcp/asset/4863037e-9ff6-4bf6-8a1a-0962e6764357",
  cellularShape:
    "https://www.figma.com/api/mcp/asset/e8101456-e44c-4e74-9d65-3f11f248dd9a",
  locationBg:
    "https://www.figma.com/api/mcp/asset/941a9cf5-0a70-402c-bf74-43c1f0d1e02e",
  locationIcon:
    "https://www.figma.com/api/mcp/asset/60fe9b92-08ea-4be9-886d-e3eb2849bfcb",
  dividerLine:
    "https://www.figma.com/api/mcp/asset/35de987b-dd0b-4512-a21a-0ba6065823f9",
  backIcon:
    "https://www.figma.com/api/mcp/asset/3429815d-5532-401f-ad2f-e8daec484521",
  currentLocationIcon:
    "https://www.figma.com/api/mcp/asset/172ae5aa-20de-4e59-afbe-65ba1b6bd288",
  circleGreen:
    "https://www.figma.com/api/mcp/asset/6634abb5-5a51-4d37-b93f-13349db4499e",
  circleGray:
    "https://www.figma.com/api/mcp/asset/b11b910b-9035-4f84-b879-68bbe6f74b1e",
  connectingLine:
    "https://www.figma.com/api/mcp/asset/07c0b9a4-7835-4b38-87d0-16c0b5588608",
  addLocationIcon:
    "https://www.figma.com/api/mcp/asset/962364d4-591e-47bd-957d-b6bb3b0a5d12",
};

interface LocationItemProps {
  name: string;
  address: string;
  distance: string;
  onPress: () => void;
}

const LocationItem: React.FC<LocationItemProps> = ({
  name,
  address,
  distance,
  onPress,
}) => (
  <TouchableOpacity style={styles.locationItem} onPress={onPress}>
    <View style={styles.locationIconContainer}>
      <Image source={{ uri: images.locationBg }} style={styles.locationBg} />
      <Image
        source={{ uri: images.locationIcon }}
        style={styles.locationIcon}
      />
    </View>
    <View style={styles.locationInfo}>
      <Text style={styles.locationName}>{name}</Text>
      <Text style={styles.locationAddress}>{address}</Text>
    </View>
    <Text style={styles.locationDistance}>{distance}</Text>
  </TouchableOpacity>
);

export default function SearchResultsScreen() {
  const [searchQuery, setSearchQuery] = useState("");

  // Dummy data - will be replaced with Places API
  const allLocations = [
    {
      name: "Mungue Shopping Mall",
      address: "Last street Aisha",
      distance: "5.2 km",
      lat: -15.4067,
      lng: 28.2933,
    },
    {
      name: "Mex Hospital",
      address: "Ku hospita",
      distance: "8.1 km",
      lat: -15.4267,
      lng: 28.2633,
    },
    {
      name: "Mungule Market",
      address: "10 miles",
      distance: "8.5 km",
      lat: -15.3967,
      lng: 28.3033,
    },
    {
      name: "FX Lion Restaurant",
      address: "fx lion street",
      distance: "9.3 km",
      lat: -15.4467,
      lng: 28.2733,
    },
    {
      name: "The Leader Hotel",
      address: "Smiles Avenue",
      distance: "2.8 km",
      lat: -15.4087,
      lng: 28.2893,
    },
    {
      name: "Six Miles Plaza",
      address: "Chalala Road",
      distance: "8.0 km",
      lat: -15.4367,
      lng: 28.2533,
    },
    {
      name: "Arcades Shopping Centre",
      address: "Great East Road",
      distance: "6.5 km",
      lat: -15.4147,
      lng: 28.2983,
    },
    {
      name: "Levy Mall",
      address: "Church Road",
      distance: "4.2 km",
      lat: -15.4127,
      lng: 28.2883,
    },
    {
      name: "East Park Mall",
      address: "Great East Road",
      distance: "7.8 km",
      lat: -15.4247,
      lng: 28.3133,
    },
    {
      name: "Kafue Road Park",
      address: "Kafue Road",
      distance: "3.5 km",
      lat: -15.4197,
      lng: 28.2763,
    },
  ];

  const filteredLocations = searchQuery.trim()
    ? allLocations.filter(
        (loc) =>
          loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          loc.address.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allLocations;

  const handleLocationSelect = (location: (typeof allLocations)[0]) => {
    console.log("Selected location:", location);
    // Pass location data back via navigation params
    router.push({
      pathname: "/search-destination",
      params: {
        destinationName: location.name,
        destinationLat: location.lat.toString(),
        destinationLng: location.lng.toString(),
      },
    });
  };

  const handleCurrentLocation = () => {
    console.log("Using current location");
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#111" />
        </TouchableOpacity>
        <View style={styles.headerIcons}>
          <Image
            source={{ uri: images.cellularShape }}
            style={styles.headerIcon}
          />
          <Image source={{ uri: images.wifiShape }} style={styles.headerIcon} />
          <Image
            source={{ uri: images.batteryShape1 }}
            style={styles.headerIcon}
          />
        </View>
      </View>

      {/* Search Input */}
      <View style={styles.searchInputContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#5b5b5b"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search location..."
          placeholderTextColor="#5b5b5b"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoFocus
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={20} color="#5b5b5b" />
          </TouchableOpacity>
        )}
      </View>

      {/* Location Results List */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {filteredLocations.length > 0 ? (
          filteredLocations.map((location, index) => (
            <View key={index}>
              <LocationItem
                name={location.name}
                address={location.address}
                distance={location.distance}
                onPress={() => handleLocationSelect(location)}
              />
              {index < filteredLocations.length - 1 && (
                <View style={styles.itemDivider} />
              )}
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={48} color="#ccc" />
            <Text style={styles.emptyStateText}>No locations found</Text>
            <Text style={styles.emptyStateSubtext}>
              Try a different search term
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Current Location Button */}
      <View style={styles.bottomContainer}>
        <View style={styles.bottomIndicator} />
        <TouchableOpacity
          style={styles.currentLocationButton}
          onPress={handleCurrentLocation}
        >
          <Image
            source={{ uri: images.currentLocationIcon }}
            style={styles.currentLocationBtnIcon}
          />
          <Text style={styles.currentLocationBtnText}>Current Location</Text>
        </TouchableOpacity>
      </View>
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
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    height: 44,
  },
  backButton: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTime: {
    fontFamily: "Lato-Regular",
    fontSize: 12,
    color: "#111",
    position: "absolute",
    left: 20,
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  headerIcon: {
    width: 16,
    height: 12,
    resizeMode: "contain",
  },
  searchBarContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    marginHorizontal: 20,
    marginBottom: 16,
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  searchIcon: {
    marginRight: 4,
  },
  searchInput: {
    flex: 1,
    fontFamily: "Lato-Regular",
    fontSize: 16,
    color: "#111",
    padding: 0,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyStateText: {
    fontFamily: "Lato-Bold",
    fontSize: 18,
    color: "#5b5b5b",
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontFamily: "Lato-Regular",
    fontSize: 14,
    color: "#999",
    marginTop: 8,
  },
  addLocationCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
    flexDirection: "row",
    minHeight: 155,
  },
  locationIndicators: {
    width: 30,
    alignItems: "center",
    paddingTop: 24,
  },
  circle: {
    width: 10,
    height: 10,
    resizeMode: "contain",
  },
  connectingLineContainer: {
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 4,
  },
  connectingLine: {
    width: 2,
    height: 60,
    resizeMode: "stretch",
  },
  locationTexts: {
    flex: 1,
    paddingLeft: 14,
    paddingTop: 19,
  },
  fromText: {
    fontFamily: "Lato-Regular",
    fontSize: 16,
    color: "#111",
    textTransform: "capitalize",
    marginBottom: 10,
  },
  currentLocationText: {
    fontFamily: "Lato-Regular",
    fontSize: 14,
    color: "#36d000",
    lineHeight: 20,
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: "#5b5b5b",
    marginBottom: 16,
  },
  whereToText: {
    fontFamily: "Lato-Regular",
    fontSize: 16,
    color: "#111",
    textTransform: "capitalize",
    marginBottom: 10,
  },
  destinationText: {
    fontFamily: "Lato-Regular",
    fontSize: 14,
    color: "#757575",
  },
  addLocationBtn: {
    width: 24,
    height: 24,
    marginTop: 60,
  },
  addLocationIcon: {
    width: 24,
    height: 24,
    resizeMode: "contain",
  },
  scrollView: {
    flex: 1,
  },
  locationItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 28,
    paddingVertical: 12,
  },
  locationIconContainer: {
    width: 30,
    height: 30,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  locationBg: {
    width: 30,
    height: 30,
    position: "absolute",
    resizeMode: "contain",
  },
  locationIcon: {
    width: 12,
    height: 12,
    resizeMode: "contain",
  },
  locationInfo: {
    flex: 1,
    marginLeft: 15,
  },
  locationName: {
    fontFamily: "Lato-Regular",
    fontSize: 14,
    color: "#111",
    lineHeight: 20,
    marginBottom: 2,
  },
  locationAddress: {
    fontFamily: "Lato-Regular",
    fontSize: 12,
    color: "#999",
  },
  locationDistance: {
    fontFamily: "Lato-Medium",
    fontSize: 10,
    color: "#111",
    textAlign: "right",
  },
  itemDivider: {
    height: 1,
    backgroundColor: "#ebebeb",
    marginHorizontal: 20,
  },
  bottomContainer: {
    paddingHorizontal: 53,
    paddingVertical: 20,
    alignItems: "center",
  },
  bottomIndicator: {
    width: 95.67,
    height: 6.31,
    backgroundColor: "#e7e7e7",
    borderRadius: 50,
    marginBottom: 20,
  },
  currentLocationButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#5b5b5b",
    borderRadius: 50,
    paddingVertical: 12,
    paddingHorizontal: 24,
    width: 270,
    height: 50,
  },
  currentLocationBtnIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
    resizeMode: "contain",
  },
  currentLocationBtnText: {
    fontFamily: "Lato-Bold",
    fontSize: 20,
    color: "#5b5b5b",
  },
});
