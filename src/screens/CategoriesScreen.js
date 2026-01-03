import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    SafeAreaView,
    Platform
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getCategories } from "../api/api";

export default function CategoriesScreen() {
    const router = useRouter();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCats = async () => {
            const data = await getCategories();
            setCategories(data);
            setLoading(false);
        };
        fetchCats();
    }, []);

    const handleSelect = (categoryId) => {
        // Navigate back to home with the selected category param
        router.dismissAll();
        router.replace({
            pathname: "/(tabs)",
            params: { category: categoryId }
        });
    };

    const getCategoryIcon = (name) => {
        switch (name) {
            case 'Frutas': return 'nutrition';
            case 'Verduras': return 'leaf';
            case 'Lácteos': return 'water';
            case 'Carnes': return 'restaurant';
            case 'Cestas Variadas': return 'basket';
            case 'Salud y otros': return 'heart';
            default: return 'pricetag';
        }
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => handleSelect(item._id)}
        >
            <View style={styles.iconContainer}>
                <Ionicons name={getCategoryIcon(item.name) + "-outline"} size={30} color="#3E7C1F" />
            </View>
            <Text style={styles.name}>{item.name}</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.title}>Todas las Categorías</Text>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#3E7C1F" style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={categories}
                    renderItem={renderItem}
                    keyExtractor={item => item._id}
                    numColumns={2}
                    contentContainerStyle={styles.list}
                    columnWrapperStyle={styles.columnWrapper}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8F3EF",
        paddingTop: Platform.OS === 'android' ? 30 : 0
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#EEE'
    },
    backButton: {
        marginRight: 15
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#333"
    },
    list: {
        padding: 15
    },
    columnWrapper: {
        justifyContent: 'space-between'
    },
    card: {
        width: '48%',
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 20,
        marginBottom: 15,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    iconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#F5F9F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10
    },
    name: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
        textAlign: 'center'
    }
});
