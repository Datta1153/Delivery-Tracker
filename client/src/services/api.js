import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.PROD ? '/api' : 'http://localhost:5000/api',
});

// Interceptor to attach token
api.interceptors.request.use((config) => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
        const { token } = JSON.parse(userInfo);
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
