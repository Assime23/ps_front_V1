import { useState, useEffect } from 'react';
import { Container, Form, Button, Alert, Modal, ListGroup, Row, Col } from 'react-bootstrap';
import Swal from 'sweetalert2';
import useAuthUser from '../services/useAuthUser';

const AutresTransfert = () => {
  const { http, token } = useAuthUser();

  // Fonction utilitaire pour formater les montants en F CFA
  const formatCurrency = (value) => {
    if (value === null || value === undefined) return 'N/A';
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'XOF' 
    }).format(value);
  };
  const [montant, setMontant] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('envoye'); // Par défaut 'envoye'
  const [showModal, setShowModal] = useState(false);
  const [transferts, setTransferts] = useState([]); // Stocker les transferts
  const [filteredTransferts, setFilteredTransferts] = useState([]); // Pour les transferts filtrés

  // États pour les filtres
  const [filterType, setFilterType] = useState(''); // Filtrer par type (envoye/recu)
  const [filterDateOption, setFilterDateOption] = useState('all'); // Option de filtre par date (aujourd'hui, tous les temps, etc.)
  const [filterSpecificDate, setFilterSpecificDate] = useState(''); // Filtre par jour spécifique
  const [filterHour, setFilterHour] = useState(''); // Filtrer par heure

  // Fonction pour récupérer les transferts de l'utilisateur connecté
  const fetchTransferts = async () => {
    try {
      const response = await http.get('/user/transferts', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTransferts(response.data); // Stocker les transferts dans l'état
      setFilteredTransferts(response.data); // Initialiser la liste filtrée avec tous les transferts
    } catch (error) {
      console.error('Erreur lors de la récupération des transferts', error);
    }
  };

  // useEffect pour récupérer les transferts au montage du composant
  useEffect(() => {
    fetchTransferts();
  }, []);

  // Fonction pour appliquer les filtres
  const handleFilter = () => {
    let filtered = transferts;

    // Filtrer par type (envoye ou recu)
    if (filterType) {
      filtered = filtered.filter((transfert) => transfert.type === filterType);
    }

    // Filtrer par date en fonction de l'option sélectionnée
    const today = new Date().toISOString().split('T')[0]; // Date d'aujourd'hui

    if (filterDateOption === 'today') {
      filtered = filtered.filter((transfert) => transfert.date.split('T')[0] === today);
    } else if (filterDateOption === 'specific' && filterSpecificDate) {
      filtered = filtered.filter((transfert) => transfert.date.split('T')[0] === filterSpecificDate);
    }

    // Filtrer par heure
    if (filterHour) {
      filtered = filtered.filter((transfert) => {
        const transfertHour = new Date(transfert.date).getHours();
        return transfertHour === parseInt(filterHour);
      });
    }

    setFilteredTransferts(filtered); // Mettre à jour la liste filtrée
  };

  const handleTransferClick = () => {
    if (!montant || montant <= 0 || !description || !type) {
      setMessage('Veuillez entrer un montant valide, une description, et un type de transfert.');
      return;
    }

    Swal.fire({
      title: 'Confirmez-vous ce transfert ?',
      text: `Vous allez ${type === 'envoye' ? 'envoyer' : 'recevoir'} ${formatCurrency(montant)}.`,
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
        '/autres-transferts',
        {
          montant,
          description,
          type, // 'envoye' ou 'recu'
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Swal.fire('Succès', `Transfert de ${formatCurrency(montant)} effectué avec succès.`, 'success');
      setMontant('');
      setDescription('');
      setShowModal(false); // Fermer le modal

      // Recharger les transferts après le succès de l'envoi
      fetchTransferts();
    } catch (error) {
      Swal.fire('Erreur', 'Erreur lors du transfert.', 'error');
      console.error('Erreur lors du transfert', error);
    }
  };

  return (
    <Container className="mt-5 d-flex justify-content-center">
      <div className="w-md-100 w-md-75 w-lg-50">
        <h1 className="text-center mb-4">Effectuer un Autre Transfert</h1>

        <Button onClick={() => setShowModal(true)} className="mb-3">
          Nouveau Transfert
        </Button>

        {message && (
          <Alert variant={message.includes('succès') ? 'success' : 'danger'} className="mt-4">
            {message}
          </Alert>
        )}

        {/* Zone de filtre */}
        <h3 className="mt-4 mb-3">Filtrer les Transferts</h3>
        <Row className="mb-3">
          <Col>
            <Form.Group>
              <Form.Label>Type de Transfert</Form.Label>
              <Form.Select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                <option value="">Tous</option>
                <option value="envoye">Envoyé</option>
                <option value="recu">Reçu</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col>
            <Form.Group>
              <Form.Label>Option de Date</Form.Label>
              <Form.Select value={filterDateOption} onChange={(e) => setFilterDateOption(e.target.value)}>
                <option value="all">Tous les temps</option>
                <option value="today">Aujourd'hui</option>
                <option value="specific">Jour spécifique</option>
              </Form.Select>
            </Form.Group>
          </Col>
          {filterDateOption === 'specific' && (
            <Col>
              <Form.Group>
                <Form.Label>Date Spécifique</Form.Label>
                <Form.Control
                  type="date"
                  value={filterSpecificDate}
                  onChange={(e) => setFilterSpecificDate(e.target.value)}
                />
              </Form.Group>
            </Col>
          )}
          <Col>
            <Form.Group>
              <Form.Label>Filtrer par Heure</Form.Label>
              <Form.Control
                type="number"
                placeholder="Entrez l'heure (0-23)"
                value={filterHour}
                onChange={(e) => setFilterHour(e.target.value)}
                min="0"
                max="23"
              />
            </Form.Group>
          </Col>
          <Col className="d-flex align-items-end">
            <Button variant="primary" onClick={handleFilter}>
              Filtrer
            </Button>
          </Col>
        </Row>

        {/* Liste des transferts de l'utilisateur filtrés */}
        <h3 className="mt-4 mb-3">Historique des Transferts</h3>
        {filteredTransferts.length > 0 ? (
          <ListGroup>
          {filteredTransferts.map((transfert, index) => (
            <ListGroup.Item
              key={index}
              className="d-flex justify-content-between"
              style={{
                backgroundColor: transfert.type === 'envoye' ? '#ffcccc' : '#ccffcc', // Rouge clair pour "envoye", vert clair pour "recu"
              }}
            >
                <div>
                  <strong>Date :</strong> {new Date(transfert.date).toLocaleDateString()}
                  <br />
                  <strong>Heure :</strong> {new Date(transfert.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  <br />
                  <strong>Type :</strong> {transfert.type === 'envoye' ? 'Envoyé' : 'Reçu'}
                </div>
                <div>
                  <strong>Montant :</strong> {formatCurrency(transfert.montant)}
                  <br />
                  <strong>Description :</strong> {transfert.description || 'N/A'}
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        ) : (
          <Alert variant="info" className="text-center">
            Aucun transfert disponible.
          </Alert>
        )}

        {/* Modal pour entrer le montant, la description et le type */}
        <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
          <Modal.Header closeButton>
            <Modal.Title>Effectuer un Transfert</Modal.Title>
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

            <Form.Group className="mb-3">
              <Form.Label>Type de Transfert</Form.Label>
              <Form.Select value={type} onChange={(e) => setType(e.target.value)}>
                <option value="envoye">Envoyé</option>
                <option value="recu">Reçu</option>
              </Form.Select>
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

export default AutresTransfert;
