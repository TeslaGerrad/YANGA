import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/colors";
import { useDriver } from "@/context/driver-context";
import { EarningPeriod } from "@/types";
import { DrawerActions } from "@react-navigation/native";
import { useNavigation } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function EarningsScreen() {
  const navigation = useNavigation();
  const {
    earningsSummary,
    earnings,
    completedRides,
    getEarningsByPeriod,
    getRidesByPeriod,
  } = useDriver();
  const [selectedPeriod, setSelectedPeriod] = useState<EarningPeriod>("all");

  const periods: { key: EarningPeriod; label: string }[] = [
    { key: "day", label: "Today" },
    { key: "month", label: "This Month" },
    { key: "year", label: "This Year" },
    { key: "all", label: "All Time" },
  ];

  const getCurrentEarnings = () => {
    switch (selectedPeriod) {
      case "day":
        return earningsSummary.today;
      case "month":
        return earningsSummary.thisMonth;
      case "year":
        return earningsSummary.thisYear;
      default:
        return earningsSummary.total;
    }
  };

  const getCurrentRides = () => {
    switch (selectedPeriod) {
      case "day":
        return earningsSummary.todayRides;
      case "month":
        return earningsSummary.monthRides;
      case "year":
        return earningsSummary.yearRides;
      default:
        return earningsSummary.totalRides;
    }
  };

  const getFilteredEarnings = () => {
    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const yearStart = new Date(now.getFullYear(), 0, 1);

    return earnings.filter((e) => {
      const earningDate = new Date(e.date);
      switch (selectedPeriod) {
        case "day":
          return earningDate >= todayStart;
        case "month":
          return earningDate >= monthStart;
        case "year":
          return earningDate >= yearStart;
        default:
          return true;
      }
    });
  };

  const currentEarnings = getCurrentEarnings();
  const currentRides = getCurrentRides();
  const filteredEarnings = getFilteredEarnings();
  const averagePerRide = currentRides > 0 ? currentEarnings / currentRides : 0;

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
        <Text style={styles.headerTitle}>Earnings</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {periods.map((period) => (
            <TouchableOpacity
              key={period.key}
              style={[
                styles.periodButton,
                selectedPeriod === period.key && styles.periodButtonActive,
              ]}
              onPress={() => setSelectedPeriod(period.key)}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  selectedPeriod === period.key &&
                    styles.periodButtonTextActive,
                ]}
              >
                {period.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Total Earnings Card */}
        <View style={styles.totalCard}>
          <View style={styles.totalCardHeader}>
            <IconSymbol name="banknote" size={32} color={Colors.black} />
            <Text style={styles.totalLabel}>Total Earnings</Text>
          </View>
          <Text style={styles.totalAmount}>
            ZMW {currentEarnings.toFixed(2)}
          </Text>
          <View style={styles.totalStats}>
            <View style={styles.totalStat}>
              <Text style={styles.totalStatValue}>{currentRides}</Text>
              <Text style={styles.totalStatLabel}>Rides</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.totalStat}>
              <Text style={styles.totalStatValue}>
                ZMW {averagePerRide.toFixed(0)}
              </Text>
              <Text style={styles.totalStatLabel}>Avg/Ride</Text>
            </View>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <IconSymbol
                name="chart.bar.fill"
                size={24}
                color={Colors.black}
              />
            </View>
            <Text style={styles.statValue}>
              ZMW {(currentEarnings * 0.8).toFixed(0)}
            </Text>
            <Text style={styles.statLabel}>Net Income</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, styles.statIconOrange]}>
              <IconSymbol name="percent" size={24} color={Colors.mediumGray} />
            </View>
            <Text style={styles.statValue}>
              ZMW {(currentEarnings * 0.2).toFixed(0)}
            </Text>
            <Text style={styles.statLabel}>Commission (20%)</Text>
          </View>
        </View>

        {/* Recent Earnings */}
        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>Recent Earnings</Text>
          {filteredEarnings.length > 0 ? (
            filteredEarnings.slice(0, 20).map((earning, index) => {
              const ride = completedRides.find((r) => r.id === earning.rideId);
              return (
                <View key={earning.rideId} style={styles.earningItem}>
                  <View style={styles.earningLeft}>
                    <View style={styles.earningIconContainer}>
                      <IconSymbol
                        name="car.fill"
                        size={20}
                        color={Colors.black}
                      />
                    </View>
                    <View style={styles.earningInfo}>
                      <Text style={styles.earningTitle}>
                        {ride?.passenger.name || "Completed Ride"}
                      </Text>
                      <Text style={styles.earningDate}>
                        {new Date(earning.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.earningRight}>
                    <Text style={styles.earningAmount}>
                      +ZMW {earning.netEarning.toFixed(2)}
                    </Text>
                    <Text style={styles.earningCommission}>
                      Commission: ZMW {earning.commission.toFixed(2)}
                    </Text>
                  </View>
                </View>
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <IconSymbol name="doc.text" size={48} color="#ccc" />
              <Text style={styles.emptyStateText}>
                No earnings for this period
              </Text>
              <Text style={styles.emptyStateSubtext}>
                Complete rides to start earning
              </Text>
            </View>
          )}
        </View>

        {/* Breakdown Section */}
        <View style={styles.breakdownSection}>
          <Text style={styles.sectionTitle}>Earnings Breakdown</Text>
          <View style={styles.breakdownCard}>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Gross Earnings</Text>
              <Text style={styles.breakdownValue}>
                ZMW {(currentEarnings / 0.8).toFixed(2)}
              </Text>
            </View>
            <View style={styles.breakdownDivider} />
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>
                Platform Commission (20%)
              </Text>
              <Text style={[styles.breakdownValue, styles.breakdownNegative]}>
                -ZMW {(currentEarnings * 0.25).toFixed(2)}
              </Text>
            </View>
            <View style={styles.breakdownDivider} />
            <View style={styles.breakdownRow}>
              <Text style={[styles.breakdownLabel, styles.breakdownTotal]}>
                Net Earnings
              </Text>
              <Text style={[styles.breakdownValue, styles.breakdownTotalValue]}>
                ZMW {currentEarnings.toFixed(2)}
              </Text>
            </View>
          </View>
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
  periodSelector: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 8,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: Colors.offWhite,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  periodButtonActive: {
    backgroundColor: Colors.black,
    borderColor: Colors.black,
  },
  periodButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.mediumGray,
  },
  periodButtonTextActive: {
    color: Colors.white,
  },
  totalCard: {
    backgroundColor: Colors.white,
    marginHorizontal: 20,
    marginTop: 16,
    padding: 24,
    borderRadius: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  totalCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 16,
    color: Colors.mediumGray,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    fontWeight: "500",
  },
  totalAmount: {
    fontSize: 42,
    fontWeight: "bold",
    color: Colors.black,
    marginBottom: 20,
  },
  totalStats: {
    flexDirection: "row",
    alignItems: "center",
  },
  totalStat: {
    flex: 1,
    alignItems: "center",
  },
  totalStatValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.black,
  },
  totalStatLabel: {
    fontSize: 12,
    color: Colors.mediumGray,
    marginTop: 4,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border,
  },
  statsGrid: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginTop: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
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
    marginBottom: 12,
  },
  statIconOrange: {
    backgroundColor: Colors.offWhite,
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
  recentSection: {
    marginTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.black,
    marginBottom: 16,
  },
  earningItem: {
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
  earningLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  earningIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.black,
    justifyContent: "center",
    alignItems: "center",
  },
  earningInfo: {
    flex: 1,
  },
  earningTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.black,
    marginBottom: 4,
  },
  earningDate: {
    fontSize: 12,
    color: Colors.mediumGray,
  },
  earningRight: {
    alignItems: "flex-end",
  },
  earningAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.black,
    marginBottom: 2,
  },
  earningCommission: {
    fontSize: 11,
    color: Colors.mediumGray,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.mediumGray,
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.mediumGray,
    marginTop: 8,
  },
  breakdownSection: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  breakdownCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  breakdownLabel: {
    fontSize: 14,
    color: Colors.mediumGray,
  },
  breakdownValue: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.black,
  },
  breakdownNegative: {
    color: Colors.mediumGray,
  },
  breakdownDivider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  breakdownTotal: {
    fontWeight: "bold",
    fontSize: 16,
    color: Colors.black,
  },
  breakdownTotalValue: {
    fontSize: 18,
    color: Colors.black,
  },
});
