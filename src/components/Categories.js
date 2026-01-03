import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Image, StyleSheet, ActivityIndicator, TouchableOpacity } from "react-native";
import Ionicons from '@expo/vector-icons/Ionicons';
import { getCategories } from "../api/api";
import { useRouter } from "expo-router";

export default function Categories({ selectedId, onSelectCategory }) {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      const data = await getCategories();
      setCategories(data);
      setLoading(false);
    };
    fetchCategories();
  }, []);

  if (loading) {
    return <View style={styles.loadingContainer} />;
  }

  const allCategories = [{ _id: 'all', name: 'Todas' }, ...categories];

  const getCategoryIcon = (name) => {
    switch (name) {
      case 'Frutas': return 'nutrition';
      case 'Verduras': return 'leaf';
      case 'Lácteos': return 'water'; // approximation
      case 'Carnes': return 'restaurant';
      case 'Cestas Variadas': return 'basket';
      case 'Salud y otros': return 'heart';
      case 'Todas': return 'apps';
      default: return 'pricetag';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Comprar por categoría</Text>
        <TouchableOpacity onPress={() => router.push('/categories')}>
          <Text style={styles.seeAll}>Ver todo</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {allCategories.map(cat => {
          const iconName = getCategoryIcon(cat.name);
          const isSelected = selectedId === cat._id;
          return (
            <TouchableOpacity
              key={cat._id}
              style={[
                styles.button,
                isSelected && styles.selectedButton
              ]}
              onPress={() => onSelectCategory(cat._id)}
            >
              <Ionicons
                name={isSelected ? iconName : `${iconName}-outline`}
                size={18}
                color={isSelected ? "#FFF" : "#333"}
                style={{ marginRight: 6 }}
              />
              <Text style={[
                styles.buttonText,
                isSelected && styles.selectedButtonText
              ]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#000",
  },
  seeAll: {
    color: "#2E7D32", // Green
    fontWeight: "600",
  },
  scrollContent: {
    paddingRight: 0,
    paddingBottom: 5,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F0F0F0",
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  selectedButton: {
    backgroundColor: "#3E7C1F",
    borderColor: "#3E7C1F",
  },
  buttonText: {
    fontSize: 13,
    color: "#333",
    fontWeight: "500",
  },
  selectedButtonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
  loadingContainer: {
    height: 50,
  }
});
