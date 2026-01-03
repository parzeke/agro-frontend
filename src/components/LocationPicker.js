import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Platform
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

export default function LocationPicker({ initialLocation, onLocationSelect, onCancel }) {
    const mapRef = useRef(null);
    const [selectedLocation, setSelectedLocation] = useState(initialLocation);
    const [loading, setLoading] = useState(false);

    const defaultRegion = {
        latitude: 40.4168, // Madrid, Spain
        longitude: -3.7038,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    };

    const handleMapPress = (event) => {
        const { latitude, longitude } = event.nativeEvent.coordinate;
        setSelectedLocation({ latitude, longitude });
    };

    const handleUseMyLocation = async () => {
        console.log('--- START handleUseMyLocation ---');
        setLoading(true);
        try {
            console.log('Checking if services are enabled...');
            const enabled = await Location.hasServicesEnabledAsync();
            if (!enabled) {
                console.log('Services disabled');
                Alert.alert('Servicios desactivados', 'Por favor activa el GPS en tu dispositivo');
                setLoading(false);
                return;
            }

            console.log('Checking permissions...');
            let { status } = await Location.getForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.log('Requesting new permissions...');
                const requested = await Location.requestForegroundPermissionsAsync();
                status = requested.status;
            }

            if (status !== 'granted') {
                console.log('Permission denied');
                Alert.alert('Permiso denegado', 'Necesitamos acceso a tu ubicación para usar esta función');
                setLoading(false);
                return;
            }

            console.log('Trying getLastKnownPositionAsync...');
            let location = await Location.getLastKnownPositionAsync({});
            console.log('Last known location:', location ? 'Found' : 'Not found');

            // If no last known position, get current position
            if (!location) {
                console.log('Trying getCurrentPositionAsync (Accuracy.Balanced, 10s timeout)...');
                location = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.Balanced,
                    timeout: 10000, // 10 seconds
                });
            }

            if (location) {
                console.log('Location found:', location.coords.latitude, location.coords.longitude);
                const newCoords = {
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude
                };
                setSelectedLocation(newCoords);

                // Animate map to the new location
                if (mapRef.current) {
                    mapRef.current.animateToRegion({
                        ...newCoords,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                    }, 1000);
                }
            } else {
                console.log('No location found');
                Alert.alert('Error', 'No se pudo determinar tu ubicación exacta');
            }
        } catch (error) {
            console.error('Error getting location:', error);
            Alert.alert('Error', 'No se pudo obtener tu ubicación. Asegúrate de tener el GPS activado.');
        } finally {
            console.log('--- END handleUseMyLocation ---');
            setLoading(false);
        }
    };

    const handleConfirm = () => {
        if (selectedLocation) {
            onLocationSelect(selectedLocation);
        } else {
            Alert.alert('Error', 'Por favor selecciona una ubicación en el mapa');
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Selecciona tu ubicación</Text>
                <Text style={styles.subtitle}>Toca el mapa para marcar tu ubicación</Text>
            </View>

            <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={selectedLocation ? {
                    ...selectedLocation,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                } : defaultRegion}
                onPress={handleMapPress}
            >
                {selectedLocation && (
                    <Marker
                        coordinate={selectedLocation}
                        title="Tu ubicación"
                        draggable
                        onDragEnd={(e) => setSelectedLocation(e.nativeEvent.coordinate)}
                    />
                )}
            </MapView>

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={styles.myLocationButton}
                    onPress={handleUseMyLocation}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <Ionicons name="locate" size={20} color="#fff" />
                            <Text style={styles.myLocationText}>Usar mi ubicación</Text>
                        </>
                    )}
                </TouchableOpacity>

                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={[styles.button, styles.cancelButton]}
                        onPress={onCancel}
                    >
                        <Text style={styles.cancelButtonText}>Cancelar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, styles.confirmButton]}
                        onPress={handleConfirm}
                    >
                        <Text style={styles.confirmButtonText}>Confirmar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    header: {
        padding: 20,
        backgroundColor: '#3E7C1F',
        paddingTop: Platform.OS === 'ios' ? 60 : 40
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 5
    },
    subtitle: {
        fontSize: 14,
        color: '#fff',
        opacity: 0.9
    },
    map: {
        flex: 1
    },
    buttonContainer: {
        padding: 20,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#eee'
    },
    myLocationButton: {
        backgroundColor: '#00A650',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        gap: 10
    },
    myLocationText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 10
    },
    button: {
        flex: 1,
        padding: 15,
        borderRadius: 10,
        alignItems: 'center'
    },
    cancelButton: {
        backgroundColor: '#E0E0E0'
    },
    confirmButton: {
        backgroundColor: '#3E7C1F'
    },
    cancelButtonText: {
        color: '#666',
        fontWeight: 'bold',
        fontSize: 16
    },
    confirmButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16
    }
});
