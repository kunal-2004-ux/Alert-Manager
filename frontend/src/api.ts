import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/api',
    headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache'
    }
});

// Helper to set the auth token
export const setAuthToken = (token: string | null) => {
    if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete api.defaults.headers.common['Authorization'];
    }
};

export const getSummary = () => api.get('/dashboard/summary').then(res => res.data);
export const getTopDrivers = () => api.get('/dashboard/top-drivers').then(res => res.data);
export const getResolved = () => api.get('/dashboard/resolved').then(res => res.data);
export const getTrends = () => api.get('/dashboard/trends').then(res => res.data);
export const getEvents = () => api.get('/dashboard/events').then(res => res.data);
export const resolveAlert = (id: string) => api.patch(`/alerts/${id}/resolve`).then(res => res.data);
export const getAlertDetails = (id: string) => api.get(`/dashboard/alerts/${id}`).then(res => res.data);

export default api;
