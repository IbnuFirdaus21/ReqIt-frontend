import { API_BASE_URL } from '../constants';

// Helper internal
const post = async (endpoint, body, isFormData = false) => {
    const options = {
        method: 'POST',
        body: isFormData ? body : JSON.stringify(body),
    };
    if (!isFormData) {
        options.headers = { 'Content-Type': 'application/json' };
    }
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Request gagal');
    return data;
};

const get = async (endpoint) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Request gagal');
    return data;
};

// Auth
export const loginUser = (email, password) =>
    post('/api/auth/login', { email, password });

export const registerUser = ({ email, nis, password, hasAllergy, allergiesDetails }) =>
    post('/api/auth/register', { email, nis, password, hasAllergy, allergiesDetails });

// Menu
export const fetchTodayMenu = () =>
    get('/api/menus/today');

export const uploadMenu = (formData) =>
    post('/api/menus', formData, true);

// Request
export const sendRequest = (userId, menuName) =>
    post('/api/requests', { userId, menuName });

export const fetchRequestsSummary = () =>
    get('/api/requests/summary');

// Rating
export const sendRating = (userId, menuId, rating, comment) =>
    post('/api/ratings', { userId, menuId, rating, comment });

export const fetchRatings = () =>
    get('/api/ratings');

// Feedback
export const sendFeedback = (userId, message) =>
    post('/api/feedbacks', { userId, message });

export const fetchFeedbacks = () =>
    get('/api/feedbacks');

// Allergy
export const fetchAllergySummary = () =>
    get('/api/allergies/summary');

// Chatbot
export const sendChatMessage = (userInput) =>
    post('/api/chatbot', { userInput });
