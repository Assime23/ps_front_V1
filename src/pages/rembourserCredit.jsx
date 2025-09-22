import { useState, useEffect } from 'react';
import { Container, Form, ListGroup, Button, Alert } from 'react-bootstrap';
import Swal from 'sweetalert2';
import useAuthUser from '../services/useAuthUser';
import { useNavigate } from 'react-router-dom'; // Assuming you are using react-router for navigation

const RembourserCredit = () => {
  const { http, token } = useAuthUser();

  // Fonction utilitaire pour formater les montants en F CFA
  const formatCurrency = (value) => {
    if (value === null || value === undefined) return 'N/A';
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'XOF' 
    }).format(value);
  };
  const [filteredCredits, setFilteredCredits] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate('/ag/donner-credit'); // Replace '/some-link' with the actual link you want to navigate to
  };

  // Charger les crédits non payés
  const fetchCredits = async () => {
    try {
      const response = await http.get('/credits-non-payes', {
        params: { limit: 10 }, // Charger les 10 derniers crédits par défaut
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setFilteredCredits(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des crédits', error);
      setMessage('Erreur lors de la récupération des crédits non payés.');
    }
  };

  useEffect(() => {
    fetchCredits();
  }, []);

  // Filtrer les crédits en fonction du terme de recherche


  // Gestion de la soumission du remboursement
  const handleRemboursement = (credit) => {
    // Utilisation de SweetAlert pour la confirmation
    Swal.fire({
      title: 'Confirmez-vous ce remboursement ?',
      text: `Vous allez rembourser un crédit de ${formatCurrency(credit.montant)} à ${credit.preneur_credit.name}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, rembourser',
      cancelButtonText: 'Annuler',
    }).then((result) => {
      if (result.isConfirmed) {
        rembourserCredit(credit.id);
      }
    });
  };

  const rembourserCredit = async (creditId) => {
    try {
      await http.patch(
        `/credit/${creditId}/rembourser`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      Swal.fire('Succès', 'Crédit remboursé avec succès.', 'success');
      fetchCredits(); // Rafraîchir la liste des crédits
    } catch (error) {
      Swal.fire('Erreur', 'Erreur lors du remboursement du crédit.', 'error');
      console.error('Erreur lors du remboursement du crédit', error);
    }
  };

  return (
    <Container className="mt-5 d-flex justify-content-center">
      <div className="w-md-100 w-md-75 w-lg-50">
      <div style={{ /*position: 'fixed',*/ top: '10px', right: '10px', zIndex: 1000 }}>
          <Button variant="primary" onClick={handleNavigate}>
             Donner Crédit a des clients
          </Button>
        </div>
        <h1 className="text-center mb-4">Rembourser un Crédit</h1>

        <Form.Control
          type="text"
          placeholder="Rechercher un crédit par nom de client"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-3 shadow-sm"
        />

        {filteredCredits.length > 0 ? (
          <ListGroup>
            {filteredCredits.map((credit) => (
              <ListGroup.Item
                key={credit.id}
                className="d-flex justify-content-between align-items-center"
              >
                <div>
                  <strong>Nom du preneur:</strong> {credit.preneur_credit.name} <br />
                  <strong>Nom du donneur:</strong> {credit.donneur_credit.name} <br />
                  <strong>Date du crédit:</strong> {new Date(credit.created_at).toLocaleDateString()} <br />
                  <strong>Montant: {formatCurrency(credit.montant)}</strong>
                </div>
                <Button variant="primary" onClick={() => handleRemboursement(credit)}>
                  Rembourser
                </Button>
              </ListGroup.Item>
            ))}
          </ListGroup>
        ) : (
          <Alert variant="warning" className="text-center">
            Aucun crédit non payé trouvé.
          </Alert>
        )}

        {message && (
          <Alert variant={message.includes('succès') ? 'success' : 'danger'} className="mt-4">
            {message}
          </Alert>
        )}
      </div>
    </Container>
  );
};

export default RembourserCredit;
