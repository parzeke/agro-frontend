import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    Image,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    ActivityIndicator,
    TextInput
} from "react-native";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getProductById, getUserReviews, createReview } from "../api/api";
import { useAuth } from "../context/AuthContext";
import MapView, { Marker } from "react-native-maps";

const { width } = Dimensions.get("window");

const StarRating = ({ rating, size = 20, onRate }) => {
    return (
        <View style={{ flexDirection: 'row', gap: 2 }}>
            {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                    key={star}
                    onPress={() => onRate && onRate(star)}
                    disabled={!onRate}
                >
                    <Ionicons
                        name={star <= rating ? "star" : "star-outline"}
                        size={size}
                        color={star <= rating ? "#FFD700" : "#ccc"}
                    />
                </TouchableOpacity>
            ))}
        </View>
    );
};

export default function ProductDetailsScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { user, token } = useAuth();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeSlide, setActiveSlide] = useState(0);
    const [reviews, setReviews] = useState([]);
    const [userRating, setUserRating] = useState(0);
    const [userComment, setUserComment] = useState("");
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            const data = await getProductById(id);
            setProduct(data);
            if (data && data.seller) {
                const reviewData = await getUserReviews(data.seller._id);
                setReviews(reviewData);
            }
            setLoading(false);
        };
        fetchData();
    }, [id]);

    const handleReviewSubmit = async () => {
        if (!user || !token) {
            alert("Inicia sesión para dejar una reseña");
            return;
        }
        if (userRating === 0) {
            alert("Por favor elige una puntuación");
            return;
        }

        setIsSubmittingReview(true);
        try {
            await createReview({
                reviewee: product.seller._id,
                rating: userRating,
                comment: userComment
            }, token);

            // Refresh reviews
            const freshReviews = await getUserReviews(product.seller._id);
            setReviews(freshReviews);
            setUserRating(0);
            setUserComment("");
            alert("Reseña enviada con éxito");
        } catch (error) {
            console.error("Failed to submit review:", error);
            alert(error.response?.data?.message || "Error al enviar la reseña");
        } finally {
            setIsSubmittingReview(false);
        }
    };

    const onScroll = (event) => {
        const slide = Math.ceil(event.nativeEvent.contentOffset.x / event.nativeEvent.layoutMeasurement.width);
        if (slide !== activeSlide) {
            setActiveSlide(slide);
        }
    };

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#00C853" />
            </View>
        );
    }

    if (!product) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>Producto no encontrado</Text>
            </View>
        );
    }

    const isOwner = user && product.seller && user.id === product.seller._id;

    // Calculate average rating
    const averageRating = reviews.length > 0
        ? (reviews.reduce((acc, current) => acc + current.rating, 0) / reviews.length).toFixed(1)
        : 0;

    // Calculate price per kg
    const calculatePricePerKg = () => {
        if (!product.price || !product.weight || !product.weightUnit) return null;
        const weightInKg = product.weightUnit === 'gr' ? product.weight / 1000 : product.weight;
        const pricePerKg = (product.price / weightInKg).toFixed(2);
        return `${pricePerKg} €/kg`;
    };

    const pricePerKg = calculatePricePerKg();

    return (
        <View style={{ flex: 1, backgroundColor: '#F8F3EF' }}>
            <Stack.Screen options={{
                headerTitle: "",
                headerTransparent: true,
                headerTintColor: "#000",
                headerLeft: () => (
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#000" />
                    </TouchableOpacity>
                ),
                headerRight: () => (
                    <TouchableOpacity
                        onPress={() => {
                            router.push({
                                pathname: "/add-product",
                                params: {
                                    id: product._id,
                                    name: product.name,
                                    price: product.price,
                                    weight: product.weight,
                                    weightUnit: product.weightUnit,
                                    stock: product.stock,
                                    description: product.description,
                                    location: product.location,
                                    image: product.image,
                                    category: product.category?._id || product.category // handle object or ID
                                }
                            });
                        }}
                        style={{ marginRight: 15, backgroundColor: 'white', padding: 8, borderRadius: 20 }}
                    >
                        <Ionicons name="pencil" size={24} color="#00A650" />
                    </TouchableOpacity>
                )
            }} />

            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                {/* Image Carousel */}
                <View style={styles.carouselContainer}>
                    <ScrollView
                        pagingEnabled
                        horizontal
                        onScroll={onScroll}
                        showsHorizontalScrollIndicator={false}
                        scrollEventThrottle={16}
                    >
                        <Image
                            source={{ uri: product.image }}
                            style={styles.productImage}
                        />
                    </ScrollView>
                </View>

                {/* Info Section */}
                <View style={styles.infoSection}>
                    <View style={styles.headerRow}>
                        <Text style={styles.productName}>{product.name}</Text>
                    </View>

                    <View style={styles.priceRow}>
                        <Text style={styles.productPrice}>{product.price} € por unidad</Text>
                        {pricePerKg && (
                            <Text style={styles.priceKgText}>({pricePerKg})</Text>
                        )}
                    </View>

                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Ionicons name="scale-outline" size={16} color="#666" />
                            <Text style={styles.statText}>
                                {product.weight} {product.weightUnit} por unidad
                            </Text>
                        </View>
                        <View style={styles.statItem}>
                            <Ionicons name="layers-outline" size={16} color="#666" />
                            <Text style={styles.statText}>
                                {product.stock} unidades
                            </Text>
                        </View>
                    </View>

                    <Text style={styles.description}>
                        {product.description}
                    </Text>

                    {/* Location at the bottom */}
                    <View style={[styles.locationRow, { marginBottom: 25 }]}>
                        <Ionicons name="location-outline" size={18} color="#666" />
                        <Text style={[styles.productLocation, { fontSize: 16, marginLeft: 5 }]}>{product.location}</Text>
                    </View>

                    {/* Seller Location Map */}
                    {product.seller?.location?.coordinates &&
                        Array.isArray(product.seller.location.coordinates) &&
                        product.seller.location.coordinates.length === 2 &&
                        typeof product.seller.location.coordinates[0] === 'number' &&
                        typeof product.seller.location.coordinates[1] === 'number' && (
                            <View style={styles.locationSection}>
                                <Text style={styles.sellerHeader}>Ubicación del Vendedor</Text>
                                <MapView
                                    style={styles.sellerMap}
                                    initialRegion={{
                                        latitude: product.seller.location.coordinates[1],
                                        longitude: product.seller.location.coordinates[0],
                                        latitudeDelta: 0.02,
                                        longitudeDelta: 0.02,
                                    }}
                                    scrollEnabled={false}
                                    zoomEnabled={false}
                                >
                                    <Marker
                                        coordinate={{
                                            latitude: product.seller.location.coordinates[1],
                                            longitude: product.seller.location.coordinates[0]
                                        }}
                                        title={product.seller.name}
                                    />
                                </MapView>
                                {product.seller.address && (
                                    <Text style={styles.sellerAddress}>{product.seller.address}</Text>
                                )}
                            </View>
                        )}

                    {/* Seller Section */}
                    <Text style={styles.sellerHeader}>Vendedor</Text>
                    <TouchableOpacity
                        style={styles.sellerContainer}
                        onPress={() => {
                            if (product.seller?._id) {
                                router.push(`/user/${product.seller._id}`);
                            }
                        }}
                        activeOpacity={0.7}
                    >
                        <View style={styles.sellerInfoLeft}>
                            <View style={[styles.avatar, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#E1E4E8' }]}>
                                {product.seller?.avatar ? (
                                    <Image source={{ uri: product.seller.avatar }} style={styles.avatarImage} />
                                ) : (
                                    <Ionicons name="person" size={30} color="#fff" />
                                )}
                            </View>
                            <View>
                                <Text style={styles.sellerName}>{product.seller?.name || "Vendedor"}</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                                    <StarRating rating={Math.round(averageRating)} size={14} />
                                    <Text style={{ fontSize: 12, color: '#666' }}>({reviews.length})</Text>
                                </View>
                            </View>
                        </View>

                        <Ionicons name="chevron-forward" size={24} color="#999" />
                    </TouchableOpacity>

                    {/* Contact Button - Separate from seller container */}
                    {!isOwner && (
                        <TouchableOpacity
                            style={styles.chatButton}
                            onPress={() => {
                                if (!user) {
                                    alert("Debes iniciar sesión para contactar al vendedor");
                                    router.push("/auth");
                                    return;
                                }
                                if (!product.seller?._id) {
                                    return alert("Este producto no tiene un vendedor asignado (es un producto antiguo). Por favor, intenta con un producto nuevo.");
                                }
                                router.push({
                                    pathname: `/chat/${product.seller._id || product.seller.id}`,
                                    params: {
                                        productId: product._id || product.id,
                                        productName: product.name,
                                        productImage: product.image
                                    }
                                });
                            }}
                        >
                            <Ionicons name="chatbubble-ellipses-outline" size={20} color="#fff" />
                            <Text style={styles.chatButtonText}>Contactar Vendedor</Text>
                        </TouchableOpacity>
                    )}

                </View>

                {/* Review Section */}
                <View style={styles.reviewSection}>
                    <Text style={styles.sellerHeader}>Reseñas</Text>

                    {!isOwner && user && (
                        <View style={styles.leaveReviewBox}>
                            <Text style={styles.reviewTitle}>Califica al vendedor</Text>
                            <StarRating rating={userRating} onRate={setUserRating} size={30} />
                            <TextInput
                                style={styles.commentInput}
                                placeholder="Escribe tu opinión (opcional)"
                                value={userComment}
                                onChangeText={setUserComment}
                                multiline
                                numberOfLines={3}
                            />
                            <TouchableOpacity
                                style={styles.submitReviewBtn}
                                onPress={handleReviewSubmit}
                                disabled={isSubmittingReview}
                            >
                                {isSubmittingReview ? (
                                    <ActivityIndicator color="#fff" size="small" />
                                ) : (
                                    <Text style={styles.submitReviewText}>Enviar Reseña</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    )}

                    {reviews.length === 0 ? (
                        <Text style={styles.emptyReviews}>No hay reseñas todavía.</Text>
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
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8F3EF",
    },
    backButton: {
        marginLeft: 10,
        marginTop: 5
    },
    carouselContainer: {
        height: 380,
        width: width,
        position: 'relative',
        marginTop: 40,
    },
    productImage: {
        width: width,
        height: 380,
        resizeMode: "cover",
    },
    infoSection: {
        padding: 20,
        backgroundColor: '#fff',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        marginTop: -30,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8
    },
    productName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000'
    },
    productLocation: {
        fontSize: 14,
        color: '#666'
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 15,
        gap: 8
    },
    productPrice: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#00A650',
    },
    priceKgText: {
        fontSize: 16,
        color: '#666',
        fontWeight: '500'
    },
    statsRow: {
        flexDirection: 'row',
        marginBottom: 20,
        gap: 20,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#F0F2F5',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 15,
    },
    statText: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500'
    },
    description: {
        fontSize: 16,
        color: '#555',
        lineHeight: 24,
        marginBottom: 25
    },
    sellerHeader: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#999',
        textTransform: 'uppercase',
        letterSpacing: 1
    },
    sellerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 30,
        backgroundColor: '#F8F9FA',
        padding: 15,
        borderRadius: 20,
    },
    sellerInfoLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 15,
        backgroundColor: '#eee'
    },
    sellerName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2E3A59'
    },
    sellerLocation: {
        color: '#8F9BB3',
        fontSize: 12
    },
    chatButtonSmall: {
        backgroundColor: '#00A650',
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 12,
        gap: 5
    },
    chatButtonTextSmall: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 13
    },
    chatButton: {
        backgroundColor: '#00A650',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 15,
        gap: 10,
        marginTop: 10,
        marginBottom: 20
    },
    chatButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    avatarImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    reviewSection: {
        marginTop: 10,
        paddingHorizontal: 20,
    },
    locationSection: {
        marginTop: 20,
        marginBottom: 20
    },
    sellerMap: {
        width: '100%',
        height: 200,
        borderRadius: 15,
        overflow: 'hidden'
    },
    sellerAddress: {
        fontSize: 14,
        color: '#666',
        marginTop: 10,
        textAlign: 'center'
    },
    leaveReviewBox: {
        backgroundColor: '#F0F2F5',
        padding: 20,
        borderRadius: 20,
        alignItems: 'center',
        marginBottom: 20,
    },
    reviewTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333'
    },
    commentInput: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        padding: 12,
        marginTop: 15,
        marginBottom: 5,
        minHeight: 80,
        textAlignVertical: 'top',
        backgroundColor: '#fff'
    },
    submitReviewBtn: {
        backgroundColor: '#00A650',
        paddingVertical: 10,
        paddingHorizontal: 25,
        borderRadius: 20,
        marginTop: 15,
    },
    submitReviewText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    emptyReviews: {
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
        lineHeight: 20
    },
    reviewDate: {
        fontSize: 10,
        color: '#999',
        marginTop: 5,
        textAlign: 'right'
    }
});
