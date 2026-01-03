import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    FlatList,
    StatusBar,
    Alert
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import AuthForm from "../components/AuthForm";
import { getProducts, updateProfileImage, getUserReviews } from "../api/api";
import * as ImagePicker from 'expo-image-picker';

const StarRating = ({ rating, size = 20 }) => {
    return (
        <View style={{ flexDirection: 'row', gap: 2 }}>
            {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons
                    key={star}
                    name={star <= Math.round(rating) ? "star" : "star-outline"}
                    size={size}
                    color={star <= Math.round(rating) ? "#FFD700" : "#ccc"}
                />
            ))}
        </View>
    );
};

export default function ProfileScreen() {
    const router = useRouter();
    const { user, token, logout, login } = useAuth();
    const [myProducts, setMyProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [localImage, setLocalImage] = useState(null);
    const [reviews, setReviews] = useState([]);

    useEffect(() => {
        if (user) {
            loadUserProducts();
            loadReviews();
        }
    }, [user]);

    const loadReviews = async () => {
        if (!user || !user.id) return;
        const data = await getUserReviews(user.id);
        setReviews(data);
    };

    const loadUserProducts = async () => {
        if (!user || !user.id) return;
        setLoading(true);
        const data = await getProducts('all', user.id);
        setMyProducts(data);
        setLoading(false);
    };

    const pickImage = async () => {
        // No permissions request is necessary for launching the image library
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            const selectedUri = result.assets[0].uri;
            setLocalImage(selectedUri);

            // Proactively try to update on backend if we have a token
            try {
                if (token) {
                    const updatedUser = await updateProfileImage(selectedUri, token);
                    // Update auth context with new user data (which should include new avatar)
                    if (updatedUser) {
                        login(updatedUser, token);
                    }
                    Alert.alert("Éxito", "Foto de perfil actualizada");
                }
            } catch (error) {
                console.error("Failed to upload profile image:", error);
                Alert.alert("Error", "No se pudo subir la imagen al servidor");
            }
        }
    };

    const handleDeleteProduct = async (id) => {
        try {
            const response = await fetch(`http://192.168.1.5:5000/api/products/${id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                loadUserProducts();
            }
        } catch (error) {
            console.error("Error deleting product:", error);
        }
    };

    if (!user) {
        return <AuthForm />;
    }

    const renderProductItem = ({ item }) => (
        <TouchableOpacity
            style={styles.productCard}
            onPress={() => router.push(`/product/${item._id}`)}
        >
            <View style={styles.productImageContainer}>
                <Image source={{ uri: item.image }} style={styles.productImage} />
            </View>
            <View style={styles.productInfo}>
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productLocation}>{item.location || "Ubicación"}</Text>
                <Text style={styles.productPrice}>{item.price} €</Text>
                <TouchableOpacity
                    style={[styles.nunuaButton, { backgroundColor: "#0A8E4E" }]}
                    onPress={() => {
                        router.push({
                            pathname: "/add-product",
                            params: {
                                id: item._id,
                                name: item.name,
                                price: item.price,
                                weight: item.weight,
                                weightUnit: item.weightUnit,
                                stock: item.stock,
                                description: item.description,
                                location: item.location,
                                image: item.image,
                                category: item.category?._id || item.category
                            }
                        });
                    }}
                >
                    <Text style={styles.nunuaText}>EDITAR</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    const averageRating = reviews.length > 0
        ? (reviews.reduce((acc, current) => acc + current.rating, 0) / reviews.length).toFixed(1)
        : 0;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <FlatList
                data={myProducts}
                renderItem={renderProductItem}
                keyExtractor={(item) => item._id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContainer}
                ListHeaderComponent={
                    <>
                        <View style={styles.greenHeader}>
                            <SafeAreaView style={styles.headerContent}>
                                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                                    <Ionicons name="arrow-back" size={28} color="#fff" />
                                </TouchableOpacity>
                                <Text style={styles.headerTitle}>Perfil</Text>
                                <View style={{ width: 28 }} />
                            </SafeAreaView>
                        </View>

                        <View style={styles.profileInfoSection}>
                            <TouchableOpacity style={styles.avatarWrapper} onPress={pickImage}>
                                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                                    {localImage || user.avatar ? (
                                        <Image
                                            source={{ uri: localImage || user.avatar }}
                                            style={styles.avatarImage}
                                        />
                                    ) : (
                                        <Ionicons name="person" size={80} color="#fff" />
                                    )}
                                </View>
                                <View style={styles.cameraButton}>
                                    <Ionicons name="camera" size={20} color="#fff" />
                                </View>
                            </TouchableOpacity>
                            <Text style={styles.username}>{user.name}</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 5 }}>
                                <StarRating rating={averageRating} size={18} />
                                <Text style={{ fontSize: 14, color: '#666' }}>({reviews.length} reseñas)</Text>
                            </View>
                            {user.address && (
                                <Text style={styles.locationText}>
                                    <Ionicons name="location-outline" size={14} /> {user.address}
                                </Text>
                            )}
                            <Text style={[styles.locationText, { marginTop: 2 }]}>
                                <Ionicons name="call-outline" size={14} /> {user.phone}
                            </Text>
                        </View>

                        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 20, marginBottom: 20 }}>
                            <TouchableOpacity onPress={() => router.push('/edit-profile')} style={styles.iconButton}>
                                <Ionicons name="settings-outline" size={24} color="#00A650" />
                                <Text style={[styles.iconButtonText, { color: '#00A650' }]}>Editar Perfil</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={logout} style={styles.iconButton}>
                                <Ionicons name="log-out-outline" size={24} color="#d32f2f" />
                                <Text style={[styles.iconButtonText, { color: '#d32f2f' }]}>Salir</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.sellerHeader}>Mis Productos</Text>
                    </>
                }
                ListFooterComponent={
                    <View style={{ marginTop: 20 }}>
                        <Text style={styles.sellerHeader}>Reseñas sobre mí</Text>
                        {reviews.length === 0 ? (
                            <Text style={styles.emptyText}>No tienes reseñas todavía.</Text>
                        ) : (
                            reviews.map((rev) => (
                                <View key={rev._id} style={styles.reviewItem}>
                                    <View style={styles.reviewHeader}>
                                        <Text style={styles.reviewerName}>{rev.reviewer?.name || "Usuario"}</Text>
                                        <StarRating rating={rev.rating} size={12} />
                                    </View>
                                    <Text style={styles.reviewDate}>
                                        {new Date(rev.createdAt).toLocaleDateString()}
                                    </Text>
                                </View>
                            ))
                        )}
                    </View>
                }
                ListEmptyComponent={<Text style={styles.emptyText}>No tienes productos publicados.</Text>}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8F3EF",
    },
    greenHeader: {
        backgroundColor: "#0A8E4E",
        height: 180,
    },
    headerContent: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        marginTop: 10,
    },
    headerTitle: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
    },
    profileInfoSection: {
        alignItems: "center",
        marginTop: -75,
        marginBottom: 20,
    },
    avatarWrapper: {
        position: "relative",
    },
    avatar: {
        width: 150,
        height: 150,
        borderRadius: 75,
        borderWidth: 4,
        borderColor: "#F8F8F8",
        backgroundColor: "#ccc",
        overflow: 'hidden'
    },
    avatarPlaceholder: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#E1E4E8'
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    cameraButton: {
        position: "absolute",
        bottom: 5,
        right: 5,
        backgroundColor: "#0A8E4E",
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 3,
        borderColor: "#fff"
    },
    username: {
        fontSize: 26,
        fontWeight: "bold",
        color: "#2E3A59",
        marginTop: 15,
    },
    locationText: {
        fontSize: 16,
        color: "#8F9BB3",
        marginTop: 5,
    },
    listContainer: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    productCard: {
        backgroundColor: "#fff",
        borderRadius: 20,
        flexDirection: "row",
        padding: 12,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    productImageContainer: {
        width: 130,
        height: 110,
        borderRadius: 15,
        overflow: "hidden",
        borderWidth: 2,
        borderColor: "#0A8E4E",
    },
    productImage: {
        width: "100%",
        height: "100%",
    },
    productInfo: {
        flex: 1,
        marginLeft: 15,
        justifyContent: "space-between",
    },
    productName: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#000",
    },
    productLocation: {
        fontSize: 14,
        color: "#8F9BB3",
    },
    productPrice: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#000",
    },
    nunuaButton: {
        backgroundColor: "#0A8E4E",
        borderRadius: 20,
        paddingVertical: 8,
        paddingHorizontal: 20,
        alignSelf: "flex-end",
    },
    nunuaText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 12,
    },
    emptyText: {
        textAlign: "center",
        color: "#888",
        marginTop: 30
    },
    iconButton: {
        alignItems: 'center',
        padding: 10,
    },
    iconButtonText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#0A8E4E',
        marginTop: 5
    },
    backButton: {
        padding: 5
    },
    sellerHeader: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#999',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginTop: 10
    },
    reviewItem: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 15,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#eee'
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5
    },
    reviewerName: {
        fontWeight: 'bold',
        fontSize: 14,
        color: '#333'
    },
    reviewDate: {
        fontSize: 10,
        color: '#999',
        marginTop: 5,
        textAlign: 'right'
    }
});
