import Intro from "@/components/auth/Intro";
import { useAuthContext } from "@/context/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useDeepLinking } from "@/hooks/useDeepLinking";
import { AuthProvider } from "@/provider/AuthProvider";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import * as NavigationBar from "expo-navigation-bar";
import { router, Stack, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Image, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import { Toaster } from "sonner-native";

export const unstable_settings = {
  anchor: "(tabs)",
};

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { session, isAppReady, loading, profile } = useAuthContext();
  const segments = useSegments();
  const [fontsLoaded] = useFonts({
    Inter: require("@/assets/fonts/Inter-Regular.ttf"),
    SpaceMono: require("@/assets/fonts/SpaceMono-Regular.ttf"),
  });

  // deeplinking for magic links
  useDeepLinking();

  useEffect(() => {
    if (fontsLoaded && isAppReady && !loading) {
      console.log("App is ready!");
      SplashScreen.hide();
    }
  }, [isAppReady, fontsLoaded, loading]);

  useEffect(() => {
    NavigationBar.setStyle("light");
  }, []);

  useEffect(() => {
    if (!loading && session) {
      if (!profile || !profile.onboarding_completed) {
        const inOnboarding = segments[0] === "onboarding";

        if (!inOnboarding) {
          router.replace("/onboarding");
        }
      }
    }
  }, [session, loading, profile, segments]);

  // auto splash
  if (!fontsLoaded || !isAppReady || loading) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" backgroundColor="transparent" />
        <Image
          source={require("@/assets/images/splash-icon.png")}
          style={styles.image}
        />
      </View>
    );
  }

  // take user to intro screen to start auth
  if (!loading && !session) {
    return (
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <Intro />
          <Toaster />
        </GestureHandlerRootView>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider value={DefaultTheme}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="onboarding" />
        </Stack>
        <Toaster />
      </GestureHandlerRootView>
      <StatusBar style="auto" backgroundColor="transparent" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#690030",
  },
  image: {
    height: 100,
    aspectRatio: 1 / 1,
  },
});
