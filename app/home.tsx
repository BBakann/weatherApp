import React, { useState, useEffect, useCallback } from "react"; 
import { View, Text, ActivityIndicator, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context"; 
import { useRoute } from "@react-navigation/native";
import { RouteProp } from "@react-navigation/native"; 
import * as Location from "expo-location";
import { WEATHER_API_KEY } from '@env';
import WeatherDisplay from '../app/components/WeatherDisplay'; 
import LocationButtons from '../app/components/LocationButtons'; 
import { Ionicons } from '@expo/vector-icons'; 


const Home = () => {
  // Loading durumu ve error mesajları için state'ler
  const [loading, setLoading] = useState(false); // Yükleniyor durumu 
  const [error, setError] = useState<string | null>(null); // Hata mesajı

  // RouteParam'ları tanımlama
  type RouteParams = {
    params: {
      lat?: string; 
      lon?: string;
    };
  };

  // Route parametrelerini almak için useRoute
  const route = useRoute<RouteProp<RouteParams>>(); // Ekranın route parametrelerine erişmesi

  // Hava durumu ve tahmin verisi için gerekli tipler
  type Weather = {
    name: string; // Şehir ismi
    weather: { 
      description: string; // Hava durumu açıklaması
      icon: string; // Hava durumu simgesi
    }[];
    main: { temp: number }; // Ana sıcaklık bilgisi
    coord: {
      lat: number; 
      lon: number; 
    };
  };

  type ForecastItem = {
    dt: number; // Tarih
    main: {
      temp: number; // Sıcaklık
    };
    weather: {
      description: string; // Hava durumu açıklaması
      icon: string; // Hava durumu simgesi
    }[];
  };

  // State'ler: hava durumu ve tahminler
  const [weather, setWeather] = useState<Weather | null>(null); // Anlık hava durumu verisi
  const [forecast, setForecast] = useState<ForecastItem[]>([]); // 5 günlük hava durumu tahmin verisi

  // Hava durumu verisini API'den çekmek için fetchWeather fonksiyonu
  const fetchWeather = useCallback(async (lat: number, lon: number) => {
    setWeather(null); // Önceki verileri sıfırlama
    setForecast([]);
    
    const loadingTimeout = setTimeout(() => {
      setLoading(true); // yükleniyor ikonu
    }, 300); // 300ms sonra yükleniyor göstergesi devreye girer

    setError(null); // Hata mesajını sıfırlıyoruz
    
    // Enlem ve boylamı 6 haneli hassasiyete yuvarlıyoruz
    const latitude = Number(lat.toFixed(6)); // Enlemi 6 ondalıklı sayıya yuvarlıyoruz
    const longitude = Number(lon.toFixed(6)); // Boylamı 6 ondalıklı sayıya yuvarlıyoruz
    
    try {
      // OpenWeather API'sine hava durumu isteği
      const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${WEATHER_API_KEY}&units=metric&lang=tr`;
      const weatherResponse = await fetch(weatherUrl); // Hava durumu verisi almak için fetch 
      const weatherData = await weatherResponse.json(); // JSON formatında gelen veriyi işleme
      
      // 5 günlük hava durumu tahminleri için API isteği
      const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${WEATHER_API_KEY}&units=metric&lang=tr`;
      const forecastResponse = await fetch(forecastUrl); // Hava durumu tahminlerini almak için fetch kullanıyoruz
      const forecastData = await forecastResponse.json(); // JSON formatında gelen veriyi işliyoruz
      
      if (weatherData.cod && weatherData.cod !== 200) {
        // Eğer API'den hata kodu gelirse (200 dışı), hata mesajı fırlatıyoruz
        throw new Error(weatherData.message || 'Hava durumu bilgisi alınamadı');
      }

      // Bugünün tarihi
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Bugün 00:00'a ayarlanmış tarih

      // Bugünün verisi
      const dailyForecasts = [{
        dt: Math.floor(Date.now() / 1000), // Şu an 
        main: weatherData.main, // Ana sıcaklık bilgisi
        weather: weatherData.weather // Hava durumu açıklamaları ve simgeler
      }];

      // Sonraki 4 günün öğle saatine ait verilerini ekliyoruz
      const remainingForecasts = forecastData.list.reduce((acc: ForecastItem[], item: ForecastItem) => {
        const date = new Date(item.dt * 1000); // Unix timestamp'ini Date nesnesine çeviriyoruz
        const itemDay = new Date(date);
        itemDay.setHours(0, 0, 0, 0);  

        // Öğlen 12:00'deki tahmin verilerini alıyoruz
        if (itemDay > today && date.getHours() === 12 && acc.length < 4) {
          acc.push(item); // 4 tane öğlen verisi eklenene kadar devam ediyor
        }
        return acc; // Biriktirilen tahminleri geri döndürüyoruz
      }, []);

      // Hava durumu ve tahmin verilerini state'lere set ediyoruz
      setWeather(weatherData); 
      setForecast([...dailyForecasts, ...remainingForecasts]);
    } catch (error) {
      
      console.error("Hava durumu alınamadı", error);
      setError("Hava durumu bilgisi alınamadı. Lütfen tekrar deneyin.");
    } finally {
      // Timeout'ı temizliyoruz ve loading durumunu bitiriyoruz
      clearTimeout(loadingTimeout); // Loading zaman aşımını temizliyoruz
      setLoading(false); // Yükleniyor durumu bitiyor
    }
  }, []); 

  // Konum parametreleri işlenip hava durumu alınsın diye bir ref kullanıyoruz
  const coordsProcessed = React.useRef(false);

  // Eğer route parametrelerinde lat ve lon varsa ve daha önce işlem yapılmamışsa
  useEffect(() => {
    if (route.params?.lat && route.params?.lon && !coordsProcessed.current) {
      const latitude = Number(route.params.lat); // Latitüd (enlem) parametresini alıyoruz
      const longitude = Number(route.params.lon); // Longitüd (boylam) parametresini alıyoruz
      
      coordsProcessed.current = true; // İşlem yapıldığını belirtiyoruz
      fetchWeather(latitude, longitude); // Hava durumu verisini alıyoruz
    }
  }, [route.params]); // route.params değiştiğinde bu effect çalışacak

  // Route değiştiğinde coordsProcessed ref'ini sıfırlıyoruz
  useEffect(() => {
    return () => {
      coordsProcessed.current = false; // Component unmount olduğunda işlem yapmayı sıfırlıyoruz
    };
  }, []);

  // Kullanıcının konumunu almak için fonksiyon
  const getCurrentLocation = async () => {
    try {
      // Konum izni istiyoruz
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setError("Konum izni reddedildi. (Konum servisi kapalı olabilir.)");
        return;
      }

      // Kullanıcının mevcut konumunu alıyoruz
      const location = await Location.getCurrentPositionAsync({});
      fetchWeather(location.coords.latitude, location.coords.longitude); // Konumu aldıktan sonra hava durumu verisi
    } catch (error) {
      setError("Konum alınamadı. Lütfen tekrar deneyin."); // Konum alınamazsa hata mesajı 
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-b from-[#68bbe3]/20 to-[#003060]/10">
      
      <View className="bg-[#055c9d] pt-6 pb-16 rounded-b-[40px] shadow-lg">
        <Text className="text-3xl font-bold text-center text-white">
          Hava Durumu
        </Text>
      </View>

      
      <View className="flex-1 px-4">
        {/* Konum butonları */}
        <LocationButtons onGetCurrentLocation={getCurrentLocation} />

        {/* Hava durumu ve tahmin bilgileri */}
        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          <View className="flex-1 relative mb-6">
            {error && (
              // Hata mesajı
              <View className="bg-red-100/90 p-4 rounded-xl w-full mb-4 flex-row items-center justify-center space-x-2">
                <Ionicons name="warning" size={24} color="#dc2626" />
                <Text className="text-red-600 text-center font-medium">{error}</Text>
              </View>
            )}

            {/* Yükleniyor durumu */}
            {!loading && <WeatherDisplay weather={weather} forecast={forecast} />}

            {/* Loading göstergesi */}
            {loading && (
              <View className="absolute inset-0 bg-[#68bbe3]/20 flex justify-center items-center">
                <ActivityIndicator size="large" color="#1e3a8a" />
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default Home;
