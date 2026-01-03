import React from "react";
import { View, TextInput, StyleSheet, TouchableOpacity, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "../context/AuthContext";

export default function SearchBar({ value, onChangeText }) {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Buscar aquí"
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
      />
      {user && (
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push("/add-product")}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 15,
    marginTop: 40, // Increased top spacing
  },
  input: {
    flex: 1,
    backgroundColor: "#fff", // White background as per image
    borderRadius: 10, // Slight radius
    paddingHorizontal: 15,
    height: 50,
    elevation: 2, // Shadow for Android
    shadowColor: "#000", // Shadow for iOS
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  addBtn: {
    backgroundColor: "#3E7C1F", // Darker green from image
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 15, // Space between input and button
  },
});
