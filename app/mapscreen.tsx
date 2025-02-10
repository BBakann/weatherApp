import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import MapView, { Marker } from "react-native-maps";

import type { StackNavigationProp } from '@react-navigation/stack';
import type { RouteProp } from '@react-navigation/native';

type MapScreenNavigationProp = StackNavigationProp<any, any>;
type MapScreenRouteProp = RouteProp<any, any>;

type Location = {
  latitude: number;
  longitude: number;
};

const MapScreen = ({ navigation, route }: { navigation: MapScreenNavigationProp; route: MapScreenRouteProp }) => {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  // Haritada bir yere tıklandığında seçilen konumu güncelle
  const handleMapPress = (event: { nativeEvent: { coordinate: { latitude: number; longitude: number } } }) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setSelectedLocation({ latitude, longitude });
  };

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={{ flex: 1 }}
        initialRegion={{
          latitude: 39.92077, // Ankara
          longitude: 32.85411,
          latitudeDelta: 5,
          longitudeDelta: 5,
        }}
        onPress={handleMapPress} // Kullanıcı haritaya tıkladığında
      >
        {selectedLocation && (
          <Marker coordinate={selectedLocation} title="Seçilen Konum" />
        )}
      </MapView>

      {selectedLocation && (
        <TouchableOpacity
          style={{
            backgroundColor: "blue",
            padding: 10,
            margin: 10,
            borderRadius: 5,
          }}
          onPress={() => navigation.navigate("Home", { selectedLocation })}
        >
          <Text style={{ color: "white", textAlign: "center" }}>
            Konumu Seç ve Geri Dön
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default MapScreen;
