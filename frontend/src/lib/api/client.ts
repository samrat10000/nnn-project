import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000',
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = localStorage.getItem('refreshToken');

            if (refreshToken) {
                try {
                    const res = await axios.post('http://localhost:3000/auth/refresh', {
                        refresh_token: refreshToken,
                    });

                    if (res.data.access_token) {
                        localStorage.setItem('token', res.data.access_token);
                        if (res.data.refresh_token) {
                            localStorage.setItem('refreshToken', res.data.refresh_token);
                        }

                        api.defaults.headers.common['Authorization'] = `Bearer ${res.data.access_token}`;
                        originalRequest.headers['Authorization'] = `Bearer ${res.data.access_token}`;

                        return api(originalRequest);
                    }
                } catch (refreshError) {
                    // Refresh failed - logout
                    console.error('Refresh token expired', refreshError);
                    localStorage.removeItem('token');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                }
            } else {
                // No refresh token available
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
