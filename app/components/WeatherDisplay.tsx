import React from 'react';
import { View, Text, Image, ScrollView } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';


type Weather = {
  name: string; // Şehir adı
  weather: { 
    description: string; // Hava durumu açıklaması
    icon: string; // Hava durumu simgesi
  }[];
  main: { temp: number }; // Hava sıcaklığı
  coord: {
    lat: number; // Enlem
    lon: number; // Boylam
  };
};

// 5 günlük tahmin verisini tanımlayan tip
type ForecastItem = {
  dt: number; //(tahmin zamanı)
  main: {
    temp: number; 
  };
  weather: {
    description: string; // Tahmin edilen hava durumu açıklaması
    icon: string; // Tahmin edilen hava durumu simgesi
  }[];
};


type WeatherDisplayProps = {
  weather: Weather | null; // Anlık hava durumu verisi
  forecast: ForecastItem[]; // 5 günlük tahmin verisi
};

// WeatherDisplay bileşeni
const WeatherDisplay: React.FC<WeatherDisplayProps> = ({ weather, forecast }) => {
  // Eğer hava durumu verisi eksikse, hiçbir şey render edilmez
  if (!weather || !weather.weather || !weather.weather[0]) return null;

  // Hava durumu simgesi için URL
  const iconUrl = `https://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`;

  return (
    <View className="flex-1 p-4">
      {/* Ana Hava Durumu Kartı */}
      <View className="bg-white bg-opacity-90 p-5 rounded-xl shadow-lg mb-4 items-center">
        <View className="items-center">
          {/* Konum Başlığı */}
          <View className="flex-row items-center mb-2">
            <Ionicons name="location" size={24} color="#003060" /> {/* Lokasyon simgesi */}
            <Text className="text-2xl font-bold text-blue-900 ml-2">{weather.name}</Text> {/* Şehir adı */}
          </View>
          {/* Hava Durumu Simgesi */}
          <Image 
            source={{ uri: iconUrl }}
            className="w-32 h-32 my-3"
            resizeMode="contain"
          />
          {/* Hava Sıcaklığı */}
          <Text className="text-6xl font-bold text-blue-500">{Math.round(weather.main.temp)}°</Text> {/* Sıcaklık */}
          {/* Hava Durumu Açıklaması */}
          <Text className="text-xl text-blue-700 font-medium capitalize">{weather.weather[0].description}</Text> {/* Hava durumu açıklaması */}
        </View>
      </View>

      {/* 5 Günlük Hava Tahmini */}
      <View className="bg-white bg-opacity-90 p-4 rounded-xl shadow-lg mb-4">
        <View className="flex-row items-center mb-2">
          <MaterialCommunityIcons name="calendar-clock" size={24} color="#003060" /> {/* Takvim simgesi */}
          <Text className="text-xl font-bold text-blue-900 ml-2">5 Günlük Tahmin</Text> {/* Başlık */}
        </View>

        {/* Bugün ve sonraki günlerin tahminleri hakkında bilgi */}
        <Text className="text-xs text-blue-900 opacity-60 mb-2 italic">
          * Bugünün mevcut durumu ve sonraki günlerin saat 12:00 tahminleri gösterilmektedir.
        </Text>

        {/* Yatay kaydırılabilir liste, 5 günlük tahmin gösterir */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row">
            {forecast.map((item, index) => {
              // Unix zaman damgasını JavaScript tarih formatına dönüştürme
              const date = new Date(item.dt * 1000);
              return (
                <View key={index} className="bg-blue-200 bg-opacity-10 p-3 rounded-xl w-21 items-center mx-2">
                  {/* Günün kısaltması ve tarihi */}
                  <Text className="text-sm font-bold text-blue-900">
                    {date.toLocaleDateString('tr-TR', { weekday: 'short' })}
                  </Text>
                  <Text className="text-xs text-blue-900 opacity-60">
                    {date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                  </Text>
                  {/* Hava durumu simgesi */}
                  <Image 
                    source={{ uri: `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png` }}
                    className="w-12 h-12 my-2"
                    resizeMode="contain"
                  />
                  {/* Tahmin edilen sıcaklık */}
                  <Text className="text-xl font-bold text-blue-500">
                    {Math.round(item.main.temp)}°
                  </Text>
                  {/* Hava durumu açıklaması */}
                  <Text className="text-xs text-blue-700 text-center mt-1">
                    {item.weather[0].description}
                  </Text>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </View>

      {/* Konum Detayları */}
      <View className="bg-white bg-opacity-90 p-4 rounded-xl shadow-lg">
        <View className="flex-row justify-between">
          {/* Koordinatlar */}
          <View className="flex-row items-center">
            <MaterialCommunityIcons name="crosshairs-gps" size={20} color="#003060" /> {/* GPS simgesi */}
            <View>
              <Text className="text-sm font-medium text-blue-900">Koordinatlar</Text> {/* Başlık */}
              <Text className="text-lg text-blue-500">
                {weather.coord.lat.toFixed(2)}°N, {weather.coord.lon.toFixed(2)}°E
              </Text> {/* Konum koordinatları */}
            </View>
          </View>
          {/* Son Güncelleme Zamanı */}
          <View className="flex-row items-center">
            <MaterialCommunityIcons name="clock-outline" size={20} color="#003060" /> {/* Saat simgesi */}
            <View>
              <Text className="text-sm font-medium text-blue-900">Son Güncelleme</Text> {/* Başlık */}
              <Text className="text-lg text-blue-500">
                {new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
              </Text> {/* Son güncelleme saati */}
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default WeatherDisplay;
