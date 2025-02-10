import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Home= () => {
  const [city, setCity] = useState("Ankara");

  return (
    <SafeAreaView className="flex-1 bg-blue-100 p-4">
      <Text className="text-xl font-bold text-center text-blue-900">
        Hava Durumu
      </Text>
      <TextInput
        className="border border-gray-300 rounded p-2 mt-4"
        placeholder="Şehir girin"
        value={city}
        onChangeText={setCity}
      />
      <TouchableOpacity
        className="bg-blue-500 p-3 rounded mt-4"
      >
        <Text className="text-white text-center font-bold">Hava Durumunu Getir</Text>
      </TouchableOpacity>
      <View className="mt-6 bg-white p-4 rounded shadow">
        <Text className="text-lg font-semibold text-center">
          Şehir: {city}
        </Text>
        <Text className="text-center text-gray-600 mt-2">
          Açıklama: Parçalı Bulutlu
        </Text>
        <Text className="text-center text-2xl font-bold mt-2">
          Sıcaklık: 22°C
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default Home;
