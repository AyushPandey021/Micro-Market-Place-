import api from "./api";

const basePath = "/ai-buddy";

export const processQuery = (query, token = null) => {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    return api.post(`${basePath}/process`, { query }, config);
};

export const askBuddy = (query, autoAddToCart = false, token = null) => {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    return api.post(`${basePath}/ask`, { query, autoAddToCart }, config);
};


export const searchProductsByQuery  = (query, token = null) => {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    return api.post(`${basePath}/search`, { query }, config);
};

export const parseQuery = (query) => {
    return api.post(`${basePath}/parse`, { query });
};

export const searchProducts = (filters, token = null) => {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    return api.post(`${basePath}/tools/search_products`, { filters }, config);
};

export const addToCart = (productId, quantity = 1, token = null) => {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    return api.post(`${basePath}/tools/add_to_cart`, { productId, quantity }, config);
};

export const createCart = (token = null) => {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    return api.post(`${basePath}/tools/create_cart`, {}, config);
};

export const addSingleProductToCart = (productId, quantity = 1, token = null) => {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    return api.post(`${basePath}/cart/add-single`, { productId, quantity }, config);
};

export const addProductsToCart = (productIds, quantities = {}) => {
    return api.post(`${basePath}/cart/add`, { productIds, quantities });
};

export const getCart = (token = null) => {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    return api.get(`${basePath}/cart`, config);
};

