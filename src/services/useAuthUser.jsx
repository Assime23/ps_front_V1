// Wrapper de compatibilité pour l'ancien useAuthUser
import { useAuth } from '../hooks/useAuth';
import apiClient from '../api/apiClient';

const useAuthUser = () => {
  const { user, getToken, logout, isTokenValid } = useAuth();

  const fetchData = async (method, url, data) => {
    const response = await apiClient[method](url, {
      params: method === 'get' ? data : undefined,
      data: method !== 'get' ? data : undefined,
    });
    return response;
  };

  const getCaisse = () => {
    const caisseId = localStorage.getItem('selectedCaisse');
    return caisseId ? { caisseId } : null;
  };

  const getUser = () => {
    const userString = localStorage.getItem('user');
    return userString ? JSON.parse(userString) : null;
  };

  return {
    token: getToken(),
    user,
    expirationTime: localStorage.getItem('token_expiration'),
    logout,
    isTokenValid,
    getCaisse,
    getToken,
    getUser,
    fetchData,
    http: apiClient,
  };
};

export default useAuthUser;
