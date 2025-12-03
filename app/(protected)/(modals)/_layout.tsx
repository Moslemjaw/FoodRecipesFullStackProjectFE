import { Stack } from "expo-router";

export default function ModalsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, presentation: "modal" }}>
      <Stack.Screen name="createRecipe" />
      <Stack.Screen name="createIngredient" />
      <Stack.Screen name="createCategory" />
    </Stack>
  );
}
