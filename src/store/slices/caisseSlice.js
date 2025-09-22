import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../api/apiClient';

// Actions asynchrones pour la gestion des caisses
export const selectCaisse = createAsyncThunk(
  'caisse/select',
  async ({ caisseId, caisseLibelle }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/select-caisse', {
        caisse_id: caisseId
      });
      
      // Sauvegarder dans localStorage
      localStorage.setItem('selectedCaisse', caisseId);
      localStorage.setItem('selectedCaisseLibelle', caisseLibelle);
      localStorage.setItem('noteId', response.data.note_id);
      
      return {
        caisseId,
        caisseLibelle,
        noteId: response.data.note_id,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Erreur lors de la sélection de caisse'
      );
    }
  }
);

export const descendreCaisse = createAsyncThunk(
  'caisse/descendre',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/descendre-caisse', formData);
      
      // Nettoyer localStorage
      localStorage.removeItem('selectedCaisse');
      localStorage.removeItem('selectedCaisseLibelle');
      localStorage.removeItem('noteId');
      
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Erreur lors de la descente de caisse'
      );
    }
  }
);

// État initial
const initialState = {
  caisseId: localStorage.getItem('selectedCaisse') || null,
  caisseLibelle: localStorage.getItem('selectedCaisseLibelle') || '',
  noteId: localStorage.getItem('noteId') || null,
  isLoading: false,
  error: null,
};

// Slice pour la gestion des caisses
const caisseSlice = createSlice({
  name: 'caisse',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    initializeCaisse: (state) => {
      state.caisseId = localStorage.getItem('selectedCaisse') || null;
      state.caisseLibelle = localStorage.getItem('selectedCaisseLibelle') || '';
      state.noteId = localStorage.getItem('noteId') || null;
    },
    clearCaisse: (state) => {
      state.caisseId = null;
      state.caisseLibelle = '';
      state.noteId = null;
      localStorage.removeItem('selectedCaisse');
      localStorage.removeItem('selectedCaisseLibelle');
      localStorage.removeItem('noteId');
    },
  },
  extraReducers: (builder) => {
    builder
      // Sélection de caisse
      .addCase(selectCaisse.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(selectCaisse.fulfilled, (state, action) => {
        state.isLoading = false;
        state.caisseId = action.payload.caisseId;
        state.caisseLibelle = action.payload.caisseLibelle;
        state.noteId = action.payload.noteId;
        state.error = null;
      })
      .addCase(selectCaisse.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Descente de caisse
      .addCase(descendreCaisse.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(descendreCaisse.fulfilled, (state) => {
        state.isLoading = false;
        state.caisseId = null;
        state.caisseLibelle = '';
        state.noteId = null;
        state.error = null;
      })
      .addCase(descendreCaisse.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

// Export des actions
export const { clearError, initializeCaisse, clearCaisse } = caisseSlice.actions;

// Sélecteurs
export const selectCaisseState = (state) => state.caisse;
export const selectCaisseLibelle = (state) => state.caisse.caisseLibelle;
export const selectCaisseId = (state) => state.caisse.caisseId;
export const selectCaisseLoading = (state) => state.caisse.isLoading;
export const selectCaisseError = (state) => state.caisse.error;

// Export du reducer
export default caisseSlice.reducer;