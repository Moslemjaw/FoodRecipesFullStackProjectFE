import { Redirect } from "expo-router";
import { useContext } from "react";
import AuthContext from "@/context/AuthContext";

export default function Index() {
  const { isAutheticated } = useContext(AuthContext);

  if (isAutheticated) {
    return <Redirect href={"/(protected)/(tabs)/(home)/" as any} />;
  }

  return <Redirect href="/(auth)/login" />;
}
