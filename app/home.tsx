import React, { useState, useEffect, useCallback } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, Image, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRoute } from "@react-navigation/native";
import { RouteProp } from "@react-navigation/native";
import * as Location from "expo-location";
import { router } from "expo-router";
import { WEATHER_API_KEY } from '@env';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

const Home = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  type RouteParams = {
    params: {
      lat?: string;
      lon?: string;
    };
  };

  const route = useRoute<RouteProp<RouteParams>>();
  type Weather = {
    name: string;
    weather: { 
      description: string;
      icon: string;
    }[];
    main: { temp: number };
    coord: {
      lat: number;
      lon: number;
    };
  };

  type ForecastItem = {
    dt: number;
    main: {
      temp: number;
    };
    weather: {
      description: string;
      icon: string;
    }[];
  };

  const [weather, setWeather] = useState<Weather | null>(null);
  const [forecast, setForecast] = useState<ForecastItem[]>([]);
  
  const fetchWeather = useCallback(async (lat: number, lon: number) => {
    setWeather(null);
    setForecast([]);
    
    const loadingTimeout = setTimeout(() => {
      setLoading(true);
    }, 300);

    setError(null);
    
    const latitude = Number(lat.toFixed(6));
    const longitude = Number(lon.toFixed(6));
    
    try {
      const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${WEATHER_API_KEY}&units=metric&lang=tr`;
      const weatherResponse = await fetch(weatherUrl);
      const weatherData = await weatherResponse.json();
      
      const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${WEATHER_API_KEY}&units=metric&lang=tr`;
      const forecastResponse = await fetch(forecastUrl);
      const forecastData = await forecastResponse.json();
      
      if (weatherData.cod && weatherData.cod !== 200) {
        throw new Error(weatherData.message || 'Hava durumu bilgisi alınamadı');
      }

      // Bugünün tarihini al
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Bugünün verisini weatherData'dan al
      const dailyForecasts = [{
        dt: Math.floor(Date.now() / 1000), // Şu anki timestamp
        main: weatherData.main,
        weather: weatherData.weather
      }];

      // Sonraki 4 günün öğlen verilerini ekle
      const remainingForecasts = forecastData.list.reduce((acc: ForecastItem[], item: ForecastItem) => {
        const date = new Date(item.dt * 1000);
        const itemDay = new Date(date);
        itemDay.setHours(0, 0, 0, 0);

        // Bugünden sonraki günler için öğlen 12:00 verilerini al
        if (itemDay > today && date.getHours() === 12 && acc.length < 4) {
          acc.push(item);
        }
        return acc;
      }, []);

      setWeather(weatherData);
      setForecast([...dailyForecasts, ...remainingForecasts]);
    } catch (error) {
      console.error("Hava durumu alınamadı", error);
      setError("Hava durumu bilgisi alınamadı. Lütfen tekrar deneyin.");
    } finally {
      clearTimeout(loadingTimeout);
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

    const iconUrl = `https://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`;

    return (
      <View className="w-full space-y-4">
        {/* Ana Hava Durumu Kartı */}
        <View className="bg-white/90 p-6 rounded-3xl shadow-lg backdrop-blur-sm border border-[#68bbe3]/20">
          <View className="items-center">
            <View className="flex-row items-center space-x-2">
              <Ionicons name="location" size={24} color="#003060" />
              <Text className="text-3xl font-bold text-[#003060]">
                {weather.name}
              </Text>
            </View>
            <Image 
              source={{ uri: iconUrl }}
              className="w-32 h-32"
              resizeMode="contain"
            />
            <Text className="text-8xl font-bold text-[#0e86d4]">
              {Math.round(weather.main.temp)}°
            </Text>
            <Text className="text-xl text-[#055c9d] capitalize font-medium">
              {weather.weather[0].description}
            </Text>
          </View>
        </View>

        {/* 5 Günlük Tahmin */}
        <View className="bg-white/90 p-4 rounded-3xl shadow-lg backdrop-blur-sm border border-[#68bbe3]/20">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center space-x-2">
              <MaterialCommunityIcons name="calendar-clock" size={24} color="#003060" />
              <Text className="text-[#003060] font-bold text-lg">
                5 Günlük Tahmin
              </Text>
            </View>
          </View>
          
          {/* Bilgilendirme yazısı */}
          <Text className="text-[#003060]/60 text-xs mb-4 italic px-1">
            * Bugünün mevcut durumu ve sonraki günlerin saat 12:00 tahminleri gösterilmektedir.
          </Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row space-x-3">
              {forecast.map((item, index) => {
                const date = new Date(item.dt * 1000);
                return (
                  <View key={index} className="items-center bg-[#68bbe3]/10 p-4 rounded-2xl w-28">
                    <Text className="text-[#003060] font-bold mb-1">
                      {date.toLocaleDateString('tr-TR', { weekday: 'short' })}
                    </Text>
                    <Text className="text-[#003060]/60 text-xs mb-2">
                      {date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                    </Text>
                    <Image 
                      source={{ uri: `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png` }}
                      className="w-16 h-16"
                      resizeMode="contain"
                    />
                    <Text className="text-[#0e86d4] text-xl font-bold">
                      {Math.round(item.main.temp)}°
                    </Text>
                    <Text className="text-[#055c9d] text-xs text-center mt-1">
                      {item.weather[0].description}
                    </Text>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* Konum Detayları */}
        <View className="bg-white/90 p-4 rounded-3xl shadow-lg backdrop-blur-sm border border-[#68bbe3]/20">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center space-x-2">
              <MaterialCommunityIcons name="crosshairs-gps" size={20} color="#003060" />
              <View>
                <Text className="text-[#003060] font-medium">Koordinatlar</Text>
                <Text className="text-[#0e86d4] text-lg">
                  {weather.coord.lat.toFixed(2)}°N, {weather.coord.lon.toFixed(2)}°E
                </Text>
              </View>
            </View>
            <View className="flex-row items-center space-x-2">
              <MaterialCommunityIcons name="clock-outline" size={20} color="#003060" />
              <View>
                <Text className="text-[#003060] font-medium">Son Güncelleme</Text>
                <Text className="text-[#0e86d4] text-lg">
                  {new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-b from-[#68bbe3]/20 to-[#003060]/10">
      {/* Header */}
      <View className="bg-[#055c9d] pt-6 pb-16 rounded-b-[40px] shadow-lg">
        <Text className="text-3xl font-bold text-center text-white">
          Hava Durumu
        </Text>
      </View>

      {/* Main Content */}
      <View className="flex-1 px-4">
        {/* Konum Butonları */}
        <View className="-mt-8 mb-6">
          <View className="bg-white/90 p-2 rounded-2xl shadow-lg flex-row justify-between border border-[#68bbe3]/20">
            <TouchableOpacity
              className="bg-[#0e86d4] flex-1 mx-1 py-4 rounded-xl flex-row items-center justify-center space-x-2"
              onPress={() => router.push("/locationscreen")}
            >
              <MaterialCommunityIcons name="map-marker-radius" size={24} color="white" />
              <Text className="text-white font-semibold">
                Haritadan Seç
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-[#0e86d4] flex-1 mx-1 py-4 rounded-xl flex-row items-center justify-center space-x-2"
              onPress={getCurrentLocation}
            >
              <Ionicons name="location" size={24} color="white" />
              <Text className="text-white font-semibold">
                Konumumu Bul
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Weather Content */}
        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          <View className="flex-1 relative mb-6">
            {error && (
              <View className="bg-red-100/90 p-4 rounded-xl w-full mb-4 flex-row items-center justify-center space-x-2">
                <Ionicons name="warning" size={24} color="#dc2626" />
                <Text className="text-red-600 text-center font-medium">{error}</Text>
              </View>
            )}

            {!loading && <WeatherDisplay />}

            {loading && (
              <View className="absolute inset-0 bg-[#68bbe3]/10 backdrop-blur-sm flex items-center justify-center">
                <ActivityIndicator size="large" color="#055c9d" />
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default Home;