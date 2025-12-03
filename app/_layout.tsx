import AuthContext from "@/context/AuthContext";
import { Stack } from "expo-router";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export default function RootLayout() {
  const [isAutheticated, setIsAutheticated] = useState(false);
  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={{ isAutheticated, setIsAutheticated }}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(protected)" />
        </Stack>
      </AuthContext.Provider>
    </QueryClientProvider>
  );
}
