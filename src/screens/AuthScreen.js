import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    Alert,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { loginUser, registerUser } from "../api/api";
import { useAuth } from "../context/AuthContext";

export default function AuthScreen() {
    const router = useRouter();
    const { login } = useAuth();
    const [isLogin, setIsLogin] = useState(true);

    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const handleAuth = async () => {
        try {
            if (isLogin) {
                const data = await loginUser({ phone, password });

                // Extraemos el token y el resto de los datos
                let token, userData;
                if (data.user) {
                    token = data.token;
                    userData = data.user;
                } else {
                    token = data.token;
                    userData = { ...data };
                    delete userData.token;
                }

                console.log("DATA:", data);
                console.log("TOKEN:", token);
                console.log("USERDATA:", userData);

                // Guardamos en AuthContext
                login(userData, token);

                Alert.alert("Éxito", `Bienvenido ${userData.name}`);
                router.replace("/(tabs)");
            } else {
                await registerUser({ name, phone, password });
                Alert.alert("Éxito", "Usuario registrado. Ahora inicia sesión.");
                setIsLogin(true);
            }
        } catch (error) {
            console.log("LOGIN ERROR STATUS:", error.response?.status);
            console.log("LOGIN ERROR DATA:", error.response?.data);
            console.log("LOGIN ERROR HEADERS:", error.response?.headers);

            Alert.alert(
                "Error",
                `Status: ${error.response?.status}\n${JSON.stringify(error.response?.data)}`
            );
        }
    };


    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>
                    {isLogin ? "Iniciar Sesión" : "Registrarse"}
                </Text>
                <Text style={styles.headerSubtitle}>
                    {isLogin ? "Bienvenido, ¿Tienes cuenta? Entrar" : "Crea una cuenta para empezar"}
                </Text>
            </View>

            <View style={styles.content}>
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tab, isLogin && styles.activeTab]}
                        onPress={() => setIsLogin(true)}
                    >
                        <Text style={[styles.tabText, isLogin && styles.activeTabText]}>Iniciar Sesión</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, !isLogin && styles.activeTab]}
                        onPress={() => setIsLogin(false)}
                    >
                        <Text style={[styles.tabText, !isLogin && styles.activeTabText]}>Registrarse</Text>
                    </TouchableOpacity>
                </View>

                {!isLogin && (
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Nombre</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Tu nombre completo"
                            value={name}
                            onChangeText={setName}
                        />
                    </View>
                )}

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Teléfono</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Ej: 0712345678"
                        value={phone}
                        onChangeText={setPhone}
                        keyboardType="phone-pad"
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Contraseña</Text>
                    <View style={styles.passwordContainer}>
                        <TextInput
                            style={styles.inputPassword}
                            placeholder="Contraseña"
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                        />
                        <Ionicons name="eye-off-outline" size={20} color="#666" />
                    </View>
                </View>

                {isLogin && (
                    <View style={styles.forgotContainer}>
                        <View style={styles.checkboxContainer}>
                            <Ionicons name="checkbox" size={20} color="green" />
                            <Text style={styles.rememberText}>Recordarme</Text>
                        </View>
                        <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
                    </View>
                )}

                <TouchableOpacity style={styles.authButton} onPress={handleAuth}>
                    <Text style={styles.authButtonText}>
                        {isLogin ? "Entrar" : "Registrarse"}
                    </Text>
                </TouchableOpacity>

            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8F3EF",
        justifyContent: 'center' // Center vertically
    },
    header: {
        backgroundColor: "#F8F3EF",
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 10,
        alignItems: 'center' // Center content horizontally
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#3E7C1F",
        marginBottom: 5,
        textAlign: 'center'
    },
    headerSubtitle: {
        fontSize: 16,
        color: "#666",
        textAlign: 'center'
    },
    content: {
        padding: 20,
        paddingTop: 10,
        justifyContent: 'center' // Optional: if they want vertical centering? usually forms are top aligned but let's stick to horizontal for now per component structure
    },
    tabContainer: {
        flexDirection: "row",
        backgroundColor: "#F5F5F5",
        borderRadius: 25,
        marginBottom: 30,
        padding: 5
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: "center",
        borderRadius: 20
    },
    activeTab: {
        backgroundColor: "#fff",
        elevation: 2,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 2
    },
    tabText: {
        fontWeight: "600",
        color: "#666"
    },
    activeTabText: {
        color: "#3E7C1F",
        fontWeight: "bold"
    },
    inputContainer: {
        marginBottom: 20
    },
    label: {
        fontSize: 14,
        color: "#333",
        fontWeight: "600",
        marginBottom: 8
    },
    input: {
        backgroundColor: "#F5F5F5",
        padding: 15,
        borderRadius: 10
    },
    passwordContainer: {
        backgroundColor: "#F5F5F5",
        padding: 15,
        borderRadius: 10,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between"
    },
    inputPassword: {
        flex: 1
    },
    forgotContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 30
    },
    checkboxContainer: {
        flexDirection: "row",
        alignItems: "center"
    },
    rememberText: {
        marginLeft: 5,
        color: "#666"
    },
    forgotText: {
        color: "#3E7C1F",
        fontWeight: "600"
    },
    authButton: {
        backgroundColor: "#3E7C1F",
        paddingVertical: 18,
        borderRadius: 10,
        alignItems: "center",
        marginBottom: 20
    },
    authButtonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold"
    }
});
