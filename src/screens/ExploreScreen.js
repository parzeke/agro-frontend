import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions, ActivityIndicator } from "react-native";
import MapView, { Marker, Callout } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import { useProducts } from "../context/ProductsContext";
import ProductsGrid from "../components/ProductsGrid";
import { useRouter } from "expo-router";
import { getUsersWithLocation } from "../api/api";
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get("window");

export default function ExploreScreen() {
    const insets = useSafeAreaInsets();
    const mapRef = useRef(null);
    const [viewMode, setViewMode] = useState("list"); // "list" or "map"
    const [usersWithLocation, setUsersWithLocation] = useState([]);
    const [loadingLocations, setLoadingLocations] = useState(false);
    const [userLocation, setUserLocation] = useState(null);
    const { products, loading: productsLoading } = useProducts();
    const router = useRouter();

    // Initial region for the map (Spain) - will be updated by user location if available
    const [region, setRegion] = useState({
        latitude: 40.4168,
        longitude: -3.7038,
        latitudeDelta: 0.8,
        longitudeDelta: 0.8,
    });

    // Load users on mount so they are ready when switching to map
    useEffect(() => {
        const fetchAllUsers = async () => {
            try {
                const users = await getUsersWithLocation();
                setUsersWithLocation(users);
            } catch (e) {
                console.error("Failed to fetch users:", e);
            }
        };
        fetchAllUsers();
    }, []);

    useEffect(() => {
        if (viewMode === "map") {
            const getInitialLocation = async () => {
                setLoadingLocations(true);
                try {
                    const { status } = await Location.requestForegroundPermissionsAsync();
                    if (status === 'granted') {
                        let location = await Location.getLastKnownPositionAsync({});
                        if (!location) {
                            location = await Location.getCurrentPositionAsync({
                                accuracy: Location.Accuracy.Balanced,
                            });
                        }

                        if (location) {
                            const userCoords = {
                                latitude: location.coords.latitude,
                                longitude: location.coords.longitude,
                                latitudeDelta: 0.08,
                                longitudeDelta: 0.08,
                            };
                            setUserLocation(userCoords);
                            setRegion(userCoords);
                            // Animate after a small delay to ensure map is ready
                            setTimeout(() => {
                                mapRef.current?.animateToRegion(userCoords, 1000);
                            }, 500);
                        }
                    }
                } catch (error) {
                    console.error("Location error:", error);
                } finally {
                    setLoadingLocations(false);
                }
            };
            getInitialLocation();
        }
    }, [viewMode]);

    const centerMap = () => {
        if (userLocation && mapRef.current) {
            mapRef.current.animateToRegion({
                ...userLocation,
                latitudeDelta: 0.08,
                longitudeDelta: 0.08,
            }, 1000);
        }
    };

    const handleUserPress = (userId) => {
        router.push(`/user/${userId}`);
    };

    return (
        <View style={styles.container}>
            {/* Header / Toggle Buttons */}
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 15) }]}>
                <View style={styles.toggleContainer}>
                    <TouchableOpacity
                        style={[styles.toggleButton, viewMode === "list" && styles.toggleButtonActive]}
                        onPress={() => setViewMode("list")}
                    >
                        <Ionicons
                            name="list"
                            size={20}
                            color={viewMode === "list" ? "#fff" : "#666"}
                        />
                        <Text style={[styles.toggleText, viewMode === "list" && styles.toggleTextActive]}>
                            Productos
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.toggleButton, viewMode === "map" && styles.toggleButtonActive]}
                        onPress={() => setViewMode("map")}
                    >
                        <Ionicons
                            name="map"
                            size={20}
                            color={viewMode === "map" ? "#fff" : "#666"}
                        />
                        <Text style={[styles.toggleText, viewMode === "map" && styles.toggleTextActive]}>
                            Mapa
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Content View */}
            <View style={styles.content}>
                {viewMode === "list" ? (
                    <View style={{ flex: 1, paddingHorizontal: 20 }}>
                        <ProductsGrid selectedCategory="all" />
                    </View>
                ) : (
                    <View style={styles.mapContainer}>
                        <MapView
                            ref={mapRef}
                            style={styles.map}
                            initialRegion={region}
                            showsUserLocation={true}
                        >
                            {usersWithLocation.map((user) => (
                                <Marker
                                    key={user._id}
                                    coordinate={{
                                        latitude: user.location.coordinates[1],
                                        longitude: user.location.coordinates[0],
                                    }}
                                    onPress={() => handleUserPress(user._id)}
                                    anchor={{ x: 0.5, y: 0.5 }}
                                >
                                    <View style={styles.greenCircleMarker} />
                                </Marker>
                            ))}
                        </MapView>

                        {userLocation && (
                            <TouchableOpacity style={styles.centerButton} onPress={centerMap}>
                                <Ionicons name="locate" size={24} color="#3E7C1F" />
                            </TouchableOpacity>
                        )}

                        {loadingLocations && (
                            <View style={styles.loadingToast}>
                                <ActivityIndicator size="small" color="#fff" />
                                <Text style={styles.loadingToastText}>Localizando...</Text>
                            </View>
                        )}
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8F3EF",
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: "#F8F3EF",
        borderBottomWidth: 1,
        borderBottomColor: "#E0E0E0",
        zIndex: 10,
    },
    toggleContainer: {
        flexDirection: "row",
        backgroundColor: "#E0E0E0",
        borderRadius: 25,
        padding: 4,
    },
    toggleButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 10,
        borderRadius: 21,
        gap: 8,
    },
    toggleButtonActive: {
        backgroundColor: "#3E7C1F",
    },
    toggleText: {
        fontSize: 15,
        fontWeight: "600",
        color: "#666",
    },
    toggleTextActive: {
        color: "#fff",
    },
    content: {
        flex: 1,
    },
    mapContainer: {
        flex: 1,
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    centerButton: {
        position: 'absolute',
        bottom: 30,
        right: 20,
        backgroundColor: '#fff',
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    loadingToast: {
        position: 'absolute',
        bottom: 100,
        alignSelf: 'center',
        backgroundColor: 'rgba(0,0,0,0.8)',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    loadingToastText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '500',
    },
    noLocationOverlay: {
        position: "absolute",
        bottom: 50,
        left: 20,
        right: 20,
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        padding: 15,
        borderRadius: 12,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    noLocationText: {
        color: "#666",
        fontSize: 14,
        textAlign: "center",
    },
    greenCircleMarker: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#3E7C1F',
        borderWidth: 2,
        borderColor: '#fff',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
});
