import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/colors";
import { useDriver } from "@/context/driver-context";
import { DrawerContentScrollView } from "@react-navigation/drawer";
import { usePathname, useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export function CustomDrawerContent(props: any) {
  const { driver, earningsSummary } = useDriver();
  const router = useRouter();
  const pathname = usePathname();

  const menuItems = [
    { name: "Home", route: "/home", icon: "house.fill" },
    { name: "Earnings", route: "/earnings", icon: "banknote" },
    { name: "Profile", route: "/profile", icon: "person.fill" },
  ];

  return (
    <DrawerContentScrollView {...props} style={styles.container}>
      {/* Driver Profile Section */}
      <View style={styles.profileSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {driver.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </Text>
        </View>
        <Text style={styles.driverName}>{driver.name}</Text>
        <View style={styles.ratingContainer}>
          <IconSymbol name="star.fill" size={16} color="#FFD700" />
          <Text style={styles.rating}>{driver.rating.toFixed(1)}</Text>
        </View>
      </View>

      {/* Stats Summary */}
      <View style={styles.statsSection}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{driver.totalRides}</Text>
          <Text style={styles.statLabel}>Total Rides</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            ZMW {earningsSummary.total.toFixed(0)}
          </Text>
          <Text style={styles.statLabel}>Total Earned</Text>
        </View>
      </View>

      {/* Menu Items */}
      <View style={styles.menuSection}>
        {menuItems.map((item, index) => {
          const isActive = pathname === item.route;
          return (
            <TouchableOpacity
              key={index}
              style={[styles.menuItem, isActive && styles.menuItemActive]}
              onPress={() => router.push(item.route as any)}
            >
              <IconSymbol
                name={item.icon as any}
                size={24}
                color={isActive ? "#2196F3" : "#666"}
              />
              <Text
                style={[styles.menuText, isActive && styles.menuTextActive]}
              >
                {item.name}
              </Text>
              {isActive && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerButton}>
          <IconSymbol name="gearshape.fill" size={20} color="#666" />
          <Text style={styles.footerText}>Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerButton}>
          <IconSymbol name="questionmark.circle.fill" size={20} color="#666" />
          <Text style={styles.footerText}>Help</Text>
        </TouchableOpacity>
      </View>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  profileSection: {
    alignItems: "center",
    paddingVertical: 32,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.black,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "bold",
    color: Colors.white,
  },
  driverName: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.black,
    marginBottom: 8,
  },
  ratingContainer: {
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
  rating: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.black,
  },
  statsSection: {
    flexDirection: "row",
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.black,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.mediumGray,
  },
  divider: {
    width: 1,
    backgroundColor: Colors.border,
  },
  menuSection: {
    paddingVertical: 16,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    position: "relative",
  },
  menuItemActive: {
    backgroundColor: Colors.offWhite,
  },
  menuText: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.mediumGray,
    marginLeft: 16,
  },
  menuTextActive: {
    color: Colors.black,
    fontWeight: "bold",
  },
  activeIndicator: {
    position: "absolute",
    right: 0,
    top: "50%",
    transform: [{ translateY: -20 }],
    width: 4,
    height: 40,
    backgroundColor: Colors.black,
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
  },
  footer: {
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginTop: "auto",
  },
  footerButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 12,
  },
  footerText: {
    fontSize: 15,
    color: Colors.mediumGray,
  },
});
