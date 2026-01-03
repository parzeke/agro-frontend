import React from "react";
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { useFavorites } from "../context/FavoritesContext";
import AuthForm from "../components/AuthForm";

export default function FavoritesScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const { favorites, toggleFavorite, clearNewFavoriteNotification } = useFavorites();

    useFocusEffect(
        React.useCallback(() => {
            clearNewFavoriteNotification();
        }, [])
    );

    if (!user) {
        return <AuthForm />;
    }

    const handlePress = (id) => {
        router.push(`/product/${id}`);
    };

    if (favorites.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="heart-dislike-outline" size={60} color="#ccc" />
                <Text style={styles.emptyText}>No tienes favoritos aún.</Text>
            </View>
        );
    }

    const renderItem = ({ item }) => (
        <TouchableOpacity style={styles.card} onPress={() => handlePress(item._id)}>
            <Image source={{ uri: item.image }} style={styles.image} />

            <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>

                <View style={styles.priceContainer}>
                    <Text style={styles.price}>{item.price} €</Text>
                    {item.weight && item.weightUnit && (
                        <Text style={styles.weightPrice}>
                            {(() => {
                                const weightInKg = item.weightUnit === 'gr' ? item.weight / 1000 : item.weight;
                                const priceKg = (item.price / weightInKg).toFixed(2);
                                return `(${priceKg} €/kg)`;
                            })()}
                        </Text>
                    )}
                </View>

                <Text style={styles.weightText}>{item.weight} {item.weightUnit} por unidad</Text>

                <View style={styles.bottomRow}>
                    <View style={styles.locationRow}>
                        <Ionicons name="location-outline" size={14} color="#666" />
                        <Text style={styles.location}>{item.location}</Text>
                    </View>

                    <TouchableOpacity
                        style={styles.heartButton}
                        onPress={() => toggleFavorite(item)}
                    >
                        <Ionicons name="heart" size={20} color="#00A650" />
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={favorites}
                renderItem={renderItem}
                keyExtractor={(item) => item._id.toString()}
                numColumns={2}
                contentContainerStyle={styles.list}
                columnWrapperStyle={styles.columnWrapper}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8F3EF",
        paddingTop: 45, // Added padding for camera area
    },
    list: {
        padding: 10,
    },
    columnWrapper: {
        justifyContent: "space-between",
    },
    card: {
        backgroundColor: "#fff",
        width: "48%",
        marginBottom: 15,
        borderRadius: 15,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
    },
    image: {
        width: "100%",
        height: 120,
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        backgroundColor: "#f0f0f0"
    },
    info: {
        padding: 10,
    },
    name: {
        fontWeight: "600",
        fontSize: 14,
        color: "#333",
        marginBottom: 2
    },
    price: {
        color: "#000",
        fontWeight: "bold",
        fontSize: 14,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 4,
        marginBottom: 4,
    },
    weightPrice: {
        fontSize: 10,
        color: '#666',
        fontWeight: '500'
    },
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginTop: 2,
    },
    locationRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 1
    },
    location: {
        color: "#888",
        fontSize: 11,
        marginLeft: 2
    },
    weightText: {
        fontSize: 11,
        color: "#00A650",
        fontWeight: "500",
    },
    heartButton: {
        padding: 4,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F8F3EF"
    },
    emptyText: {
        marginTop: 10,
        color: "#999",
        fontSize: 16
    }
});
