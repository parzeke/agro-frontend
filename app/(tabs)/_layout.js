import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import { useFavorites } from '../../src/context/FavoritesContext';
import { useChat } from '../../src/context/ChatContext';
import { Pressable, View } from 'react-native';

export default function TabLayout() {
    const { user } = useAuth();
    const { hasNewFavorite } = useFavorites();
    const { hasNewMessage } = useChat();

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: '#3E7C1F',
                tabBarInactiveTintColor: "gray",
                headerShown: false,
                tabBarButton: (props) => {
                    const [isCustomPressed, setIsCustomPressed] = React.useState(false);
                    return (
                        <Pressable
                            {...props}
                            onPressIn={() => setIsCustomPressed(true)}
                            onPressOut={() => {
                                setTimeout(() => setIsCustomPressed(false), 150);
                            }}
                            android_ripple={{ color: 'rgba(62, 124, 31, 0.1)', borderless: true }}
                            style={[
                                props.style,
                                {
                                    backgroundColor: isCustomPressed ? 'rgba(62, 124, 31, 0.1)' : 'transparent',
                                }
                            ]}
                        />
                    );
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Inicio",
                    tabBarIcon: ({ color }) => (
                        <Ionicons name="home-outline" size={24} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="explore"
                options={{
                    title: "Explorar",
                    tabBarIcon: ({ color }) => (
                        <Ionicons name="compass-outline" size={24} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="favorites"
                options={{
                    title: 'Favoritos',
                    tabBarIcon: ({ color }) => <Ionicons name="heart" size={24} color={color} />,
                    tabBarBadge: hasNewFavorite ? "" : null,
                    tabBarBadgeStyle: {
                        backgroundColor: '#00A650', // Match the vibrant green
                        minWidth: 10,
                        height: 10,
                        borderRadius: 5,
                        marginTop: 4
                    }
                }}
            />
            <Tabs.Screen
                name="messages"
                options={{
                    title: "Mensajes",
                    tabBarIcon: ({ color }) => (
                        <Ionicons name="chatbubble-outline" size={24} color={color} />
                    ),
                    tabBarBadge: hasNewMessage ? "" : null,
                    tabBarBadgeStyle: {
                        backgroundColor: '#00A650',
                        minWidth: 10,
                        height: 10,
                        borderRadius: 5,
                        marginTop: 4
                    }
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: "Perfil",
                    tabBarIcon: ({ color }) => (
                        <Ionicons name="person-outline" size={24} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
