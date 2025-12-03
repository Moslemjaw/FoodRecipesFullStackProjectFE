import AuthContext from "@/context/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { getToken } from "@/api/storage";

const queryClient = new QueryClient();

export default function RootLayout() {
  const [isAutheticated, setIsAutheticated] = useState(false);

  useEffect(() => {
    const checkToken = async () => {
      const token = await getToken();
      if (token) {
        setIsAutheticated(true);
      }
    };
    checkToken();
  }, []);

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
