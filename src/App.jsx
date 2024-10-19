import { useEffect } from 'react';
import { UserProvider } from './services/UserContext';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import useAuthUser from './services/useAuthUser';
import getRedirectPath from './services/redirect';
import AdminRoutes from './routes/AdminRoutes';
import AgentRoutes from './routes/AgentRoutes';
import PageError from './pages/pageError';
import Login from './pages/Login';

function App() {
  const { isTokenValid, user, getCaisse } = useAuthUser();
  const navigate = useNavigate();
  const location = useLocation();  // Ajouté pour obtenir la route actuelle

  useEffect(() => {
    if (user && isTokenValid()) {
      const redirectPath = getRedirectPath(user, getCaisse);

      // Ne rediriger que si l'utilisateur est sur la page de login ou sur une route incorrecte
      if (location.pathname === '/' || location.pathname === '/ad' || location.pathname === '/ag') {
        navigate(redirectPath);
      }
    }
  }, [user, isTokenValid, getCaisse, navigate, location.pathname]);

  return (
    <UserProvider>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="ad/*" element={<AdminRoutes />} />
        <Route path="ag/*" element={<AgentRoutes />} />
        <Route path="*" element={<PageError />} />
      </Routes>
    </UserProvider>
  );
}

export default App;
