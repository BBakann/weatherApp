import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

// Props tipi: onGetCurrentLocation fonksiyonu
type LocationButtonsProps = {
  onGetCurrentLocation: () => void;
};

// LocationButtons bileşeni
const LocationButtons: React.FC<LocationButtonsProps> = ({ onGetCurrentLocation }) => {
  return (
    <View className="-mt-8 mb-6">
      {/* Butonlar container'ı */}
      <View className="bg-white/90 p-2 rounded-2xl shadow-lg flex-row justify-between border border-[#68bbe3]/20">
        
        {/* Haritadan Seç butonu */}
        <TouchableOpacity
          className="bg-[#0e86d4] flex-1 mx-1 py-4 rounded-xl flex-row items-center justify-center space-x-2"
          onPress={() => router.push("/locationscreen")}
        >
          <MaterialCommunityIcons name="map-marker-radius" size={24} color="white" />
          <Text className="text-white font-semibold">
            Haritadan Seç
          </Text>
        </TouchableOpacity>
        
        {/* Konumumu Bul butonu */}
        <TouchableOpacity
          className="bg-[#0e86d4] flex-1 mx-1 py-4 rounded-xl flex-row items-center justify-center space-x-2"
          onPress={onGetCurrentLocation}
        >
          <Ionicons name="location" size={24} color="white" />
          <Text className="text-white font-semibold">
            Konumumu Bul
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LocationButtons;
