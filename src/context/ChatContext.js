import React, { createContext, useState, useContext, useEffect } from 'react';
import { getUserConversations } from '../api/api';
import { useAuth } from './AuthContext';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const { token, user } = useAuth();
    const [hasNewMessage, setHasNewMessage] = useState(false);
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(false);

    const checkMessages = async () => {
        if (!token || !user) return;

        try {
            const data = await getUserConversations(token);
            setConversations(data);

            // Check if there are any unread messages where the user is the receiver
            const currentId = user.id || user._id;
            const unread = data.some(msg => {
                const receiverId = msg.receiver?._id || msg.receiver?.id || msg.receiver;
                return !msg.read && (receiverId?.toString() === currentId?.toString());
            });
            setHasNewMessage(unread);
        } catch (error) {
            console.error("Checking messages failed:", error);
        }
    };

    useEffect(() => {
        if (token) {
            checkMessages();
            const interval = setInterval(checkMessages, 10000); // Poll every 10 seconds
            return () => clearInterval(interval);
        }
    }, [token]);

    const clearMessageNotification = () => {
        setHasNewMessage(false);
    };

    return (
        <ChatContext.Provider value={{
            hasNewMessage,
            conversations,
            checkMessages,
            clearMessageNotification,
            loading
        }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => useContext(ChatContext);
