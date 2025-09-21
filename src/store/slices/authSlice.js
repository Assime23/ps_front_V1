import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../api/authService';

// États initial
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  caisse: null,
  abilities: [],
};

// Thunks asynchrones pour les actions d'authentification
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Erreur de connexion'
      );
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      return {};
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Erreur de déconnexion'
      );
    }
  }
);

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.refreshToken();
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Erreur de rafraîchissement du token'
      );
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const user = await authService.getCurrentUser();
      return user;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Erreur lors de la récupération des données utilisateur'
      );
    }
  }
);

export const getCurrentCaisse = createAsyncThunk(
  'auth/getCurrentCaisse',
  async (_, { rejectWithValue }) => {
    try {
      const caisse = await authService.getCurrentCaisse();
      return caisse;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Erreur lors de la récupération des données de caisse'
      );
    }
  }
);

// Slice d'authentification
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Action pour nettoyer les erreurs
    clearError: (state) => {
      state.error = null;
    },
    // Action pour définir la caisse sélectionnée
    setCaisse: (state, action) => {
      state.caisse = action.payload;
    },
    // Action pour mettre à jour les abilities/permissions
    setAbilities: (state, action) => {
      state.abilities = action.payload;
    },
    // Action pour initialiser l'état depuis le localStorage
    initializeAuth: (state) => {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      const tokenExpiration = localStorage.getItem('token_expiration');
      const selectedCaisse = localStorage.getItem('selectedCaisse');
      const selectedCaisseLibelle = localStorage.getItem('selectedCaisseLibelle');
      const noteId = localStorage.getItem('noteId');

      if (token && user && tokenExpiration) {
        const isTokenValid = Date.now() < parseInt(tokenExpiration);
        if (isTokenValid) {
          state.token = token;
          state.user = JSON.parse(user);
          state.isAuthenticated = true;
          
          if (selectedCaisse) {
            state.caisse = {
              caisse_id: selectedCaisse,
              libelle: selectedCaisseLibelle,
              noteId: noteId
            };
          }
        } else {
          // Token expiré, nettoyer le localStorage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('token_expiration');
          localStorage.removeItem('selectedCaisse');
          localStorage.removeItem('selectedCaisseLibelle');
          localStorage.removeItem('noteId');
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Connexion
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.caisse = action.payload.caisse;
        state.error = null;

        // Sauvegarder dans le localStorage
        const expiration = Date.now() + action.payload.expiresIn * 1000;
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('user', JSON.stringify(action.payload.user));
        localStorage.setItem('token_expiration', expiration.toString());
        
        if (action.payload.caisse) {
          localStorage.setItem('selectedCaisse', action.payload.caisse.caisse_id);
          localStorage.setItem('selectedCaisseLibelle', action.payload.caisse.libelle);
          localStorage.setItem('noteId', action.payload.caisse.noteId);
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.caisse = null;
      })
      
      // Déconnexion
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.caisse = null;
        state.abilities = [];
        state.error = null;

        // Nettoyer le localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('token_expiration');
        localStorage.removeItem('selectedCaisse');
        localStorage.removeItem('selectedCaisseLibelle');
        localStorage.removeItem('noteId');
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        // Même en cas d'erreur, on déconnecte l'utilisateur localement
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.caisse = null;
        localStorage.clear();
      })
      
      // Rafraîchissement du token
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.token = action.payload.token;
        const expiration = Date.now() + action.payload.expiresIn * 1000;
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('token_expiration', expiration.toString());
      })
      
      // Récupération des données utilisateur
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
        localStorage.setItem('user', JSON.stringify(action.payload));
      })
      
      // Récupération des données de caisse
      .addCase(getCurrentCaisse.fulfilled, (state, action) => {
        state.caisse = action.payload;
        localStorage.setItem('selectedCaisse', action.payload.caisse_id);
        localStorage.setItem('selectedCaisseLibelle', action.payload.libelle);
        localStorage.setItem('noteId', action.payload.noteId);
      });
  },
});

// Export des actions
export const { clearError, setCaisse, setAbilities, initializeAuth } = authSlice.actions;

// Sélecteurs
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectIsLoading = (state) => state.auth.isLoading;
export const selectError = (state) => state.auth.error;
export const selectCaisse = (state) => state.auth.caisse;
export const selectAbilities = (state) => state.auth.abilities;

// Export du reducer
export default authSlice.reducer;