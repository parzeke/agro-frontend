import React, { useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    Image,
    ActivityIndicator,
    Modal
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { sendMessage, getChatHistory, markMessagesAsRead, createReview } from "../api/api";

const StarRating = ({ rating, size = 20, onRate }) => {
    return (
        <View style={{ flexDirection: 'row', gap: 2 }}>
            {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                    key={star}
                    onPress={() => onRate && onRate(star)}
                    disabled={!onRate}
                >
                    <Ionicons
                        name={star <= rating ? "star" : "star-outline"}
                        size={size}
                        color={star <= rating ? "#FFD700" : "#ccc"}
                    />
                </TouchableOpacity>
            ))}
        </View>
    );
};

export default function ChatScreen() {
    const { sellerId, productId, productName, productImage } = useLocalSearchParams();
    const { user, token } = useAuth();
    const router = useRouter();
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState("");
    const [loading, setLoading] = useState(true);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [userRating, setUserRating] = useState(0);
    const [userComment, setUserComment] = useState("");
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);
    const flatListRef = useRef();

    useEffect(() => {
        loadHistory();
        const interval = setInterval(loadHistory, 5000); // Poll every 5 seconds
        return () => clearInterval(interval);
    }, [sellerId, productId]);

    const loadHistory = async () => {
        if (!user || !token) return;
        const history = await getChatHistory(sellerId, productId, token);
        setMessages(history);
        setLoading(false);

        if (sellerId && productId) {
            markMessagesAsRead(sellerId, productId, token);
        }
    };

    const handleSend = async () => {
        if (!inputText.trim() || !user || !token) return;

        const messageData = {
            receiver: sellerId,
            product: productId,
            content: inputText.trim()
        };

        setInputText("");

        try {
            const newMsg = await sendMessage(messageData, token);
            setMessages(prev => [...prev, newMsg]);
            setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
        } catch (error) {
            console.error("Send failed:", error);
        }
    };

    const handleReviewSubmit = async () => {
        if (userRating === 0) {
            alert("Por favor elige una puntuación");
            return;
        }

        setIsSubmittingReview(true);
        try {
            await createReview({
                reviewee: sellerId,
                rating: userRating,
                comment: userComment
            }, token);

            setUserRating(0);
            setUserComment("");
            setShowReviewModal(false);
            alert("Reseña enviada con éxito");
        } catch (error) {
            console.error("Failed to submit review:", error);
            alert(error.response?.data?.message || "Error al enviar la reseña");
        } finally {
            setIsSubmittingReview(false);
        }
    };

    const renderMessage = ({ item }) => {
        const currentId = user.id || user._id;
        const senderId = item.sender?._id || item.sender?.id || item.sender;
        const isMe = senderId?.toString() === currentId?.toString();
        return (
            <View style={[
                styles.messageBubble,
                isMe ? styles.myMessage : styles.theirMessage
            ]}>
                <Text style={[
                    styles.messageText,
                    isMe ? styles.myMessageText : styles.theirMessageText
                ]}>
                    {item.content}
                </Text>
                <Text style={styles.timestamp}>
                    {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
            </View>
        );
    };

    return (
        <>
            <Stack.Screen
                options={{
                    headerRight: () => (
                        <TouchableOpacity
                            onPress={() => setShowReviewModal(true)}
                            style={{ marginRight: 15 }}
                        >
                            <Ionicons name="star-outline" size={24} color="#00A650" />
                        </TouchableOpacity>
                    )
                }}
            />
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 100}
                style={styles.keyboardView}
            >
                {loading ? (
                    <ActivityIndicator size="large" color="#00A650" style={{ flex: 1 }} />
                ) : (
                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        renderItem={renderMessage}
                        keyExtractor={item => item._id}
                        contentContainerStyle={styles.listContent}
                        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
                        keyboardShouldPersistTaps="handled"
                    />
                )}

                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Escribe un mensaje..."
                        value={inputText}
                        onChangeText={setInputText}
                        multiline
                    />
                    <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
                        <Ionicons name="send" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>

            <Modal
                visible={showReviewModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowReviewModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Calificar Usuario</Text>
                        <StarRating rating={userRating} onRate={setUserRating} size={40} />
                        <TextInput
                            style={styles.commentInput}
                            placeholder="Escribe tu opinión (opcional)"
                            value={userComment}
                            onChangeText={setUserComment}
                            multiline
                            numberOfLines={3}
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => {
                                    setShowReviewModal(false);
                                    setUserRating(0);
                                    setUserComment("");
                                }}
                            >
                                <Text style={styles.cancelButtonText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.submitButton]}
                                onPress={handleReviewSubmit}
                                disabled={isSubmittingReview}
                            >
                                {isSubmittingReview ? (
                                    <ActivityIndicator color="#fff" size="small" />
                                ) : (
                                    <Text style={styles.submitButtonText}>Enviar</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8F3EF",
    },
    keyboardView: {
        flex: 1,
    },
    listContent: {
        padding: 15,
        paddingBottom: 20,
    },
    messageBubble: {
        maxWidth: "80%",
        padding: 12,
        borderRadius: 20,
        marginBottom: 10,
        elevation: 1,
    },
    myMessage: {
        alignSelf: "flex-end",
        backgroundColor: "#00A650",
        borderBottomRightRadius: 2,
    },
    theirMessage: {
        alignSelf: "flex-start",
        backgroundColor: "#fff",
        borderBottomLeftRadius: 2,
    },
    messageText: {
        fontSize: 16,
    },
    myMessageText: {
        color: "#fff",
    },
    theirMessageText: {
        color: "#333",
    },
    timestamp: {
        fontSize: 10,
        color: "rgba(0,0,0,0.4)",
        alignSelf: "flex-end",
        marginTop: 4,
    },
    inputContainer: {
        flexDirection: "row",
        padding: 10,
        backgroundColor: "#fff",
        alignItems: "center",
        borderTopWidth: 1,
        borderTopColor: "#EEE",
    },
    input: {
        flex: 1,
        backgroundColor: "#F0F0F0",
        borderRadius: 25,
        paddingHorizontal: 15,
        paddingVertical: 8,
        marginRight: 10,
        maxHeight: 100,
    },
    sendButton: {
        backgroundColor: "#00A650",
        width: 45,
        height: 45,
        borderRadius: 22.5,
        justifyContent: "center",
        alignItems: "center",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    modalContent: {
        backgroundColor: '#fff',
        padding: 30,
        borderRadius: 20,
        alignItems: 'center',
        width: '80%'
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333'
    },
    commentInput: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        padding: 12,
        marginTop: 15,
        marginBottom: 5,
        minHeight: 80,
        textAlignVertical: 'top',
        backgroundColor: '#F8F8F8'
    },
    modalButtons: {
        flexDirection: 'row',
        marginTop: 25,
        gap: 15
    },
    modalButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center'
    },
    cancelButton: {
        backgroundColor: '#E0E0E0'
    },
    submitButton: {
        backgroundColor: '#00A650'
    },
    cancelButtonText: {
        color: '#666',
        fontWeight: 'bold'
    },
    submitButtonText: {
        color: '#fff',
        fontWeight: 'bold'
    }
});
