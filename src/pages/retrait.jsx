import { useState, useEffect } from 'react';
import { Container, Form, Button, Alert, Modal, ListGroup, Row, Col } from 'react-bootstrap';
import Swal from 'sweetalert2';
import useAuthUser from '../services/useAuthUser';

const Retrait = () => {
  const { http, token } = useAuthUser();
  const [montant, setMontant] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [retraits, setRetraits] = useState([]); // Storing retraits
  const [filteredRetraits, setFilteredRetraits] = useState([]); // For filtered retraits

  // States for filters
  const [filterDateOption, setFilterDateOption] = useState('today'); // Filter by date option (default is today)
  const [filterSpecificDate, setFilterSpecificDate] = useState(''); // Filter by specific date

  // Fetch user retraits
  const fetchRetraits = async () => {
    try {
      const response = await http.get('/user/retraits', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setRetraits(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des retraits :', error);
    }
  };

  useEffect(() => {
    fetchRetraits();
  }, []);

  useEffect(() => {
    handleFilter(); // Appliquer le filtre après la récupération des retraits
  }, [retraits]);

  // Handle filters
  const handleFilter = () => {
    let filtered = retraits;

    const today = new Date().toISOString().split('T')[0]; // Today's date

    if (filterDateOption === 'today') {
      filtered = filtered.filter((retrait) => retrait.created_at.split('T')[0] === today);
    } else if (filterDateOption === 'specific' && filterSpecificDate) {
      filtered = filtered.filter((retrait) => retrait.created_at.split('T')[0] === filterSpecificDate);
    }

    setFilteredRetraits(filtered);
  };

  const handleRetraitClick = () => {
    if (!montant || montant <= 0) {
      setMessage('Veuillez entrer un montant valide.');
      return;
    }

    Swal.fire({
      title: 'Confirmez-vous ce retrait ?',
      text: `Vous êtes sur le point de retirer ${montant} F CFA.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, procéder',
      cancelButtonText: 'Annuler',
    }).then((result) => {
      if (result.isConfirmed) {
        submitRetrait();
      }
    });
  };

  // Fonction utilitaire pour formater les montants en F CFA
  const formatCurrency = (value) => {
    if (value === null || value === undefined) return 'N/A';
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'XOF' 
    }).format(value);
  };

  const submitRetrait = async () => {
    try {
      await http.post(
        '/retraits',
        { montant, description },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Swal.fire('Succès', `Retrait de ${formatCurrency(montant)} effectué avec succès.`, 'success');
      setMontant('');
      setDescription('');
      setShowModal(false);
      fetchRetraits();
    } catch (error) {
      Swal.fire('Erreur', 'Erreur lors du traitement du retrait.', 'error');
      console.error('Erreur lors du retrait :', error);
    }
  };

  return (
    <Container className="mt-5 d-flex justify-content-center">
      <div className="w-md-100 w-md-75 w-lg-50">
        <h1 className="text-center mb-4">Créer un Retrait</h1>

        <Button onClick={() => setShowModal(true)} className="mb-3">
          Nouveau Retrait
        </Button>

        {message && (
          <Alert variant="danger" className="mt-4">
            {message}
          </Alert>
        )}

        {/* Section de Filtrage */}
        <h3 className="mt-4 mb-3">Filtrer les Retraits</h3>
        <Row className="mb-3">
          <Col>
            <Form.Group>
              <Form.Label>Option de Date</Form.Label>
              <Form.Select value={filterDateOption} onChange={(e) => setFilterDateOption(e.target.value)}>
                <option value="all">Tout le temps</option>
                <option value="today">Aujourd'hui</option>
                <option value="specific">Date spécifique</option>
              </Form.Select>
            </Form.Group>
          </Col>
          {filterDateOption === 'specific' && (
            <Col>
              <Form.Group>
                <Form.Label>Date spécifique</Form.Label>
                <Form.Control
                  type="date"
                  value={filterSpecificDate}
                  onChange={(e) => setFilterSpecificDate(e.target.value)}
                />
              </Form.Group>
            </Col>
          )}
          <Col className="d-flex align-items-end">
            <Button variant="primary" onClick={handleFilter}>
              Filtrer
            </Button>
          </Col>
        </Row>

        {/* Historique des Retraits */}
        <h3 className="mt-4 mb-3">Historique des Retraits</h3>
        {filteredRetraits.length > 0 ? (
          <ListGroup>
            {filteredRetraits.map((retrait, index) => (
              <ListGroup.Item key={index} className="d-flex justify-content-between">
                <div>
                  <strong>Date :</strong> {new Date(retrait.created_at).toLocaleDateString('fr-FR')}
                  <br />
                  <strong>Heure :</strong> {new Date(retrait.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div>
                  <strong>Montant :</strong> {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(retrait.montant_retrait)}
                  <br />
                  <strong>Description :</strong> {retrait.description || 'N/A'}
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        ) : (
          <Alert variant="info" className="text-center">
            Aucun retrait disponible.
          </Alert>
        )}

        {/* Modal pour créer un retrait */}
        <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
          <Modal.Header closeButton>
            <Modal.Title>Créer un Retrait</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Montant</Form.Label>
              <Form.Control
                type="number"
                placeholder="Entrer le montant"
                value={montant}
                onChange={(e) => setMontant(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Entrer la description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Annuler
            </Button>
            <Button variant="primary" onClick={handleRetraitClick}>
              Soumettre
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </Container>
  );
};

export default Retrait;
