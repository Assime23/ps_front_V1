import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';

// Configuration du store Redux
export const store = configureStore({
  reducer: {
    auth: authReducer,
    // Ajoutez d'autres reducers ici au besoin
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;