import { useState, useEffect } from 'react';
import { Container, Form, ListGroup, Button, Alert, InputGroup, Modal } from 'react-bootstrap';
import Swal from 'sweetalert2';
import useAuthUser from '../services/useAuthUser';

const TransferAgent = () => {
  const { http, token } = useAuthUser();

  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [montant, setMontant] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');
  const [name, setName] = useState('');
  const [showModal, setShowModal] = useState(false);

 

  // Rechercher les agents selon le nom saisi
  const rechercherAgents = async () => {
    try {
      const response = await http.get('/searchag', {
        params: { name },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAgents(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des agents', error);
      setMessage('Erreur lors de la récupération des agents disponibles.');
    }
  };

  useEffect(() => {
    rechercherAgents();
  }, [name]);

  const handleTransferClick = () => {
    if (!selectedAgent || !montant || montant <= 0 || !description) {
      setMessage('Veuillez sélectionner un agent, entrer un montant et une description.');
      return;
    }

    // Utilisation de SweetAlert pour la confirmation
    Swal.fire({
      title: 'Confirmez-vous ce transfert ?',
      text: `Vous allez transférer ${montant} à ${selectedAgent.name}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, transférer',
      cancelButtonText: 'Annuler',
    }).then((result) => {
      if (result.isConfirmed) {
        transfererMontant();
      }
    });
  };

  const transfererMontant = async () => {
    try {
         await http.post(
        '/transfert_agents',
        {
          montant, // Utilisation de la variable 'montant' directement
          description,
          type: 'Transfert',
          user_1_id: selectedAgent.user_id, // L'ID de l'utilisateur receveur
          caisse_1_id: selectedAgent.caisse_id, // L'ID de la caisse receveur
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Swal.fire('Succès', `Transfert de ${montant} effectué avec succès.`, 'success');
      setMontant('');
      setDescription('');
      setSelectedAgent(null);
      setShowModal(false); // Fermer le modal
    } catch (error) {
      Swal.fire('Erreur', 'Erreur lors du transfert.', 'error');
      console.error('Erreur lors du transfert', error);
    }
  };

  return (
    <Container className="mt-5 d-flex justify-content-center">
      <div className="w-md-100 w-md-75 w-lg-50">
        <h1 className="text-center mb-4">Rechercher et Transférer à un Agent</h1>

        <InputGroup className="mb-3">
          <Form.Control
            type="text"
            placeholder="Rechercher un agent par nom"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="shadow-sm"
          />
        </InputGroup>

        {agents.length > 0 ? (
          <ListGroup>
            {agents.map((agent) => (
              <ListGroup.Item
                key={agent.user_id}
                action
                onClick={() => {
                  setSelectedAgent(agent);
                  setShowModal(true); // Afficher le modal après sélection
                }}
                className="d-flex justify-content-between align-items-center list-group-item-action"
              >
                <span className="fw-bold">{agent.name}</span>
              </ListGroup.Item>
            ))}
          </ListGroup>
        ) : (
          <Alert variant="warning" className="text-center">
            Aucun agent disponible pour le moment.
          </Alert>
        )}

        {message && (
          <Alert variant={message.includes('succès') ? 'success' : 'danger'} className="mt-4">
            {message}
          </Alert>
        )}

        {/* Modal pour entrer le montant et la description */}
        <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
          <Modal.Header closeButton>
            <Modal.Title>Transférer à {selectedAgent?.name}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Montant à transférer</Form.Label>
              <Form.Control
                type="number"
                placeholder="Entrez le montant"
                value={montant}
                onChange={(e) => setMontant(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description du transfert</Form.Label>
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
            <Button variant="primary" onClick={handleTransferClick}>
              Envoyer
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </Container>
  );
};

export default TransferAgent;
