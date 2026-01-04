import api from "./axios.api";


export const getPurchases = () => api.get("/purchases");
export const createPurchase = (data) => api.post("/purchases", data);