import axios from 'axios';

/**
 * Axios instance pre-configured to call the Spring Boot backend.
 * Base URL can be overridden via NEXT_PUBLIC_API_URL environment variable.
 */
const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

export default api;
