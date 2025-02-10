import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const LocationScreen = () => {
  const [selectedLocation, setSelectedLocation] = useState({
    latitude: 39.9334,
    longitude: 32.8597,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const handleConfirmLocation = () => {
    const latitude = Number(selectedLocation.latitude.toFixed(6));
    const longitude = Number(selectedLocation.longitude.toFixed(6));
    
    router.replace({
      pathname: "/home",
      params: {
        lat: latitude.toString(),
        lon: longitude.toString()
      }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={selectedLocation}
        onPress={(e) => {
          const { latitude, longitude } = e.nativeEvent.coordinate;
          setSelectedLocation({
            ...selectedLocation,
            latitude,
            longitude,
          });
        }}
      >
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
      
      <View style={styles.coordinatesContainer}>
        <Text style={styles.coordinatesText}>
          Enlem: {selectedLocation.latitude.toFixed(6)}
        </Text>
        <Text style={styles.coordinatesText}>
          Boylam: {selectedLocation.longitude.toFixed(6)}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.confirmButton}
        onPress={handleConfirmLocation}
      >
        <Text style={styles.buttonText}>Konumu Onayla</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height - 100,
  },
  coordinatesContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 10,
    borderRadius: 10,
  },
  coordinatesText: {
    fontSize: 14,
    marginBottom: 5,
  },
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
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LocationScreen;