import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    SafeAreaView,
    ActivityIndicator,
    Platform
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { useChat } from "../context/ChatContext";
import { getUserConversations } from "../api/api";
import AuthForm from "../components/AuthForm";

export default function MessagesScreen() {
    const { token, user } = useAuth();
    const { clearMessageNotification, checkMessages } = useChat();
    const router = useRouter();
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        React.useCallback(() => {
            if (token) {
                loadConversations();
                clearMessageNotification();
            }
        }, [token])
    );

    const loadConversations = async () => {
        try {
            const data = await getUserConversations(token);
            console.log("CONVERSATIONS DATA:", data.length);

            // Group by conversation (product + other user)
            const groups = {};
            data.forEach(msg => {
                const currentId = user.id || user._id;
                const senderId = msg.sender?._id || msg.sender?.id || msg.sender;
                const receiverId = msg.receiver?._id || msg.receiver?.id || msg.receiver;

                // Determine who is the "other" person
                const isSenderMe = senderId.toString() === currentId.toString();
                const otherUser = isSenderMe ? msg.receiver : msg.sender;

                if (!otherUser) return;

                const otherId = otherUser._id || otherUser.id;
                const prodId = msg.product?._id || msg.product?.id || msg.product;

                if (!otherId || !prodId) return;

                const key = `${prodId}_${otherId}`;

                // Keep only the most recent message for each group
                if (!groups[key]) {
                    groups[key] = {
                        id: key,
                        product: msg.product,
                        otherUser: otherUser,
                        lastMessage: msg.content,
                        timestamp: msg.createdAt,
                        read: msg.read
                    };
                }
            });

            setConversations(Object.values(groups));
        } catch (error) {
            console.error("Load conversations failed:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return <AuthForm />;
    }

    const renderConversation = ({ item }) => (
        <TouchableOpacity
            style={styles.convoCard}
            onPress={() => router.push({
                pathname: `/chat/${item.otherUser._id || item.otherUser.id}`,
                params: {
                    productId: item.product?._id || item.product?.id,
                    productName: item.product?.name,
                    productImage: item.product?.image
                }
            })}
        >
            <Image
                source={{ uri: item.product?.image || "https://via.placeholder.com/100" }}
                style={styles.productThumb}
            />
            <View style={styles.convoInfo}>
                <View style={styles.convoHeader}>
                    <Text style={styles.userName}>{item.otherUser.name}</Text>
                    <Text style={styles.timeText}>
                        {new Date(item.timestamp).toLocaleDateString()}
                    </Text>
                </View>
                <Text style={styles.productName}>{item.product?.name || "Producto"}</Text>
                <Text style={styles.lastMsg} numberOfLines={1}>{item.lastMessage}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CCC" />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Mis Mensajes</Text>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#00A650" style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={conversations}
                    renderItem={renderConversation}
                    keyExtractor={item => item.id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="chatbubbles-outline" size={80} color="#EEE" />
                            <Text style={styles.empty}>No tienes mensajes aún.</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8F3EF",
        paddingTop: Platform.OS === 'android' ? 40 : 0
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0'
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333'
    },
    list: {
        padding: 10,
    },
    convoCard: {
        flexDirection: "row",
        alignItems: "center",
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#F5F5F5",
    },
    productThumb: {
        width: 60,
        height: 60,
        borderRadius: 12,
        marginRight: 15,
        backgroundColor: '#F8F9FA'
    },
    convoInfo: {
        flex: 1,
    },
    convoHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 2,
    },
    userName: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#2E3A59",
    },
    timeText: {
        fontSize: 12,
        color: "#A2AABB",
    },
    productName: {
        fontSize: 13,
        color: "#00A650",
        fontWeight: "600",
        marginBottom: 2,
    },
    lastMsg: {
        fontSize: 14,
        color: "#666",
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 100,
    },
    empty: {
        textAlign: "center",
        marginTop: 20,
        color: "#999",
        fontSize: 16,
    }
});
