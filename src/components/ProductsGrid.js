import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useProducts } from "../context/ProductsContext";
import { useAuth } from "../context/AuthContext";
import { useFavorites } from "../context/FavoritesContext";

export default function ProductsGrid({ selectedCategory, searchQuery = '' }) {
  const router = useRouter();
  const { products, fetchProducts, loading: contextLoading } = useProducts();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchProducts(selectedCategory);
  }, [selectedCategory]);

  // Filter products based on search query
  const filteredProducts = useMemo(() => {
    if (!searchQuery) return products;

    const query = searchQuery.toLowerCase().trim();
    return products.filter(product =>
      product.name.toLowerCase().includes(query) ||
      (product.location && product.location.toLowerCase().includes(query))
    );
  }, [products, searchQuery]);

  // Pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProducts(selectedCategory);
    setRefreshing(false);
  };

  const handlePress = (id) => {
    router.push(`/product/${id}`);
  };

  const renderItem = ({ item }) => {
    const isFav = isFavorite(item._id);

    return (
      <TouchableOpacity
        style={[styles.card, { opacity: contextLoading && !refreshing ? 0.6 : 1 }]}
        onPress={() => handlePress(item._id)}
      >
        <Image source={{ uri: item.image }} style={styles.image} />

        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>

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

            {user && (
              <TouchableOpacity
                style={styles.heartButton}
                onPress={() => toggleFavorite(item)}
              >
                <Ionicons
                  name={isFavorite(item._id) ? "heart" : "heart-outline"}
                  size={20}
                  color={isFavorite(item._id) ? "#00A650" : "#666"}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };



  return (
    <View style={{ flex: 1, backgroundColor: "#F8F3EF" }}>
      <FlatList
        data={filteredProducts}
        numColumns={2}
        keyExtractor={(item) => item._id}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => <Text style={styles.title}>Recomendado</Text>}
        ListEmptyComponent={() => (
          !contextLoading && (
            <Text style={{ textAlign: "center", marginTop: 20, color: "#666" }}>
              {searchQuery ? "No se encontraron productos que coincidan con tu búsqueda" : "No hay productos en esta categoría"}
            </Text>
          )
        )}
        contentContainerStyle={{ paddingVertical: 10, flexGrow: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["green"]}
            tintColor="green"
          />
        }
        ListFooterComponent={() => <View style={{ height: 100 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    marginTop: 10,
  },
  card: {
    width: "48%",
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 15,
    // Optional shadow for cards
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  image: {
    width: "100%",
    height: 140,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    backgroundColor: "#f0f0f0",
  },
  info: {
    padding: 10,
  },
  name: {
    fontWeight: "600",
    fontSize: 14,
    color: "#333",
    marginBottom: 2,
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
  sellerAndLocation: {
    flex: 1,
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
  sellerName: {
    fontSize: 11,
    color: "#00A650",
    fontWeight: "500",
  },
  weightText: {
    fontSize: 11,
    color: "#00A650",
    fontWeight: "500",
  },
  heartButton: {
    padding: 4,
  }
});
