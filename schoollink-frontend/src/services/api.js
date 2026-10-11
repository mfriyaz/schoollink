import axios from "axios";

import { API_BASE_URL } from "../config";

const api = axios.create({

    baseURL: API_BASE_URL,

    headers: {

        "Content-Type": "application/json"

    }

});

// Automatically attach JWT token
api.interceptors.request.use((config) => {

    const token = localStorage.getItem("token");

    if (token) {

        config.headers.Authorization = `Bearer ${token}`;

    }

    return config;

});

// A suspended / expired school is locked out by the server.
// Sign the user out and show why on the login page.
api.interceptors.response.use(
    (response) => response,
    (error) => {

        if (error.response?.data?.code === "SCHOOL_SUSPENDED") {

            try {
                sessionStorage.setItem("login_notice", error.response.data.message);
            } catch { /* ignore */ }

            localStorage.removeItem("token");
            localStorage.removeItem("user");

            if (window.location.pathname !== "/login") {
                window.location.href = "/login";
            }

        }

        return Promise.reject(error);

    }
);

export default api;
