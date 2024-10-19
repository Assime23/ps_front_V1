import { useLocation, Navigate, Outlet } from 'react-router-dom';
import PropTypes from 'prop-types'; // Importez PropTypes
import useAuthUser from './useAuthUser';

const RequireAuth = ({ allowedTypes }) => {
  const { user, isTokenValid } = useAuthUser();
  const location = useLocation();

  if (!user || !isTokenValid()) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (!allowedTypes.includes(user.type)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

// Ajout de la validation des props avec PropTypes
RequireAuth.propTypes = {
  allowedTypes: PropTypes.arrayOf(PropTypes.string).isRequired, // allowedTypes doit être un tableau de chaînes de caractères
};

export default RequireAuth;
