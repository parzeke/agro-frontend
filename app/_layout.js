import { Stack, useRouter, useSegments } from "expo-router";
import { ProductsProvider } from "../src/context/ProductsContext";
import { AuthProvider } from "../src/context/AuthContext";
import { FavoritesProvider } from "../src/context/FavoritesContext";
import { ChatProvider } from "../src/context/ChatContext";
import { useEffect, useState, useRef } from "react";
import { View, Text, Animated, StyleSheet, Dimensions } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RootLayout() {
  const [isShowSplash, setIsShowSplash] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const screenWidth = Dimensions.get('window').width;
  const slideAnim = useRef(new Animated.Value(screenWidth)).current;
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    // Check if user has seen welcome screen
    const checkWelcome = async () => {
      try {
        // ALWAYS SHOW WELCOME SCREEN FOR DEV
        router.replace('/welcome');
      } catch (e) {
        console.log("Error reading welcome status", e);
      } finally {
        setIsReady(true);
      }
    };

    // Wait 0.3 seconds, then slide the App in
    setTimeout(() => {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setIsShowSplash(false);
        checkWelcome();
      });
    }, 300);
  }, []);

  return (
    <AuthProvider>
      <FavoritesProvider>
        <ChatProvider>
          <ProductsProvider>
            <View style={{ flex: 1, backgroundColor: '#F8F3EF' }}>
              {isShowSplash && (
                <View style={styles.splashContainer}>
                  <Text style={styles.logoTextMain}>AgroApp</Text>
                </View>
              )}
              <Animated.View style={{ flex: 1, transform: [{ translateX: slideAnim }] }}>
                <Stack initialRouteName="(tabs)">
                  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                  <Stack.Screen name="welcome" options={{ headerShown: false }} />
                  <Stack.Screen name="auth" options={{ headerShown: false }} />
                  <Stack.Screen name="add-product" options={{ title: 'Agregar Producto' }} />
                  <Stack.Screen name="product/[id]" options={{ headerShown: false }} />
                  <Stack.Screen name="chat/[sellerId]" options={{ title: 'Chat' }} />
                  <Stack.Screen name="categories" options={{ headerShown: false }} />
                  <Stack.Screen name="product-success" options={{ headerShown: false }} />
                </Stack>
              </Animated.View>
            </View>
          </ProductsProvider>
        </ChatProvider>
      </FavoritesProvider>
    </AuthProvider>
  );


}

const styles = StyleSheet.create({
  splashContainer: {
    ...StyleSheet.absoluteFillObject, // Fill the screen
    backgroundColor: '#F8F3EF',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 0, // Behind the app
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoTextMain: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#000',
  },
  logoTextHighlight: {
    color: '#3E7C1F', // Green
  }
});
