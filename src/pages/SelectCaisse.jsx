import { useState, useEffect } from 'react';
import { Container, Form, ListGroup, Alert, InputGroup } from 'react-bootstrap';
import useAuthUser from '../services/useAuthUser';
import { useNavigate } from 'react-router-dom'; // Pour la redirection
import Swal from 'sweetalert2'; // SweetAlert2 pour les alertes
import 'sweetalert2/dist/sweetalert2.min.css'; // Les styles de SweetAlert2

const SelectCaisse = () => {
  const [caisses, setCaisses] = useState([]);
  const [selectedCaisse, setSelectedCaisse] = useState(null);
  const [selectedCaisseLibelle, setSelectedCaisseLibelle] = useState('');
  const [libelle, setLibelle] = useState('');
  const [message, setMessage] = useState('');
  const [activeCaisse, setActiveCaisse] = useState(null); // Caisse active si elle existe
  const { http, token, fetchData } = useAuthUser();
  const navigate = useNavigate(); // Pour la redirection

  // Fonction pour vérifier si une caisse active existe
  const verifierCaisseActive = async () => {
    try {
      const response = await fetchData('get', '/ma-caisse');
      setActiveCaisse(response.data);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        // Si aucune caisse active n'est trouvée, rediriger vers la sélection
        setActiveCaisse(null);
      } else {
        setMessage('Erreur lors de la vérification de la caisse active.');
      }
    }
  };

  const rechercherCaisses = async () => {
    try {
      const response = await fetchData('get', '/rechercher-caisses', { libelle });
      setCaisses(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des caisses", error);
      setMessage('Erreur lors de la récupération des caisses disponibles.');
    }
  };

  useEffect(() => {
    verifierCaisseActive(); // Vérifier si une caisse active existe au montage
  }, []);

  useEffect(() => {
    rechercherCaisses(); // Rechercher les caisses
  }, [libelle]);

  // Fonction pour sélectionner une caisse
  const selectCaisse = (caisseId, caisseLibelle) => {
    Swal.fire({
      title: 'Confirmation',
      text: `Voulez-vous vraiment sélectionner la caisse : ${caisseLibelle} ?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, sélectionner',
      cancelButtonText: 'Annuler'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await http.post('/select-caisse', {
            caisse_id: caisseId
          }, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          setSelectedCaisse(caisseId);
          setSelectedCaisseLibelle(caisseLibelle);

          // Enregistrer dans le localStorage
          localStorage.setItem('selectedCaisse', caisseId);
          localStorage.setItem('selectedCaisseLibelle', caisseLibelle);
          localStorage.setItem('noteId', response.data.note_id);

          // Déclencher l'événement de changement de caisse
          window.dispatchEvent(new Event('caisseChanged'));

          Swal.fire({
            title: 'Succès!',
            text: `Caisse sélectionnée avec succès : ${caisseLibelle}`,
            icon: 'success',
            timer: 1000,
            showConfirmButton: false
          }).then(() => {
            navigate('/ag'); // Redirection après succès
          });

          rechercherCaisses(); // Recharger les caisses
        } catch (error) {
          Swal.fire({
            title: 'Erreur',
            text: 'Erreur lors de la sélection de la caisse.',
            icon: 'error',
            confirmButtonText: 'OK'
          });
          console.error("Erreur lors de la sélection de la caisse", error);
        }
      } else {
        Swal.fire({
          title: 'Annulé',
          text: 'La sélection de la caisse a été annulée.',
          icon: 'info',
          timer: 1000,
          showConfirmButton: false
        });
      }
    });
  };

  // Si une caisse active est présente, afficher ses informations
  if (activeCaisse) {
    return (
      <Container className="mt-5 d-flex justify-content-center">
        <div className="w-md-100 w-md-75 w-lg-50">
          <h1 className="text-center mb-4">Informations sur la Caisse Active</h1>
          <Alert variant="info">
            <h4>{activeCaisse.libelle}</h4>
            <p><strong>Stock Monté Caisse :</strong> {activeCaisse.stock_monte_caisse} FCFA</p>
            <p><strong>Liquidité Montée :</strong> {activeCaisse.liquidite_monte} FCFA</p>
            <p><strong>Stock MP 1 :</strong> {activeCaisse.stock_monte_mp_1} FCFA</p>
            <p><strong>Stock MP 2 :</strong> {activeCaisse.stock_monte_mp_2} FCFA</p>
            <p><strong>Stock MP 3 :</strong> {activeCaisse.stock_monte_mp_3} FCFA</p>
            <p><strong>Stock MP 4 :</strong> {activeCaisse.stock_monte_mp_4} FCFA</p>
            <p><strong>Somme retrait 10% :</strong> {activeCaisse.somme_retrait} FCFA</p>
            <p><strong>Stock Transfert Agent :</strong> {activeCaisse.somme_transfert} FCFA</p>
            <p><strong>Stock Autres Transfert :</strong> {activeCaisse.somme_autres_transfert} FCFA</p>
            <p><strong>Stock  Transfert Recu :</strong> {activeCaisse.somme_transfert_recu} FCFA</p>
            <p><strong>Somme credit recu :</strong> {activeCaisse.somme_credit_recu} FCFA</p>
            <p><strong>Somme credit :</strong> {activeCaisse.somme_credit} FCFA</p>

            <p><strong>Date Montée :</strong> {new Date(activeCaisse.date_monte).toLocaleDateString()}</p>
          </Alert>
        </div>
      </Container>
    );
  }

  // Si aucune caisse active, rediriger vers la sélection de caisse
  return (
    <Container className="mt-5 d-flex justify-content-center">
      <div className="w-md-100 w-md-75 w-lg-50">
        <h1 className="text-center mb-4">Sélectionner une Caisse</h1>

        <InputGroup className="mb-3">
          <Form.Control
            type="text"
            placeholder="Rechercher une caisse par libellé"
            value={libelle}
            onChange={(e) => setLibelle(e.target.value)}
            className="shadow-sm"
          />
        </InputGroup>

        {caisses.length > 0 ? (
          <ListGroup>
            {caisses.map((caisse) => (
              <ListGroup.Item
                key={caisse.id}
                action
                onClick={() => selectCaisse(caisse.id, caisse.libelle)}
                className="d-flex justify-content-between align-items-center list-group-item-action"
              >
                <span className="fw-bold">{caisse.libelle}</span>
              </ListGroup.Item>
            ))}
          </ListGroup>
        ) : (
          <Alert variant="warning" className="text-center">
            Aucune caisse disponible pour le moment.
          </Alert>
        )}

        {message && (
          <Alert variant={message.includes("succès") ? "success" : "danger"} className="mt-4">
            {message}
          </Alert>
        )}
      </div>
    </Container>
  );
};

export default SelectCaisse;
