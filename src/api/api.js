import axios from "axios";

const API_URL = "http://192.168.1.8:5000/api";


export const getProducts = async () => {
  try {
    const response = await axios.get(`${API_URL}/products`);
    return response.data; // Retorna lista de productos
  } catch (error) {
    console.error("Error al obtener productos:", error.message);
    return [];
  }
};