import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { initializeAuth } from './store/slices/authSlice';
import PublicRoute from './components/PublicRoute';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoutes from './routes/AdminRoutes';
import AgentRoutes from './routes/AgentRoutes';
import PageError from './pages/pageError';
import Login from './pages/Login';
import TYPE from './constants/TYPE';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Initialiser l'état d'authentification depuis le localStorage
    dispatch(initializeAuth());
  }, [dispatch]);

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } 
      />
      <Route 
        path="ad/*" 
        element={
          <ProtectedRoute allowedRoles={[TYPE.admin]}>
            <AdminRoutes />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="ag/*" 
        element={
          <ProtectedRoute allowedRoles={[TYPE.agent]}>
            <AgentRoutes />
          </ProtectedRoute>
        } 
      />
      <Route path="*" element={<PageError />} />
    </Routes>
  );
}

export default App;
