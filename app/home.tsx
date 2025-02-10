import React, { useState, useEffect, useCallback } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { RouteProp } from "@react-navigation/native";
import * as Location from "expo-location";
import { router } from "expo-router";
import { WEATHER_API_KEY } from "@env";

const Home = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  type RouteParams = {
    params: {
      lat?: string;
      lon?: string;
    };
  };

  const route = useRoute<RouteProp<RouteParams>>();
  const [city, setCity] = useState("Ankara");
  type Weather = {
    name: string;
    weather: { description: string }[];
    main: { temp: number };
    coord: {
      lat: number;
      lon: number;
    };
  };

  const [weather, setWeather] = useState<Weather | null>(null);
  
  const fetchWeather = useCallback(async (lat: number, lon: number) => {
    // Önce weather'ı temizle
    setWeather(null);
    
    
    const loadingTimeout = setTimeout(() => {
      setLoading(true);
    }, 300);

    setError(null);
    
    const latitude = Number(lat.toFixed(6));
    const longitude = Number(lon.toFixed(6));
    
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${WEATHER_API_KEY}&units=metric&lang=tr`;
  
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.cod && data.cod !== 200) {
        throw new Error(data.message || 'Hava durumu bilgisi alınamadı');
      }
      
      setWeather(data);
    } catch (error) {
      console.error("Hava durumu alınamadı", error);
      setError("Hava durumu bilgisi alınamadı. Lütfen tekrar deneyin.");
    } finally {
      clearTimeout(loadingTimeout); // Loading timeout'u temizle
      setLoading(false);
    }
  }, []);

  
  const coordsProcessed = React.useRef(false);

  useEffect(() => {
    if (route.params?.lat && route.params?.lon && !coordsProcessed.current) {
      const latitude = Number(route.params.lat);
      const longitude = Number(route.params.lon);
      
      
      coordsProcessed.current = true;
      
      
      fetchWeather(latitude, longitude);
    }
  }, [route.params]);

  // Route değiştiğinde ref'i sıfırla
  useEffect(() => {
    return () => {
      coordsProcessed.current = false;
    };
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setError("Konum izni reddedildi");
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      fetchWeather(location.coords.latitude, location.coords.longitude);
    } catch (error) {
      setError("Konum alınamadı. Lütfen tekrar deneyin.");
    }
  };

  const WeatherDisplay = () => {
    if (!weather || !weather.weather || !weather.weather[0]) return null;

    return (
      <View className="bg-white p-6 rounded-3xl shadow-lg">
        <Text className="text-2xl font-bold text-center text-gray-800 mb-4">
          {weather.name}
        </Text>
        <Text className="text-6xl font-bold text-center text-blue-500 mb-4">
          {Math.round(weather.main.temp)}°C
        </Text>
        <Text className="text-lg text-center text-gray-600 capitalize">
          {weather.weather[0].description}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      {/* Header */}
      <View className="bg-blue-500 p-6 rounded-b-3xl shadow-lg">
        <Text className="text-2xl font-bold text-center text-white mb-2">
          Hava Durumu
        </Text>
        <View className="flex-row justify-center space-x-4">
          <TouchableOpacity
            className="bg-white/20 px-4 py-2 rounded-full"
            onPress={() => router.push("/locationscreen")}
          >
            <Text className="text-white font-semibold">
              Haritadan Seç
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-white/20 px-4 py-2 rounded-full"
            onPress={getCurrentLocation}
          >
            <Text className="text-white font-semibold">
              Konumumu Bul
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <View className="flex-1 p-4">
        <TextInput
          className="bg-white p-4 rounded-xl shadow-sm mb-4"
          placeholder="Şehir ara..."
          value={city}
          onChangeText={setCity}
        />

        {/* Weather Container */}
        <View className="flex-1 justify-center items-center relative">
          {/* Error Display */}
          {error && (
            <View className="bg-red-100 p-4 rounded-xl w-full mb-4">
              <Text className="text-red-600 text-center">{error}</Text>
            </View>
          )}

          {/* Weather Display */}
          {!loading && <WeatherDisplay />}

          
          {loading && (
            <View className="absolute inset-0 bg-white/60 flex items-center justify-center">
              <ActivityIndicator size="large" color="#3b82f6" />
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Home;