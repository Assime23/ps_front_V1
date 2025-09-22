import { useState, useEffect } from 'react';
import { Container, Form, ListGroup, Button, Alert, InputGroup, Modal } from 'react-bootstrap';
import Swal from 'sweetalert2';
import useAuthUser from '../services/useAuthUser';
import { useNavigate } from 'react-router-dom';
import CreerCreditButton from './creerCredit';
const DonnerCredit = () => {
  const { http, token } = useAuthUser();

  // Fonction utilitaire pour formater les montants en F CFA
  const formatCurrency = (value) => {
    if (value === null || value === undefined) return 'N/A';
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'XOF' 
    }).format(value);
  };
  const navigate = useNavigate();

  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [montant, setMontant] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');
  const [name, setName] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Récupérer tous les clients au chargement initial
  const fetchAllClients = async () => {
    try {
      const response = await http.get('/searchclientnp', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setClients(response.data); // Stocker tous les clients
      setFilteredClients(response.data); // Afficher tous les clients au début
    } catch (error) {
      console.error('Erreur lors de la récupération des clients', error);
      setMessage('Erreur lors de la récupération des clients disponibles.');
    }
  };

  const rechercherClients = async () => {
    try {
      const response = await http.get('/searchclientnp', {
        params: { name },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      // Si aucun client correspondant n'est trouvé
      if (response.data.length === 0) {
        setFilteredClients([]); // Vider la liste filtrée
        setMessage(`Aucun utilisateur trouvé pour "${name}"`);
      } else {
        setFilteredClients(response.data);
        setMessage('');
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des clients', error);
      setMessage('Erreur lors de la récupération des clients disponibles.');
    }
  };

  useEffect(() => {
    fetchAllClients(); // Récupérer tous les clients au chargement initial
  }, []);

  useEffect(() => {
    // Filtrer les clients lorsqu'il y a du texte saisi
    if (name.length > 0) {
      rechercherClients();
    } else {
      setFilteredClients(clients); // Réinitialiser à la liste complète si le champ est vide
    }
  }, [name, clients]);

  const handleCreditClick = () => {
    if (!selectedClient || !montant || montant <= 0 || !description) {
      setMessage('Veuillez sélectionner un client, entrer un montant et une description.');
      return;
    }

    Swal.fire({
      title: 'Confirmez-vous ce crédit ?',
      text: `Vous allez donner un crédit de ${formatCurrency(montant)} à ${selectedClient.name}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, donner',
      cancelButtonText: 'Annuler',
    }).then((result) => {
      if (result.isConfirmed) {
        donnerCredit();
      }
    });
  };

  const donnerCredit = async () => {
    try {
      await http.post(
        '/donner-credit',
        {
          montant,
          description,
          prenant_credit_id: selectedClient.id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Swal.fire('Succès', `Crédit de ${formatCurrency(montant)} donné avec succès.`, 'success').then(() => {
        setMontant('');
        setDescription('');
        setSelectedClient(null);
        setShowModal(false);
        navigate('/ag/donner-credit');
      });
    } catch (error) {
      Swal.fire('Erreur', 'Erreur lors du don de crédit.', 'error');
      console.error('Erreur lors du don de crédit', error);
    }
  };

  const handleNavigate = () => {
    navigate('/ag/rembourser-credit');
  };

  return (
    <Container className="mt-5 d-flex justify-content-center">
      <div className="w-md-100 w-md-75 w-lg-50">
      <CreerCreditButton/>

        <div style={{ top: '10px', right: '10px', zIndex: 1000 }}>
          <Button variant="primary" onClick={handleNavigate}>
            Voir la liste des crédits
          </Button>
        </div>
        <h5 className="text-center mb-4">Rechercher et Donner un Crédit</h5>

        <InputGroup className="mb-3">
          <Form.Control
            type="text"
            placeholder="Rechercher un client par nom, numéro CNI ou téléphone"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="shadow-sm"
          />
        </InputGroup>

        {filteredClients.length > 0 ? (
          <ListGroup>
            {filteredClients.map((client) => (
              <ListGroup.Item
                key={client.id}
                action
                onClick={() => {
                  setSelectedClient(client);
                  setShowModal(true);
                }}
                className="d-flex justify-content-between align-items-center list-group-item-action"
              >
                <span className="fw-bold">{client.name}</span>
                <span>{client.telephone}</span>
              </ListGroup.Item>
            ))}
          </ListGroup>
        ) : (
          name && (
            <Alert variant="warning" className="text-center">
              {message || `Aucun utilisateur trouvé pour "${name}"`}
            </Alert>
          )
        )}

        {message && (
          <Alert variant={message.includes('succès') ? 'success' : 'danger'} className="mt-4">
            {message}
          </Alert>
        )}

        <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
          <Modal.Header closeButton>
            <Modal.Title>Donner un crédit à {selectedClient?.name}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Montant du crédit</Form.Label>
              <Form.Control
                type="number"
                placeholder="Entrez le montant"
                value={montant}
                onChange={(e) => setMontant(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description du crédit</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Entrez une description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Annuler
            </Button>
            <Button variant="primary" onClick={handleCreditClick}>
              Donner le crédit
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </Container>
  );
};

export default DonnerCredit;
