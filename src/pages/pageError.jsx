import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const PageError = () => {
  return (
    <div className="container d-flex flex-column justify-content-center align-items-center vh-100">
      <h1 className="display-3 text-danger">404</h1>
      <h2 className="text-muted mb-4">Page non trouvée</h2>
      <p className="text-center mb-4">
      Désolé, la page que vous recherchez n&apos;existe pas ou a été déplacée.
      </p>
      <Link to="/" className="btn btn-primary">
        Retour à l&apos;accueil
      </Link>
    </div>
  );
};

export default PageError;
