import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FavoritesContext = createContext();

export const useFavorites = () => useContext(FavoritesContext);

export const FavoritesProvider = ({ children }) => {
    const [favorites, setFavorites] = useState([]);
    const [hasNewFavorite, setHasNewFavorite] = useState(false);

    // Load favorites on mount
    useEffect(() => {
        loadFavorites();
    }, []);

    const loadFavorites = async () => {
        try {
            const stored = await AsyncStorage.getItem('favorites');
            if (stored) {
                setFavorites(JSON.parse(stored));
            }
        } catch (e) {
            console.error("Failed to load favorites", e);
        }
    };

    const toggleFavorite = async (product) => {
        setFavorites((prev) => {
            const exists = prev.find((p) => p._id === product._id);
            let newFavorites;
            if (exists) {
                // Remove
                newFavorites = prev.filter((p) => p._id !== product._id);
            } else {
                // Add
                newFavorites = [...prev, product];
                setHasNewFavorite(true); // Triggers the green dot
            }
            // Save to storage
            AsyncStorage.setItem('favorites', JSON.stringify(newFavorites));
            return newFavorites;
        });
    };

    const clearNewFavoriteNotification = () => {
        setHasNewFavorite(false);
    };

    const isFavorite = (productId) => {
        return favorites.some((p) => p._id === productId);
    };

    return (
        <FavoritesContext.Provider value={{
            favorites,
            toggleFavorite,
            isFavorite,
            hasNewFavorite,
            clearNewFavoriteNotification
        }}>
            {children}
        </FavoritesContext.Provider>
    );
};
