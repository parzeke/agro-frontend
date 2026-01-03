import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function ProductSuccessScreen() {
    const router = useRouter();

    const handleContinue = () => {
        // Navigate back to home (tabs)
        router.replace("/(tabs)");
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <Ionicons name="checkmark-circle" size={100} color="#00A650" />
                </View>

                <Text style={styles.title}>¡Enhorabuena!</Text>
                <Text style={styles.subtitle}>¡Has creado un producto!</Text>

                <Text style={styles.description}>
                    Tu producto ya está disponible para que otros usuarios puedan verlo y comprarlo.
                </Text>

                <TouchableOpacity style={styles.button} onPress={handleContinue}>
                    <Text style={styles.buttonText}>CONTINUAR</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8F3EF",
    },
    content: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 30,
    },
    iconContainer: {
        marginBottom: 30,
        backgroundColor: '#fff',
        borderRadius: 100,
        padding: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 22,
        fontWeight: "600",
        color: "#3E7C1F",
        marginBottom: 20,
    },
    description: {
        fontSize: 16,
        color: "#666",
        textAlign: "center",
        lineHeight: 24,
        marginBottom: 40,
    },
    button: {
        backgroundColor: "#00A650",
        paddingVertical: 15,
        paddingHorizontal: 60,
        borderRadius: 30,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
    },
    buttonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
    },
});
