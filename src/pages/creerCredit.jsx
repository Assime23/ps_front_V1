import { useState } from 'react';
import { Button, Modal, Form, Alert } from 'react-bootstrap';
import Swal from 'sweetalert2';
import useAuthUser from '../services/useAuthUser';

const CreerCreditButton = () => {
  const { http, token } = useAuthUser();
  const [showModal, setShowModal] = useState(false);

  // États pour les informations du client et du crédit
  const [name, setName] = useState('');
  const [numeroCni, setNumeroCni] = useState('');
  const [telephone, setTelephone] = useState('');
  const [montant, setMontant] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');

  // Fonction pour gérer la soumission du formulaire
  const handleSubmit = () => {
    if (!name || !numeroCni || !telephone || !montant || montant <= 0) {
      setMessage('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    Swal.fire({
      title: 'Confirmer la création du crédit?',
      text: `Crédit de ${montant} € pour ${name}.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, créer',
      cancelButtonText: 'Annuler',
    }).then((result) => {
      if (result.isConfirmed) {
        creerCredit();
      }
    });
  };

  // Fonction pour envoyer les données à l'API
  const creerCredit = async () => {
    try {
      const response = await http.post(
        '/donner-credit-avec-user',
        {
          montant,
          description,
          name,
          numero_cni: numeroCni,
          telephone,
          type: 'client',
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      Swal.fire('Succès', 'Crédit créé avec succès.', 'success');
      setShowModal(false);
      setName('');
      setNumeroCni('');
      setTelephone('');
      setMontant('');
      setDescription('');
    } catch (error) {
      Swal.fire('Erreur', 'Erreur lors de la création du crédit.', 'error');
    }
  };

  return (
    <>
      <Button onClick={() => setShowModal(true)}>Créer un Crédit</Button>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Création de Crédit</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {message && <Alert variant="danger">{message}</Alert>}
          <Form.Group className="mb-3">
            <Form.Label>Nom et Prénom</Form.Label>
            <Form.Control
              type="text"
              placeholder="Nom du client"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Numéro de Téléphone</Form.Label>
            <Form.Control
              type="text"
              placeholder="Téléphone du client"
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Numéro CNI</Form.Label>
            <Form.Control
              type="text"
              placeholder="Numéro CNI"
              value={numeroCni}
              onChange={(e) => setNumeroCni(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Montant du Crédit</Form.Label>
            <Form.Control
              type="number"
              placeholder="Entrez le montant"
              value={montant}
              onChange={(e) => setMontant(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Description (Optionnel)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Description du crédit"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Annuler
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Créer le Crédit
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default CreerCreditButton;
