import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'; // Import de SweetAlert2
import useAuthUser from '../services/useAuthUser';

const LogoutButton = () => {
  const { logout } = useAuthUser();
  const navigate = useNavigate();

  // Fonction pour gérer la déconnexion après confirmation
  const handleLogout = async () => {
    try {
      await logout(); // Appelle la fonction de déconnexion
      navigate('/'); // Redirige vers la page de connexion
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
      Swal.fire({
        title: 'Erreur',
        text: 'Une erreur est survenue lors de la déconnexion.',
        icon: 'error',
      });
    }
  };

  // Ouvre la modale de confirmation pour la déconnexion avec SweetAlert2
  const openLogoutConfirmation = (event) => {
    event.preventDefault(); // Empêche le comportement par défaut du lien

    Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: 'de vouloir vous déconnecter ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, me deconnecter',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        handleLogout(); // Effectue la déconnexion après confirmation
      }
    });
  };

  return (
    <>
      <a href="#" onClick={openLogoutConfirmation} className="dropdown-item">
        Déconnexion
      </a>
    </>
  );
};

export default LogoutButton;
