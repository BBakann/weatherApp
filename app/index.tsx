import React, { useEffect } from "react";
import { View, Image, Text, Animated } from "react-native";
import { useRouter } from "expo-router";

export default function Index() {
  const router = useRouter();

  // Animasyon değerleri
  const scaleAnim = new Animated.Value(0.5); // Küçük başlayıp büyüyecek
  const slideAnim = new Animated.Value(50); // Aşağıdan yukarı kayma için başlangıç değeri

  useEffect(() => {
    // Animasyonları başlat
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1, // Normal boyuta gelecek
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0, // Yukarı kayarak yerine oturacak
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();

    // 2.5 saniye sonra home ekranına yönlendir
    const timer = setTimeout(() => {
      router.push("/home");
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View className="flex-1 bg-[#003060] justify-center items-center">
      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }, { translateY: slideAnim }], //transform dönüşümler için
        }}
        className="items-center"
      >
        <Image
          source={require("../assets/images/weather-app.png")}
          className="w-[175px] h-[175px] mb-4"
          resizeMode="contain"
        />
        <Text className="text-white text-4xl font-bold">WeatherApp</Text>
      </Animated.View>
    </View>
  );
}
