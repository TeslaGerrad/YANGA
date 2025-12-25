import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/colors";
import { useDriver } from "@/context/driver-context";
import { DrawerActions } from "@react-navigation/native";
import { useNavigation } from "expo-router";
import React from "react";
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { driver, updateDriver, earningsSummary } = useDriver();

  const handleEditProfile = () => {
    Alert.alert("Edit Profile", "Profile editing coming soon!");
  };

  const handleSettings = () => {
    Alert.alert("Settings", "Settings coming soon!");
  };

  const handleSupport = () => {
    Alert.alert("Support", "Contact support at support@yanga.com");
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: () => {} },
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
        >
          <IconSymbol name="line.3.horizontal" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity onPress={handleSettings}>
          <IconSymbol name="gearshape.fill" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {driver.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </Text>
            </View>
            <TouchableOpacity style={styles.editAvatarButton}>
              <IconSymbol name="camera.fill" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.driverName}>{driver.name}</Text>
          <Text style={styles.driverEmail}>{driver.email}</Text>

          <View style={styles.ratingContainer}>
            <IconSymbol name="star.fill" size={20} color="#FFD700" />
            <Text style={styles.rating}>{driver.rating.toFixed(1)}</Text>
            <Text style={styles.ratingLabel}>Driver Rating</Text>
          </View>

          <TouchableOpacity
            style={styles.editButton}
            onPress={handleEditProfile}
          >
            <IconSymbol name="pencil" size={16} color="#2196F3" />
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <View style={styles.statIconContainer}>
                <IconSymbol name="car.fill" size={24} color="#2196F3" />
              </View>
              <Text style={styles.statValue}>{driver.totalRides}</Text>
              <Text style={styles.statLabel}>Total Rides</Text>
            </View>

            <View style={styles.statBox}>
              <View style={[styles.statIconContainer, styles.statIconGreen]}>
                <IconSymbol name="banknote" size={24} color={Colors.black} />
              </View>
              <Text style={styles.statValue}>
                ZMW {earningsSummary.total.toFixed(0)}
              </Text>
              <Text style={styles.statLabel}>Total Earned</Text>
            </View>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <View style={[styles.statIconContainer, styles.statIconOrange]}>
                <IconSymbol name="calendar" size={24} color="#FF9800" />
              </View>
              <Text style={styles.statValue}>{earningsSummary.monthRides}</Text>
              <Text style={styles.statLabel}>Rides This Month</Text>
            </View>

            <View style={styles.statBox}>
              <View style={[styles.statIconContainer, styles.statIconPurple]}>
                <IconSymbol name="clock.fill" size={24} color="#9C27B0" />
              </View>
              <Text style={styles.statValue}>{earningsSummary.todayRides}</Text>
              <Text style={styles.statLabel}>Rides Today</Text>
            </View>
          </View>
        </View>

        {/* Vehicle Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vehicle Information</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <IconSymbol name="car.fill" size={20} color="#2196F3" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Vehicle Model</Text>
                <Text style={styles.infoValue}>{driver.vehicleModel}</Text>
              </View>
            </View>

            <View style={styles.infoDivider} />

            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <IconSymbol name="number" size={20} color="#2196F3" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>License Plate</Text>
                <Text style={styles.infoValue}>{driver.vehiclePlate}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Contact Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <IconSymbol name="phone.fill" size={20} color="#4CAF50" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Phone Number</Text>
                <Text style={styles.infoValue}>{driver.phone}</Text>
              </View>
            </View>

            <View style={styles.infoDivider} />

            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <IconSymbol name="envelope.fill" size={20} color="#4CAF50" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{driver.email}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.actionButton} onPress={handleSupport}>
            <View style={styles.actionLeft}>
              <IconSymbol
                name="questionmark.circle.fill"
                size={24}
                color="#2196F3"
              />
              <Text style={styles.actionText}>Help & Support</Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() =>
              Alert.alert("Documents", "Document management coming soon!")
            }
          >
            <View style={styles.actionLeft}>
              <IconSymbol name="doc.text.fill" size={24} color="#FF9800" />
              <Text style={styles.actionText}>Documents</Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() =>
              Alert.alert("Payment Methods", "Payment setup coming soon!")
            }
          >
            <View style={styles.actionLeft}>
              <IconSymbol name="creditcard.fill" size={24} color="#4CAF50" />
              <Text style={styles.actionText}>Payment Methods</Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => Alert.alert("Ride History", "History coming soon!")}
          >
            <View style={styles.actionLeft}>
              <IconSymbol
                name="clock.arrow.circlepath"
                size={24}
                color="#9C27B0"
              />
              <Text style={styles.actionText}>Ride History</Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color="#ccc" />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <IconSymbol
            name="rectangle.portrait.and.arrow.right"
            size={24}
            color="#F44336"
          />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Yanga Driver v1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.offWhite,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.black,
  },
  profileCard: {
    backgroundColor: Colors.white,
    marginHorizontal: 20,
    marginTop: 20,
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.black,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 36,
    fontWeight: "bold",
    color: Colors.white,
  },
  editAvatarButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.black,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: Colors.white,
  },
  driverName: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.black,
    marginBottom: 4,
  },
  driverEmail: {
    fontSize: 14,
    color: Colors.mediumGray,
    marginBottom: 16,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.offWhite,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  rating: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.black,
  },
  ratingLabel: {
    fontSize: 14,
    color: Colors.mediumGray,
    marginLeft: 4,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.black,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.black,
  },
  statsSection: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.black,
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.offWhite,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statIconGreen: {
    backgroundColor: Colors.offWhite,
  },
  statIconOrange: {
    backgroundColor: Colors.offWhite,
  },
  statIconPurple: {
    backgroundColor: Colors.offWhite,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.black,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.mediumGray,
    textAlign: "center",
  },
  infoCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.offWhite,
    justifyContent: "center",
    alignItems: "center",
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: Colors.mediumGray,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.black,
  },
  infoDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 8,
  },
  actionButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  actionText: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.black,
  },
  logoutButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.white,
    marginHorizontal: 20,
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.black,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.black,
  },
  footer: {
    alignItems: "center",
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 12,
    color: Colors.mediumGray,
  },
});
