import React, { createContext, useState, useContext, useEffect } from 'react';
import { getProducts, createProduct, updateProduct } from "../api/api";

const ProductsContext = createContext();

export const useProducts = () => useContext(ProductsContext);

export const ProductsProvider = ({ children }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchProducts = async (categoryId = 'all') => {
        setLoading(true);
        const data = await getProducts(categoryId);
        setProducts(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const addProduct = async (newProduct) => {
        try {
            const created = await createProduct(newProduct);
            setProducts((prev) => [created, ...prev]);
        } catch (e) {
            alert("Error al crear producto");
            throw e;
        }
    };

    const editProduct = async (id, updatedData) => {
        try {
            const updated = await updateProduct(id, updatedData);
            setProducts((prev) => prev.map(p => p._id === id ? updated : p));
        } catch (e) {
            alert("Error al actualizar producto");
            throw e;
        }
    };

    return (
        <ProductsContext.Provider value={{ products, fetchProducts, addProduct, editProduct, loading }}>
            {children}
        </ProductsContext.Provider>
    );
};
