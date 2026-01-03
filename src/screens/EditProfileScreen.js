import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    Alert,
    Modal,
    ActivityIndicator
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import LocationPicker from "../components/LocationPicker";
import { updateProfile } from "../api/api";

export default function EditProfileScreen() {
    const router = useRouter();
    const { user, token, updateUser } = useAuth();

    const [name, setName] = useState(user?.name || "");
    const [phone, setPhone] = useState(user?.phone || "");
    const [address, setAddress] = useState(user?.address || "");
    const [location, setLocation] = useState(
        user.location && user.location.coordinates ? user.location : null
    );

    const [showLocationPicker, setShowLocationPicker] = useState(false);
    const [saving, setSaving] = useState(false);

    const handleLocationSelect = (selectedLocation) => {
        setLocation({
            type: 'Point',
            coordinates: [selectedLocation.longitude, selectedLocation.latitude]
        });
        setShowLocationPicker(false);
    };

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert("Error", "El nombre es obligatorio");
            return;
        }

        setSaving(true);
        try {
            const updateData = {
                name: name.trim(),
                phone: phone.trim(),
                address: address.trim() || null,
                ...(location && { location })
            };

            const data = await updateProfile(updateData, token);

            // Update auth context with new user data
            updateUser(data);
            Alert.alert("Éxito", "Perfil actualizado correctamente");
            router.back();
        } catch (error) {
            console.error("Error updating profile:", error);
            Alert.alert("Error", error.response?.data?.message || "No se pudo actualizar el perfil");
        } finally {
            setSaving(false);
        }
    };

    const handleRemoveLocation = () => {
        Alert.alert(
            "Eliminar ubicación",
            "¿Estás seguro de que quieres eliminar tu ubicación?",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Eliminar",
                    style: "destructive",
                    onPress: () => {
                        setLocation(null);
                        setAddress("");
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Editar Perfil</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Nombre *</Text>
                    <TextInput
                        style={styles.input}
                        value={name}
                        onChangeText={setName}
                        placeholder="Tu nombre"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Teléfono *</Text>
                    <TextInput
                        style={styles.input}
                        value={phone}
                        onChangeText={setPhone}
                        keyboardType="phone-pad"
                        placeholder="Tu número de teléfono"
                        editable={false}
                        selectTextOnFocus={false}
                    />
                    <Text style={styles.helperText}>El teléfono no se puede cambiar</Text>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Dirección</Text>
                    <TextInput
                        style={styles.input}
                        value={address}
                        onChangeText={setAddress}
                        placeholder="Ej: Calle Principal 123, Madrid"
                        multiline
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Ubicación</Text>
                    {location && location.coordinates ? (
                        <View style={styles.locationInfo}>
                            <View style={styles.locationTextContainer}>
                                <Ionicons name="location" size={20} color="#00A650" />
                                <Text style={styles.locationText}>
                                    Ubicación establecida
                                </Text>
                            </View>
                            <View style={styles.locationButtons}>
                                <TouchableOpacity
                                    style={styles.changeLocationButton}
                                    onPress={() => setShowLocationPicker(true)}
                                >
                                    <Text style={styles.changeLocationText}>Cambiar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.removeLocationButton}
                                    onPress={handleRemoveLocation}
                                >
                                    <Ionicons name="trash-outline" size={18} color="#d32f2f" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={styles.addLocationButton}
                            onPress={() => setShowLocationPicker(true)}
                        >
                            <Ionicons name="location-outline" size={20} color="#00A650" />
                            <Text style={styles.addLocationText}>Agregar ubicación</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <TouchableOpacity
                    style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                    onPress={handleSave}
                    disabled={saving}
                >
                    {saving ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.saveButtonText}>Guardar Cambios</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>

            <Modal
                visible={showLocationPicker}
                animationType="slide"
                onRequestClose={() => setShowLocationPicker(false)}
            >
                <LocationPicker
                    initialLocation={
                        location?.coordinates
                            ? {
                                latitude: location.coordinates[1],
                                longitude: location.coordinates[0]
                            }
                            : null
                    }
                    onLocationSelect={handleLocationSelect}
                    onCancel={() => setShowLocationPicker(false)}
                />
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8F3EF"
    },
    header: {
        backgroundColor: "#3E7C1F",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 15,
        paddingVertical: 15
    },
    backButton: {
        padding: 5
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#fff"
    },
    form: {
        flex: 1,
        padding: 20
    },
    inputGroup: {
        marginBottom: 25
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: "#333",
        marginBottom: 8
    },
    input: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 10,
        padding: 15,
        fontSize: 16,
        backgroundColor: "#fff"
    },
    helperText: {
        fontSize: 12,
        color: "#999",
        marginTop: 5
    },
    locationInfo: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 10,
        padding: 15,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    },
    locationTextContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10
    },
    locationText: {
        fontSize: 14,
        color: "#333"
    },
    locationButtons: {
        flexDirection: "row",
        gap: 10
    },
    changeLocationButton: {
        paddingHorizontal: 15,
        paddingVertical: 8,
        backgroundColor: "#00A650",
        borderRadius: 8
    },
    changeLocationText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "600"
    },
    removeLocationButton: {
        padding: 8
    },
    addLocationButton: {
        borderWidth: 1,
        borderColor: "#00A650",
        borderRadius: 10,
        padding: 15,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        borderStyle: "dashed"
    },
    addLocationText: {
        color: "#00A650",
        fontSize: 16,
        fontWeight: "600"
    },
    saveButton: {
        backgroundColor: "#3E7C1F",
        padding: 18,
        borderRadius: 12,
        alignItems: "center",
        marginTop: 10,
        marginBottom: 30
    },
    saveButtonDisabled: {
        opacity: 0.6
    },
    saveButtonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16
    }
});
