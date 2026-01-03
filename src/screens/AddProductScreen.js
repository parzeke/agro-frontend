import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
    KeyboardAvoidingView,
    Platform,
    Alert
} from "react-native";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useProducts } from "../context/ProductsContext";
import { useAuth } from "../context/AuthContext";
import * as ImagePicker from 'expo-image-picker';

import { getCategories } from "../api/api";

// ... (imports)

export default function AddProductScreen() {
    const router = useRouter();
    const params = useLocalSearchParams(); // Read params
    const { addProduct, editProduct } = useProducts();
    const { user } = useAuth();

    // Check if we are in edit mode
    const isEditMode = !!params.id;

    // Parse initial values (params are strings)
    const [name, setName] = useState(params.name || "");
    const [location, setLocation] = useState(params.location || "");
    const [description, setDescription] = useState(params.description || "");
    const [price, setPrice] = useState(params.price ? String(params.price) : "");
    const [weight, setWeight] = useState(params.weight ? String(params.weight) : "");
    const [weightUnit, setWeightUnit] = useState(params.weightUnit || "kg");
    const [stock, setStock] = useState(params.stock ? String(params.stock) : "1");
    const [categories, setCategories] = useState([]);

    // Careful with category ID (might be object or string depending on population)
    // We assume backend populated category, but simplified we need ID.
    // If params passing simple ID, fine. 
    const [selectedCategory, setSelectedCategory] = useState(params.category || null);

    const [image, setImage] = useState(params.image || null);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    React.useEffect(() => {
        const fetchCats = async () => {
            const data = await getCategories();
            setCategories(data);
        };
        fetchCats();
    }, []);

    const handleSubmit = async () => {
        // Sanitize price and weight (comma to dot)
        const sanitizedPrice = price.replace(',', '.');
        const sanitizedWeight = weight.replace(',', '.');

        if (!name || !sanitizedPrice || !selectedCategory || !sanitizedWeight) {
            Alert.alert(
                "Faltan datos",
                `Por favor completa todos los campos.\n\nFalta: ${!name ? 'Nombre ' : ''}${!Number(sanitizedPrice) ? 'Precio ' : ''}${!selectedCategory ? 'Categoría ' : ''}${!Number(sanitizedWeight) ? 'Peso' : ''}`
            );
            return;
        }

        if (categories.length === 0 && !selectedCategory) {
            Alert.alert("Error", "No se han cargado las categorías. Verifica tu conexión.");
            return;
        }

        const productData = {
            name,
            location,
            price: Number(sanitizedPrice),
            weight: Number(sanitizedWeight),
            weightUnit,
            stock: Number(stock) || 1,
            description,
            category: selectedCategory,
            seller: user?.id, // Keep original seller logic or ignore if backend doesn't update it
            image: image || "https://via.placeholder.com/305"
        };

        try {
            if (isEditMode) {
                await editProduct(params.id, productData);
                alert("Producto actualizado");
                router.back();
            } else {
                await addProduct(productData);
                console.log("Navigating to product-success...");
                router.push("/product-success");
            }
        } catch (error) {
            console.error("Error in handleSubmit:", error);
            alert("Error al guardar el producto");
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
        >
            <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>

                <Text style={styles.headerText}>Subir Foto</Text>

                <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                    {image ? (
                        <Image source={{ uri: image }} style={styles.previewImage} />
                    ) : (
                        <>
                            <Ionicons name="images" size={80} color="#3E7C1F" />
                            <Ionicons name="add-circle" size={30} color="#3E7C1F" style={styles.addIcon} />
                        </>
                    )}
                </TouchableOpacity>

                <Text style={styles.instructionText}>
                    La primera foto es la portada. Elige una foto clara para atraer compradores.
                </Text>

                <TextInput
                    style={styles.input}
                    placeholder="Nombre del producto"
                    value={name}
                    onChangeText={setName}
                />

                <TextInput
                    style={styles.input}
                    placeholder="Ubicación"
                    value={location}
                    onChangeText={setLocation}
                />

                <TextInput
                    style={styles.input}
                    placeholder="Descripción"
                    value={description}
                    onChangeText={setDescription}
                    multiline
                />

                <View style={styles.row}>
                    <TextInput
                        style={[styles.input, { flex: 1, marginBottom: 0 }]}
                        placeholder="Precio (€)"
                        value={price}
                        onChangeText={setPrice}
                        keyboardType="numeric"
                    />
                </View>

                <View style={styles.row}>
                    <View style={{ flex: 1.5, marginRight: 10 }}>
                        <TextInput
                            style={[styles.input, { marginBottom: 0 }]}
                            placeholder="Cantidad (Peso)"
                            value={weight}
                            onChangeText={setWeight}
                            keyboardType="numeric"
                        />
                    </View>
                    <View style={styles.unitSelector}>
                        <TouchableOpacity
                            style={[styles.unitButton, weightUnit === 'gr' && styles.unitButtonActive]}
                            onPress={() => setWeightUnit('gr')}
                        >
                            <Text style={[styles.unitText, weightUnit === 'gr' && styles.unitTextActive]}>gr</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.unitButton, weightUnit === 'kg' && styles.unitButtonActive]}
                            onPress={() => setWeightUnit('kg')}
                        >
                            <Text style={[styles.unitText, weightUnit === 'kg' && styles.unitTextActive]}>kg</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <TextInput
                    style={styles.input}
                    placeholder="Unidades disponibles (Stock)"
                    value={stock}
                    onChangeText={setStock}
                    keyboardType="numeric"
                />

                <Text style={styles.sectionTitle}>Categoría</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                    {categories.map((cat) => (
                        <TouchableOpacity
                            key={cat._id}
                            style={[
                                styles.chip,
                                selectedCategory === cat._id && styles.selectedChip
                            ]}
                            onPress={() => setSelectedCategory(cat._id)}
                        >
                            <Text style={[
                                styles.chipText,
                                selectedCategory === cat._id && styles.selectedChipText
                            ]}>
                                {cat.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                    <Text style={styles.submitButtonText}>ENVIAR</Text>
                </TouchableOpacity>

            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8F3EF",
        padding: 20
    },
    headerText: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10,
        color: "#000"
    },
    imagePicker: {
        alignItems: "center",
        justifyContent: "center",
        height: 150,
        marginBottom: 10,
        position: 'relative',
        backgroundColor: '#F5F5F5',
        borderRadius: 15,
        overflow: 'hidden'
    },
    previewImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover'
    },
    addIcon: {
        position: 'absolute',
        bottom: 30,
        right: '35%'
    },
    instructionText: {
        fontSize: 14,
        color: "#666",
        marginBottom: 20,
        textAlign: "center"
    },
    input: {
        borderWidth: 1,
        borderColor: "#E0E0E0",
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        fontSize: 16,
        backgroundColor: '#FCFCFC'
    },
    row: {
        flexDirection: 'row',
        marginBottom: 15,
        alignItems: 'center'
    },
    unitSelector: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#F0F0F0',
        borderRadius: 12,
        padding: 4,
        height: 54,
    },
    unitButton: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
    },
    unitButtonActive: {
        backgroundColor: '#fff',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    unitText: {
        fontSize: 14,
        color: '#666',
        fontWeight: 'bold'
    },
    unitTextActive: {
        color: '#3E7C1F',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 10,
        color: "#333",
        marginTop: 5
    },
    categoryScroll: {
        marginBottom: 20,
    },
    chip: {
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: "#F0F0F0",
        marginRight: 10,
        borderWidth: 1,
        borderColor: "#E0E0E0",
    },
    selectedChip: {
        backgroundColor: "#3E7C1F",
        borderColor: "#3E7C1F",
    },
    chipText: {
        color: "#333",
        fontSize: 14,
    },
    selectedChipText: {
        color: "#FFF",
        fontWeight: "bold"
    },
    submitButton: {
        backgroundColor: "#00A650",
        padding: 15,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 10
    },
    submitButtonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 18
    }
});
