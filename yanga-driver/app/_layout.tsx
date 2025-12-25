import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Drawer } from "expo-router/drawer";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";

import { CustomDrawerContent } from "@/components/custom-drawer";
import { DriverProvider } from "@/context/driver-context";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <DriverProvider>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <Drawer
            drawerContent={(props) => <CustomDrawerContent {...props} />}
            screenOptions={{
              headerShown: false,
              drawerStyle: {
                width: 280,
              },
            }}
          >
            <Drawer.Screen
              name="home"
              options={{
                drawerLabel: "Home",
                title: "Home",
              }}
            />
            <Drawer.Screen
              name="earnings"
              options={{
                drawerLabel: "Earnings",
                title: "Earnings",
              }}
            />
            <Drawer.Screen
              name="profile"
              options={{
                drawerLabel: "Profile",
                title: "Profile",
              }}
            />
          </Drawer>
          <StatusBar style="auto" />
        </ThemeProvider>
      </DriverProvider>
    </GestureHandlerRootView>
  );
}
