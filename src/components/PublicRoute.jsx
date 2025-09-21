import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { selectIsAuthenticated, selectUser } from '../store/slices/authSlice';

const PublicRoute = ({ children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);

  // Si l'utilisateur est authentifié, rediriger vers le dashboard approprié
  if (isAuthenticated && user) {
    const redirectPath = user.type === 'admin' ? '/ad' : '/ag';
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

PublicRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default PublicRoute;