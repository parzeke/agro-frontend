import React, { useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    SafeAreaView,
    Dimensions,
    Alert
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session'; // Import this
import { socialLogin } from "../api/api";
import { useAuth } from "../context/AuthContext";

WebBrowser.maybeCompleteAuthSession();

// Generate a redirect URI. 
// For Expo Go, this is usually exp://... 
// For production, it might be the scheme (agrofrontend://)
const redirectUri = makeRedirectUri({
    scheme: 'agrofrontend'
});

console.log("GOOGLE REDIRECT URI:", redirectUri); // User needs to whitelist this!

// Google blocks 'exp://' redirects in development. 
// Set this to TRUE to use a mock login for testing.
// Set this to FALSE for production builds (APK/IPA).
const USE_SIMULATION = true;

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
    const router = useRouter();
    const { login } = useAuth();

    // Google Auth Request (Only used if USE_SIMULATION is false)
    const [request, response, promptAsync] = Google.useAuthRequest({
        webClientId: '937623179468-ab94v98ff1nsbfeiiddotv30pt7et4pv.apps.googleusercontent.com',
        iosClientId: '937623179468-ab94v98ff1nsbfeiiddotv30pt7et4pv.apps.googleusercontent.com',
        androidClientId: '937623179468-ab94v98ff1nsbfeiiddotv30pt7et4pv.apps.googleusercontent.com',
        redirectUri: redirectUri,
        scopes: ['profile', 'email'],
    });

    useEffect(() => {
        if (response?.type === 'success') {
            const { authentication } = response;
            fetchGoogleUserProfile(authentication.accessToken);
        }
    }, [response]);

    const fetchGoogleUserProfile = async (token) => {
        try {
            const response = await fetch('https://www.googleapis.com/userinfo/v2/me', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const user = await response.json();

            // Format for our backend
            const socialData = {
                name: user.name,
                email: user.email,
                googleId: user.id,
                avatar: user.picture
            };

            const data = await socialLogin(socialData);
            login(data, data.token);
            await AsyncStorage.setItem('hasSeenWelcome', 'true');
            router.replace("/(tabs)");

        } catch (error) {
            console.error("Google Fetch Error:", error);
            Alert.alert("Error", "No se pudo obtener información de Google");
        }
    };

    const handleContinue = async (path) => {
        try {
            // Only mark as seen if it's NOT a login/register flow that handles it separately
            if (path !== '/(tabs)/profile') {
                await AsyncStorage.setItem('hasSeenWelcome', 'true');
            }
            router.replace(path);
        } catch (error) {
            console.error("Error saving welcome status:", error);
            router.replace(path);
        }
    };

    const handleSocialLogin = async (provider) => {
        if (provider === 'google') {
            try {
                await promptAsync();
            } catch (e) {
                console.error("Google Prompt Error:", e);
                Alert.alert("Error", "No se pudo iniciar Google Sign-In");
            }
        } else {
            // Facebook Mock (Still Simulation)
            try {
                const mockData = {
                    name: "Facebook User",
                    email: "user_fb@example.com",
                    facebookId: "mock_fb_67890",
                    avatar: "https://platform-lookaside.fbsbx.com/platform/profilepic/"
                };

                Alert.alert(
                    "Facebook Login",
                    "Simulación de Facebook (sin ID real). ¿Continuar?",
                    [
                        { text: "Cancel", style: "cancel" },
                        {
                            text: "Continuar",
                            onPress: async () => {
                                const data = await socialLogin(mockData);
                                login(data, data.token);
                                await AsyncStorage.setItem('hasSeenWelcome', 'true');
                                router.replace("/(tabs)");
                            }
                        }
                    ]
                );
            } catch (error) { console.error(error); }
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>CONECTA CON PRODUCTORES LOCALES</Text>

                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?q=80&w=2070&auto=format&fit=crop" }}
                        style={styles.heroImage}
                        resizeMode="cover"
                    />
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>CAMPO{"\n"}A{"\n"}MANO</Text>
                    </View>
                </View>

                <View style={styles.buttonContainer}>
                    {/* Email Button */}
                    <TouchableOpacity
                        style={styles.emailButton}
                        onPress={() => handleContinue('/(tabs)/profile')}
                    >
                        <Ionicons name="mail-outline" size={24} color="#3E7C1F" style={styles.icon} />
                        <Text style={styles.emailButtonText}>Registrarse con correo electrónico</Text>
                    </TouchableOpacity>

                    {/* Facebook Button */}
                    <TouchableOpacity
                        style={styles.facebookButton}
                        onPress={() => handleSocialLogin('facebook')}
                    >
                        <Ionicons name="logo-facebook" size={24} color="#FFF" style={styles.icon} />
                        <Text style={styles.socialButtonText}>Continuar con Facebook</Text>
                    </TouchableOpacity>

                    {/* Google Button */}
                    <TouchableOpacity
                        style={styles.googleButton}
                        onPress={() => handleSocialLogin('google')}
                    >
                        <Ionicons name="logo-google" size={24} color="#FFF" style={styles.icon} />
                        <Text style={styles.socialButtonText}>Continuar con correo Google</Text>
                    </TouchableOpacity>

                    {/* Guest Link */}
                    <TouchableOpacity
                        style={styles.guestButton}
                        onPress={() => handleContinue('/(tabs)')}
                    >
                        <Text style={styles.guestText}>Invitado</Text>
                    </TouchableOpacity>
                </View>
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
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 40,
    },
    title: {
        fontSize: 26,
        fontWeight: "900",
        color: "#003d33", // Dark green/teal
        textAlign: 'center',
        marginBottom: 30,
        lineHeight: 32,
        textTransform: 'uppercase'
    },
    imageContainer: {
        width: width - 40,
        height: 250,
        borderRadius: 30,
        overflow: 'hidden',
        marginBottom: 40,
        position: 'relative'
    },
    heroImage: {
        width: '100%',
        height: '100%',
    },
    badge: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        backgroundColor: '#FFF',
        width: 70,
        height: 70,
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#003d33'
    },
    buttonContainer: {
        width: '100%',
        gap: 15
    },
    emailButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFF',
        borderRadius: 25,
        paddingVertical: 15,
        borderWidth: 1,
        borderColor: '#3E7C1F',
        paddingHorizontal: 20
    },
    emailButtonText: {
        color: '#3E7C1F',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 10
    },
    facebookButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1877F2', // Facebook Blue
        borderRadius: 25,
        paddingVertical: 15,
    },
    googleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F4B400', // Google Yellow/Orange
        borderRadius: 25,
        paddingVertical: 15,
    },
    socialButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 10
    },
    guestButton: {
        marginTop: 10,
        alignItems: 'center',
        padding: 10
    },
    guestText: {
        color: '#666',
        fontSize: 16,
        fontWeight: '500'
    },
    icon: {
        // position: 'absolute', 
        // left: 20
        // Keeping styles clean as requested previously
    }
});
