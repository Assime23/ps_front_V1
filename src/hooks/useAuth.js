import { useSelector, useDispatch } from 'react-redux';
import {
  loginUser,
  logoutUser,
  clearError,
  selectUser,
  selectIsAuthenticated,
  selectIsLoading,
  selectError,
  selectCaisse,
} from '../store/slices/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);
  const caisse = useSelector(selectCaisse);

  const login = (credentials) => dispatch(loginUser(credentials));
  const logout = () => dispatch(logoutUser());
  const clearAuthError = () => dispatch(clearError());

  const isTokenValid = () => {
    const tokenExpiration = localStorage.getItem('token_expiration');
    return tokenExpiration && Date.now() < parseInt(tokenExpiration);
  };

  const getToken = () => localStorage.getItem('token');

  const hasRole = (role) => user?.type === role;

  return {
    // État
    user,
    isAuthenticated,
    isLoading,
    error,
    caisse,
    
    // Actions
    login,
    logout,
    clearAuthError,
    
    // Utilitaires
    isTokenValid,
    getToken,
    hasRole,
  };
};

export default useAuth;