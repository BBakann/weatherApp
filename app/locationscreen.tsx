import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';


const LocationScreen = () => {
  // Seçilen konumu tutan state
  const [selectedLocation, setSelectedLocation] = useState({
    latitude: 39.936306,
    longitude: 32.844424,
    latitudeDelta: 0.04,
    longitudeDelta: 0.04,
  });

  // Haritaya tıklama olayını işleyen fonksiyon
  const handleMapPress = (event: { nativeEvent: { coordinate: { latitude: number; longitude: number } } }) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setSelectedLocation((prev) => ({
      ...prev,
      latitude,
      longitude,
    }));
  };

  // Konumu onaylama ve /home sayfasına yönlendirme
  const handleConfirmLocation = () => {
    router.replace({
      pathname: '/home',
      params: {
        lat: selectedLocation.latitude.toFixed(6),
        lon: selectedLocation.longitude.toFixed(6),
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* MapView: Harita bileşeni */}
      <MapView
        style={styles.map}
        initialRegion={selectedLocation}
        onPress={handleMapPress}
      >
        {/* Harita üzerinde seçilen konumu işaretleyen Marker */}
        {selectedLocation && (
          <Marker
            coordinate={{
              latitude: selectedLocation.latitude,
              longitude: selectedLocation.longitude,
            }}
            title="Seçilen Konum"
          />
        )}
      </MapView>

      {/* Koordinatların gösterileceği alan */}
      <View style={styles.coordinatesContainer}>
        <Text style={styles.coordinatesText}>
          Enlem: {selectedLocation.latitude.toFixed(6)}
        </Text>
        <Text style={styles.coordinatesText}>
          Boylam: {selectedLocation.longitude.toFixed(6)}
        </Text>
      </View>

      {/* Konumu onaylama butonu */}
      <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmLocation}>
        <Text style={styles.buttonText}>Konumu Onayla</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

// Stil tanımlamaları
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Map: Harita stili
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  // Koordinatların görüneceği kutu
  coordinatesContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 10,
    borderRadius: 10,
  },
  // Koordinat yazılarının stili
  coordinatesText: {
    fontSize: 14,
    marginBottom: 5,
  },
  // Konumu onayla butonunun stili
  confirmButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  // Buton metninin stili
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LocationScreen;
