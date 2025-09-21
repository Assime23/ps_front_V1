import axios from 'axios';

// Configuration de base pour l'API
const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification aux requêtes
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les réponses et les erreurs
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Gestion des erreurs d'authentification
    if (error.response?.status === 401) {
      // Token expiré ou invalide
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('token_expiration');
      localStorage.removeItem('selectedCaisse');
      localStorage.removeItem('selectedCaisseLibelle');
      localStorage.removeItem('noteId');
      
      // Redirection vers la page de connexion sera gérée par le slice Redux
      window.location.href = '/';
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;