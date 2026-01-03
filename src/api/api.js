import axios from "axios";

// Use your machine's IP address. Localhost (10.0.2.2 for Android Emulator)
const API_URL = "http://192.168.1.8:5000/api";

export const getProducts = async (categoryId = 'all', sellerId = null) => {
  try {
    let url = `${API_URL}/products?t=${Date.now()}`;
    if (categoryId !== 'all') url += `&category=${categoryId}`;
    if (sellerId) url += `&seller=${sellerId}`;

    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching products:", error.message);
    return [];
  }
};

export const getCategories = async () => {
  try {
    const response = await axios.get(`${API_URL}/categories?t=${Date.now()}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching categories:", error.message);
    return [];
  }
};

export const createCategory = async (categoryData) => {
  try {
    const response = await axios.post(`${API_URL}/categories`, categoryData);
    return response.data;
  } catch (error) {
    console.error("Error creating category:", error.message);
    throw error;
  }
};

export const updateCategory = async (id, categoryData) => {
  try {
    const response = await axios.put(`${API_URL}/categories/${id}`, categoryData);
    return response.data;
  } catch (error) {
    console.error("Error updating category:", error.message);
    throw error;
  }
};

export const updateProduct = async (id, productData) => {
  try {
    const response = await axios.put(`${API_URL}/products/${id}`, productData);
    return response.data;
  } catch (error) {
    console.error("Error updating product:", error.message);
    throw error;
  }
};

export const deleteCategory = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/categories/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting category:", error.message);
    throw error;
  }
};

export const createProduct = async (productData) => {
  try {
    const response = await axios.post(`${API_URL}/products`, productData);
    return response.data;
  } catch (error) {
    console.error("Error creating product API:", error.response?.data || error.message);
    throw error;
  }
};

export const registerUser = async (userData) => {
  try {
    // Expects { name, phone, password }
    const response = await axios.post(`${API_URL}/auth/register`, userData);
    return response.data;
  } catch (error) {
    console.error("Register Error:", error.response?.data?.message || error.message);
    throw error;
  }
};

export const loginUser = async (credentials) => {
  try {
    // Expects { phone, password }
    const response = await axios.post(`${API_URL}/auth/login`, credentials);
    return response.data; // Returns { token, user }

  } catch (error) {
    console.error("Login Error:", error.response?.data?.message || error.message);
    throw error;
  }
};

export const socialLogin = async (socialData) => {
  try {
    // Expects { email, name, googleId, facebookId, avatar }
    const response = await axios.post(`${API_URL}/auth/social-login`, socialData);
    return response.data;
  } catch (error) {
    console.error("Social Login Error:", error.response?.data?.message || error.message);
    throw error;
  }
};

export const getProductById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/products/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching product details:", error.message);
    return null;
  }
};

// Chat APIs
export const sendMessage = async (messageData, token) => {
  try {
    const response = await axios.post(`${API_URL}/chat/send`, messageData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error("Error sending message:", error.message);
    throw error;
  }
};

export const getChatHistory = async (userId, productId, token) => {
  try {
    const response = await axios.get(`${API_URL}/chat/history/${userId}/${productId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching chat history:", error.message);
    return [];
  }
};

export const getUserConversations = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/chat/conversations`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching conversations:", error.message);
    return [];
  }
};

export const markMessagesAsRead = async (userId, productId, token) => {
  try {
    await axios.put(`${API_URL}/chat/read/${userId}/${productId}`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
  } catch (error) {
    console.error("Error marking messages as read:", error.message);
  }
};

export const getUserById = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user by id:", error.message);
    throw error;
  }
};

export const updateProfileImage = async (imageUri, token) => {
  try {
    const formData = new FormData();
    const filename = imageUri.split('/').pop();
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image`;

    formData.append('image', {
      uri: imageUri,
      name: filename,
      type
    });

    const response = await axios.put(`${API_URL}/auth/profile-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`
      }
    });

    return response.data;
  } catch (error) {
    console.error("Error updating profile image:", error.response?.data?.message || error.message);
    throw error;
  }
};

export const updateProfile = async (updateData, token) => {
  try {
    const response = await axios.put(`${API_URL}/auth/profile`, updateData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error("Error updating profile:", error.response?.data?.message || error.message);
    throw error;
  }
};

export const createReview = async (reviewData, token) => {
  try {
    const response = await axios.post(`${API_URL}/reviews`, reviewData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error("Error creating review:", error.message);
    throw error;
  }
};

export const getUserReviews = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/reviews/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user reviews:", error.message);
    return [];
  }
};

export const getUsersWithLocation = async () => {
  try {
    const response = await axios.get(`${API_URL}/users/with-location?t=${Date.now()}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching users with location:", error.message);
    return [];
  }
};
