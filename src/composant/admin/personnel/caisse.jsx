import { useState, useEffect } from 'react';
import { Button, Modal, Form, Table, Alert, Row, Col } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { FaEdit, FaTrashAlt, FaPlus, FaEye } from 'react-icons/fa';
import useAuthUser from '../../../services/useAuthUser';

const CaisseCrud = () => {
  const [caisses, setCaisses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ libelle: '', description: '', type: '1xbet', is_locked: false, is_actif: true });
  const [isEditing, setIsEditing] = useState(false);
  const [editingCaisseId, setEditingCaisseId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const { http, token } = useAuthUser();

  useEffect(() => {
    fetchCaisses();
  }, []);

  const fetchCaisses = async () => {
    try {
      const response = await http.get('/caisses', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCaisses(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des caisses:', error);
      setErrorMessage('Impossible de récupérer les caisses.');
    }
  };

  const handleShowModal = (caisse = null) => {
    if (caisse) {
      setIsEditing(true);
      setFormData(caisse);
      setEditingCaisseId(caisse.id);
    } else {
      setIsEditing(false);
      setFormData({ libelle: '', description: '', type: 'courante', is_locked: false, is_actif: true });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async () => {
    try {
      if (isEditing) {
        await http.put(`/caisses/${editingCaisseId}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        Swal.fire('Succès', 'Caisse modifiée avec succès !', 'success');
      } else {
        await http.post('/caisses', formData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        Swal.fire('Succès', 'Caisse créée avec succès !', 'success');
      }
      fetchCaisses();
    } catch (error) {
      Swal.fire('Erreur', 'Échec de la soumission du formulaire.', 'error');
    }

    handleCloseModal();
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Es-tu sûr ?',
      text: "Cette action supprimera la caisse définitivement !",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
    }).then((result) => {
      if (result.isConfirmed) {
        http.delete(`/caisses/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then(() => {
          Swal.fire('Supprimé !', "La caisse a été supprimée.", 'success');
          fetchCaisses();
        })
        .catch(() => {
          Swal.fire('Erreur', "Échec de la suppression de la caisse.", 'error');
        });
      }
    });
  };

  const handleViewDetails = (caisse) => {
    Swal.fire({
      title: `<h3 style="color: #007bff;">Détails de ${caisse.libelle}</h3>`,
      html: `
        <div class="container text-left">
          <p><strong>Description :</strong> ${caisse.description || 'Non spécifiée'}</p>
          <p><strong>Type :</strong> ${caisse.type}</p>
          <p><strong>Active :</strong> 
            ${caisse.is_actif ? 
              '<span style="color: green;"><i class="fas fa-check-circle"></i> Oui</span>' :
              '<span style="color: red;"><i class="fas fa-times-circle"></i> Non</span>'}
          </p>
          <p><strong>Verrouillée :</strong> 
            ${caisse.is_locked ? 
              '<span style="color: red;"><i class="fas fa-lock"></i> Oui</span>' :
              '<span style="color: green;"><i class="fas fa-unlock"></i> Non</span>'}
          </p>
        </div>
      `,
      showCloseButton: true,
      confirmButtonText: 'Fermer',
      confirmButtonColor: '#007bff',
      customClass: {
        popup: 'animated fadeInDown faster'
      }
    });
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Gestion des Caisses</h2>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <Button variant="primary" onClick={() => handleShowModal()}>
          <FaPlus /> Ajouter une Caisse
        </Button>
        {errorMessage && <Alert variant="danger" className="mb-0">{errorMessage}</Alert>}
      </div>

      <Table striped bordered hover responsive className="mb-5">
        <thead>
          <tr>
            <th>ID</th>
            <th>Libellé</th>
            <th>Type</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {caisses.map((caisse) => (
            <tr key={caisse.id}>
              <td>{caisse.id}</td>
              <td>{caisse.libelle}</td>
              <td>{caisse.type}</td>
              <td>
                <div className="d-flex justify-content-center">
                  <Button variant="warning" className="btn-sm mb-1" onClick={() => handleShowModal(caisse)}>
                    <FaEdit />
                  </Button>
                  <Button variant="danger" className="btn-sm mb-1" onClick={() => handleDelete(caisse.id)}>
                    <FaTrashAlt />
                  </Button>
                  <Button variant="secondary" className="btn-sm mb-1" onClick={() => handleViewDetails(caisse)}>
                    <FaEye />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modal */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{isEditing ? 'Modifier Caisse' : 'Ajouter Caisse'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form noValidate>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Libellé</Form.Label>
                  <Form.Control
                    type="text"
                    name="libelle"
                    value={formData.libelle}
                    onChange={handleInputChange}
                    placeholder="Entrez le libellé"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Type</Form.Label>
                  <Form.Select name="type" value={formData.type} onChange={handleInputChange}>
                    <option value="1xbet">1xbet</option>
                    <option value="betwinner">BetWinner</option>
                    <option value="meltbet">Meltbet</option>

                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                type="text"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Entrez la description"
              />
            </Form.Group>

          {/*  <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                name="is_locked"
                label="Verrouillée"
                checked={formData.is_locked}
                onChange={handleInputChange}
              />
            </Form.Group>*/}

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                name="is_actif"
                label="Active"
                checked={formData.is_actif}
                onChange={handleInputChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Annuler
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {isEditing ? 'Modifier' : 'Ajouter'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CaisseCrud;
