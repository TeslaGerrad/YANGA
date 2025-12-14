import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '@/store/useAuthStore';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    View
} from 'react-native';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const { user, logout } = useAuthStore();
  const [notifications, setNotifications] = React.useState(true);

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  const menuItems = [
    {
      icon: 'person-outline',
      title: 'Edit Profile',
      subtitle: 'Update your personal information',
      onPress: () => {},
    },
    {
      icon: 'location-outline',
      title: 'Saved Addresses',
      subtitle: 'Manage your saved locations',
      onPress: () => {},
    },
    {
      icon: 'card-outline',
      title: 'Payment Methods',
      subtitle: 'Manage payment options',
      onPress: () => {},
    },
    {
      icon: 'shield-checkmark-outline',
      title: 'Safety',
      subtitle: 'Safety settings and emergency contacts',
      onPress: () => {},
    },
    {
      icon: 'help-circle-outline',
      title: 'Help & Support',
      subtitle: 'Get help or contact support',
      onPress: () => {},
    },
    {
      icon: 'document-text-outline',
      title: 'Legal',
      subtitle: 'Terms, privacy policy, and licenses',
      onPress: () => {},
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Profile
        </Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* User Info Card */}
        <Card style={styles.userCard} elevated>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={[styles.avatarText, { color: colors.secondary }]}>
              {user?.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: colors.text }]}>
              {user?.name}
            </Text>
            <View style={styles.contactInfo}>
              <View style={styles.infoRow}>
                <Ionicons name="mail-outline" size={16} color={colors.textSecondary} />
                <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                  {user?.email}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="call-outline" size={16} color={colors.textSecondary} />
                <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                  {user?.phone}
                </Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Stats Card */}
        <Card style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.text }]}>0</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Total Rides
            </Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.text }]}>$0.00</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Total Spent
            </Text>
          </View>
        </Card>

        {/* Notifications Toggle */}
        <Card style={styles.notificationCard}>
          <View style={styles.notificationContent}>
            <Ionicons name="notifications-outline" size={24} color={colors.text} />
            <View style={styles.notificationText}>
              <Text style={[styles.notificationTitle, { color: colors.text }]}>
                Notifications
              </Text>
              <Text style={[styles.notificationSubtitle, { color: colors.textSecondary }]}>
                Ride updates and promotions
              </Text>
            </View>
          </View>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: colors.disabled, true: colors.primary }}
            thumbColor={colors.secondary}
          />
        </Card>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <Card
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={styles.menuItemContent}>
                <Ionicons name={item.icon as any} size={24} color={colors.text} />
                <View style={styles.menuItemText}>
                  <Text style={[styles.menuItemTitle, { color: colors.text }]}>
                    {item.title}
                  </Text>
                  <Text style={[styles.menuItemSubtitle, { color: colors.textSecondary }]}>
                    {item.subtitle}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </Card>
          ))}
        </View>

        {/* Logout Button */}
        <Button
          title="Logout"
          onPress={handleLogout}
          variant="outline"
          style={styles.logoutButton}
        />

        {/* App Version */}
        <Text style={[styles.version, { color: colors.textSecondary }]}>
          Version 1.0.0
        </Text>
      </ScrollView>
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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  userCard: {
    padding: 20,
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  contactInfo: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
  },
  statsCard: {
    flexDirection: 'row',
    padding: 20,
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
  },
  divider: {
    width: 1,
    marginHorizontal: 20,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginBottom: 16,
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  notificationText: {
    marginLeft: 16,
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  notificationSubtitle: {
    fontSize: 14,
  },
  menuSection: {
    gap: 12,
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemText: {
    marginLeft: 16,
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  menuItemSubtitle: {
    fontSize: 13,
  },
  logoutButton: {
    marginBottom: 16,
  },
  version: {
    fontSize: 12,
    textAlign: 'center',
  },
});
