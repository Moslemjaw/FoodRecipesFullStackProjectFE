import AuthContext from "@/context/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

const queryClient = new QueryClient();

export default function RootLayout() {
  const [isAutheticated, setIsAutheticated] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={{ isAutheticated, setIsAutheticated }}>
        <SafeAreaProvider style={{ flex: 1 }}>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(protected)" />
          </Stack>
        </SafeAreaProvider>
      </AuthContext.Provider>
    </QueryClientProvider>
  );
}
