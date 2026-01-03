import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    ActivityIndicator
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getUserById, getUserReviews, getProducts } from "../api/api";
import MapView, { Marker } from "react-native-maps";

const ProductCard = ({ product, onPress }) => (
    <TouchableOpacity style={styles.productCard} onPress={onPress}>
        <Image source={{ uri: product.image }} style={styles.productImage} />
        <View style={styles.productDetails}>
            <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
            <Text style={styles.productPrice}>{product.price}€</Text>
        </View>
    </TouchableOpacity>
);

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

export default function UserProfileScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [userData, reviewData, productData] = await Promise.all([
                    getUserById(id),
                    getUserReviews(id),
                    getProducts('all', id)
                ]);
                setUser(userData);
                setReviews(reviewData);
                setProducts(productData);
            } catch (error) {
                console.error("Error loading user profile:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const averageRating = reviews.length > 0
        ? (reviews.reduce((acc, current) => acc + current.rating, 0) / reviews.length).toFixed(1)
        : 0;

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#00A650" />
            </View>
        );
    }

    if (!user) {
        return (
            <View style={styles.loadingContainer}>
                <Text>Usuario no encontrado</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.greenHeader}>
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={28} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Perfil de Usuario</Text>
                    <View style={{ width: 28 }} />
                </View>
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.profileInfoSection}>
                    <View style={[styles.avatar, styles.avatarPlaceholder]}>
                        {user.avatar ? (
                            <Image
                                source={{ uri: user.avatar }}
                                style={styles.avatarImage}
                            />
                        ) : (
                            <Ionicons name="person" size={80} color="#fff" />
                        )}
                    </View>
                    <Text style={styles.username}>{user.name}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 5 }}>
                        <StarRating rating={averageRating} size={18} />
                        <Text style={{ fontSize: 14, color: '#666' }}>({reviews.length} reseñas)</Text>
                    </View>
                    <Text style={styles.locationText}>{user.phone || "Sin teléfono"}</Text>
                </View>

                {user.location?.coordinates &&
                    Array.isArray(user.location.coordinates) &&
                    user.location.coordinates.length === 2 &&
                    typeof user.location.coordinates[0] === 'number' &&
                    typeof user.location.coordinates[1] === 'number' && (
                        <View style={styles.mapSection}>
                            <Text style={styles.mapTitle}>Ubicación</Text>
                            <MapView
                                style={styles.map}
                                initialRegion={{
                                    latitude: user.location.coordinates[1],
                                    longitude: user.location.coordinates[0],
                                    latitudeDelta: 0.01,
                                    longitudeDelta: 0.01,
                                }}
                                scrollEnabled={false}
                                zoomEnabled={false}
                            >
                                <Marker
                                    coordinate={{
                                        latitude: user.location.coordinates[1],
                                        longitude: user.location.coordinates[0]
                                    }}
                                    title={user.name}
                                />
                            </MapView>
                            {user.address && (
                                <Text style={styles.addressText}>{user.address}</Text>
                            )}
                        </View>
                    )}

                <View style={styles.productsSection}>
                    <Text style={styles.sectionHeader}>Productos</Text>
                    {products.length === 0 ? (
                        <Text style={styles.emptyText}>Este usuario no tiene productos a la venta.</Text>
                    ) : (
                        <View style={styles.productsList}>
                            {products.map((prod) => (
                                <ProductCard
                                    key={prod._id}
                                    product={prod}
                                    onPress={() => router.push(`/product/${prod._id}`)}
                                />
                            ))}
                        </View>
                    )}
                </View>

                <View style={styles.reviewsSection}>
                    <Text style={styles.sectionHeader}>Reseñas</Text>
                    {reviews.length === 0 ? (
                        <Text style={styles.emptyText}>Este usuario no tiene reseñas todavía.</Text>
                    ) : (
                        reviews.map((rev) => (
                            <View key={rev._id} style={styles.reviewItem}>
                                <View style={styles.reviewHeader}>
                                    <Text style={styles.reviewerName}>{rev.reviewer?.name || "Usuario"}</Text>
                                    <StarRating rating={rev.rating} size={12} />
                                </View>
                                {rev.comment ? <Text style={styles.reviewComment}>{rev.comment}</Text> : null}
                                <Text style={styles.reviewDate}>
                                    {new Date(rev.createdAt).toLocaleDateString()}
                                </Text>
                            </View>
                        ))
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F3EF'
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    greenHeader: {
        backgroundColor: '#3E7C1F',
        paddingBottom: 20
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingTop: 10
    },
    backButton: {
        padding: 5
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff'
    },
    scrollView: {
        flex: 1
    },
    profileInfoSection: {
        alignItems: 'center',
        paddingVertical: 30,
        backgroundColor: '#F8F3EF',
        borderBottomWidth: 1,
        borderBottomColor: '#eee'
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginBottom: 15,
        backgroundColor: '#E1E4E8',
        justifyContent: 'center',
        alignItems: 'center'
    },
    avatarPlaceholder: {
        backgroundColor: '#E1E4E8'
    },
    avatarImage: {
        width: 120,
        height: 120,
        borderRadius: 60
    },
    username: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2E3A59',
        marginBottom: 5
    },
    locationText: {
        fontSize: 14,
        color: '#8F9BB3',
        marginTop: 5
    },
    mapSection: {
        width: '100%',
        paddingHorizontal: 20,
        marginTop: 20
    },
    mapTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333'
    },
    map: {
        width: '100%',
        height: 200,
        borderRadius: 15,
        overflow: 'hidden'
    },
    addressText: {
        fontSize: 14,
        color: '#666',
        marginTop: 10,
        textAlign: 'center'
    },
    productsSection: {
        padding: 20,
    },
    productsList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 10,
    },
    productCard: {
        width: '48%',
        backgroundColor: '#fff',
        borderRadius: 15,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#eee',
        marginBottom: 10,
    },
    productImage: {
        width: '100%',
        height: 120,
    },
    productDetails: {
        padding: 10,
    },
    productName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    productPrice: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#3E7C1F',
        marginTop: 4,
    },
    reviewsSection: {
        padding: 20
    },
    sectionHeader: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#999',
        textTransform: 'uppercase',
        letterSpacing: 1
    },
    emptyText: {
        textAlign: 'center',
        color: '#999',
        marginVertical: 20,
        fontStyle: 'italic'
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
    reviewComment: {
        fontSize: 14,
        color: '#555',
        lineHeight: 20,
        marginTop: 5
    },
    reviewDate: {
        fontSize: 10,
        color: '#999',
        marginTop: 5,
        textAlign: 'right'
    }
});
