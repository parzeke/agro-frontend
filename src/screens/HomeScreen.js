import React from "react";
import { View, StyleSheet } from "react-native";
import SearchBar from "../components/SearchBar";
import Categories from "../components/Categories";
import ProductsGrid from "../components/ProductsGrid";

import { useLocalSearchParams } from "expo-router";

export default function HomeScreen() {
    const params = useLocalSearchParams();
    const [selectedCategory, setSelectedCategory] = React.useState('all');
    const [searchQuery, setSearchQuery] = React.useState('');

    React.useEffect(() => {
        if (params.category) {
            setSelectedCategory(params.category);
        }
    }, [params.category]);

    return (
        <View style={{ flex: 1, backgroundColor: "#F8F3EF", paddingHorizontal: 20 }}>
            <SearchBar
                value={searchQuery}
                onChangeText={setSearchQuery}
            />
            <Categories
                selectedId={selectedCategory}
                onSelectCategory={setSelectedCategory}
            />
            <View style={{ flex: 1 }}>
                <ProductsGrid
                    selectedCategory={selectedCategory}
                    searchQuery={searchQuery}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({});
