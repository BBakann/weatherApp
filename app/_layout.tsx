import { Stack } from "expo-router";
import "../global.css";

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 200,
      }}
    >
      <Stack.Screen
        name="loadingScreen"
        options={{
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="home"
        options={{
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="locationscreen"
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
          gestureEnabled: true,
          gestureDirection: 'vertical',
        }}
      />
    </Stack>
  );
}