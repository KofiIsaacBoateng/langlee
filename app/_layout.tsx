import { useAuthContext } from "@/context/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { AuthProvider } from "@/provider/AuthProvider";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
// import * as NavigationBar from "expo-navigation-bar";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";

export const unstable_settings = {
  anchor: "(tabs)",
};

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { session, isAppReady } = useAuthContext();
  const [fontsLoaded] = useFonts({
    Inter: require("@/assets/fonts/Inter-Regular.ttf"),
    SpaceMono: require("@/assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded && isAppReady) {
      console.log("App is ready!");
      SplashScreen.hideAsync();
    }
  }, [isAppReady, fontsLoaded]);

  // useEffect(() => {
  //   (async () => {
  //     await NavigationBar.setBackgroundColorAsync("transparent");
  //   })();
  // }, []);

  // take user to intro screen to start auth
  // if (!session) {
  //   return (
  //     <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
  //       <Intro />
  //     </ThemeProvider>
  //   );
  // }

  return (
    <ThemeProvider value={DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
      </Stack>
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
