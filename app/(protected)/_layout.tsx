import { StyleSheet, Text, View } from "react-native";
import React, { useContext } from "react";
import AuthContext from "@/context/AuthContext";
import { Redirect, Stack } from "expo-router";

const ProtectedLayout = () => {
  const { isAutheticated, setIsAutheticated } = useContext(AuthContext);

  if (!isAutheticated) {
    return <Redirect href={"/"} />;
  }

  return (
    <Stack>
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
};

export default ProtectedLayout;

const styles = StyleSheet.create({});
