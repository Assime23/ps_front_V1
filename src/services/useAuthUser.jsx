import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useState, useCallback } from 'react';

const useAuthUser = () => {
    const [token, setToken] = useState(localStorage.getItem('token') || '');
    const [user, setUser] = useState(() => {
        try {
            const userString = localStorage.getItem('user');
            return userString ? JSON.parse(userString) : null;
        } catch (error) {
            console.error('Error parsing user data from localStorage:', error);
            return null;
        }
    });
    const [expirationTime, setExpirationTime] = useState(localStorage.getItem('token_expiration') || null);
    const navigate = useNavigate();

    // Créer une instance Axios
    const http = axios.create({
        baseURL: "https://api1.psmyservices.com/api/health",
        headers: {
            "Content-type": "application/json",
        }
    });

    // Récupère le token depuis le localStorage (mémorisé avec useCallback)
    const getToken = useCallback(() => localStorage.getItem('token'), []);

    // Récupère l'utilisateur depuis le localStorage (mémorisé avec useCallback)
    const getUser = useCallback(() => {
        try {
            const userString = localStorage.getItem('user');
            return userString ? JSON.parse(userString) : null;
        } catch (error) {
            console.error('Error parsing user data from localStorage:', error);
            return null;
        }
    }, []);

    // Sauvegarder le token, l'utilisateur et l'expiration dans le localStorage
    const saveToken = useCallback((user, token, expiresIn) => {
        const expiration = Date.now() + expiresIn * 1000;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token_expiration', expiration);
        setToken(token);
        setUser(user);
        setExpirationTime(expiration);
        navigate(user.type === 'admin' ? '/ad' : '/ag');
    }, [ setExpirationTime]);

    // Vérifie si le token est valide
    const isTokenValid = useCallback(() => {
        if (!token) return false;
        const expiration = localStorage.getItem('token_expiration');
        return expiration && Date.now() < expiration;
    }, [token]);

    // Récupère les informations de la caisse depuis le localStorage
    const getCaisse = useCallback(() => {
        try {
            const caisseId = localStorage.getItem('selectedCaisse');
            if (caisseId) {
                return { caisseId };
            } else {
                return null;
            }
        } catch (error) {
            console.error('Error retrieving caisse from localStorage:', error);
            return null;
        }
    }, []);

    // Rafraîchir le token lorsque celui-ci est proche de l'expiration
 /*   const refreshToken = useCallback(async () => {
        try {
            const storedToken = getToken();
            const response = await http.post('/refresh', {}, {
                headers: {
                    'Authorization': `Bearer ${storedToken}`
                }
            });
            const { access_token, expires_in } = response.data;
            saveToken(user, access_token, expires_in);
        } catch (error) {
            console.error('Error refreshing token:', error);
        }
    }, [getToken, http, saveToken, user]);
*/
    // Fonction de login
    const login = async (credentials) => {
        try {
            const response = await http.post('/login', credentials);
            const { access_token, token_type, expires_in } = response.data;
            const userResponse = await http.post('/me', {}, {
                headers: {
                    Authorization: `${token_type} ${access_token}`
                }
            });
            const user = userResponse.data;

            // Récupérer les informations de la caisse courante
            try {
                const caisseResponse = await http.get('/ma-caisse', {
                    headers: {
                        Authorization: `${token_type} ${access_token}`
                    }
                });
                const { caisse_id, libelle, noteId } = caisseResponse.data;
                localStorage.setItem('selectedCaisse', caisse_id);
                localStorage.setItem('selectedCaisseLibelle', libelle);
                localStorage.setItem('noteId', noteId);
            } catch (caisseError) {
                console.error('Error fetching caisse courante:', caisseError);
            }

            saveToken(user, access_token, expires_in);
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };
   // Intercepteur pour gérer les erreurs 401
   http.interceptors.response.use(
        response => response,
        error => {
            if (error.response?.status === 401) {
                // Token expiré ou invalide
                navigate('/', { replace: true });  // Rediriger vers la page de connexion
            }
            return Promise.reject(error);
        }
    );

    /* const getAuthHeaders = () => ({
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });*/

      const fetchData = async (method, url, data) => {
        try {
            const response = await http[method](url, {
                params: method === 'get' ? data : undefined, // Utiliser params seulement pour GET
                data: method !== 'get' ? data : undefined,   // Utiliser data seulement pour POST
                headers: {
                    'Authorization': `Bearer ${getToken()}`,
                },
            });
            return response;
        } catch (error) {
            console.error(`Erreur lors de l'appel à ${method} ${url}:`, error);
            throw error; // Propager l'erreur si nécessaire
        }
    };
    
    // Déconnexion
    const logout = useCallback(async () => {
        try {
            const storedToken = getToken();
            if (!storedToken) return;
            const response = await http.post('/logout', {}, {
                headers: {
                    'Authorization': `Bearer ${storedToken}`
                }
            });
            if (response.status === 200) {
                localStorage.clear(); // Efface toutes les données utilisateur
                setToken('');
                setUser(null);
                setExpirationTime(null);
                navigate('/');
            }
        } catch (error) {
            console.error('Logout error:', error);
        }
    }, [getToken, http, navigate,setExpirationTime]);

    return {
        setToken: saveToken,
        token,
        user,
        getToken,
        getUser,
        http,
        login,
        logout,
        isTokenValid,
        getCaisse,
        fetchData
    };
};

export default useAuthUser;

