import { useState, useEffect } from 'react';
import { Container, Form, ListGroup, Alert, InputGroup } from 'react-bootstrap';
import useAuthUser from '../services/useAuthUser';
import { useNavigate } from 'react-router-dom'; // Importer useNavigate pour la redirection
import Swal from 'sweetalert2'; // Importer SweetAlert2
import 'sweetalert2/dist/sweetalert2.min.css'; // Importer les styles de SweetAlert2

const SelectCaisse = () => {
  const [caisses, setCaisses] = useState([]);
  const [selectedCaisse, setSelectedCaisse] = useState(null);
  const [selectedCaisseLibelle, setSelectedCaisseLibelle] = useState(''); // Libellé de la caisse sélectionnée
  const [libelle, setLibelle] = useState('');
  const [message, setMessage] = useState('');
  const { http, token, fetchData } = useAuthUser();
  const navigate = useNavigate(); // Utilisé pour la redirection

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
    rechercherCaisses();
  }, [libelle]);

  const selectCaisse = (caisseId, caisseLibelle) => {
    // Utiliser SweetAlert pour la confirmation de sélection
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
          setSelectedCaisseLibelle(caisseLibelle); // Enregistre le libellé de la caisse

          // Enregistrer dans le localStorage
          localStorage.setItem('selectedCaisse', caisseId);
          localStorage.setItem('selectedCaisseLibelle', caisseLibelle); // Enregistrer le libellé
          localStorage.setItem('noteId', response.data.note_id);

          // Afficher un message de succès avec SweetAlert2
          Swal.fire({
            title: 'Succès!',
            text: `Caisse sélectionnée avec succès : ${caisseLibelle}`,
            icon: 'success',
            timer: 1000, // Délai d'une seconde
            showConfirmButton: false
          }).then(() => {
            // Redirection après succès
            navigate('/ag');
          });

          rechercherCaisses(); // Recharger les caisses
        } catch (error) {
          // Afficher une alerte en cas d'erreur
          Swal.fire({
            title: 'Erreur',
            text: 'Erreur lors de la sélection de la caisse.',
            icon: 'error',
            confirmButtonText: 'OK'
          });
          console.error("Erreur lors de la sélection de la caisse", error);
        }
      } else {
        // Si annulé, ne rien faire
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

  return (
    <Container className="mt-5 d-flex justify-content-center">
      {/* Conteneur responsive qui prend 100% de la largeur sur mobile, et moins sur les grands écrans */}
      <div className="w-md-100 w-md-75 w-lg-50"> {/* 100% sur petits écrans, 75% sur écrans moyens, 50% sur grands écrans */}
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
                onClick={() => selectCaisse(caisse.id, caisse.libelle)} // Passer le libellé
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

        {selectedCaisse && (
          <Alert variant="info" className="mt-4">
            Caisse sélectionnée : {selectedCaisse} - Libellé : {selectedCaisseLibelle}
          </Alert>
        )}
      </div>
    </Container>
  );
};

export default SelectCaisse;
