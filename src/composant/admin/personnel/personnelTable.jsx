import { useState, useEffect } from 'react';
import { Button, Modal, Form, Table, Alert, Row, Col } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { FaEdit, FaTrashAlt, FaPlus, FaEye } from 'react-icons/fa';
import useAuthUser from '../../../services/useAuthUser';

const UsersCrud = () => {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', telephone: '', type: 'agent', numero_cni: '', email: '', password: '', confirmPassword: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const { http, token } = useAuthUser();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await http.get('/users', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      setErrorMessage('Impossible de récupérer les utilisateurs.');
    }
  };

  const handleShowModal = (user = null) => {
    if (user) {
      setIsEditing(true);
      setFormData({ ...user, password: '', confirmPassword: '' }); // Clear passwords when editing
      setEditingUserId(user.id);
    } else {
      setIsEditing(false);
      setFormData({ name: '', telephone: '', type: 'agent', numero_cni: '', email: '', password: '', confirmPassword: '' });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    // Vérifie si les mots de passe correspondent
    if (formData.password !== formData.confirmPassword) {
      Swal.fire('Erreur', 'Les mots de passe ne correspondent pas.', 'error');
      return;
    }

    const rules = {
      name: formData.name,
      telephone: formData.telephone,
      type: formData.type,
      numero_cni: formData.numero_cni,
    };

    if (formData.type !== 'client') {
      rules['email'] = formData.email;
      rules['password'] = formData.password;
    }

    try {
      if (isEditing) {
        await http.put(`/users/${editingUserId}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        Swal.fire('Succès', 'Utilisateur modifié avec succès !', 'success');
      } else {
        await http.post('/users', formData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        Swal.fire('Succès', 'Utilisateur créé avec succès !', 'success');
      }
      fetchUsers();
    } catch (error) {
      Swal.fire('Erreur', 'Échec de la soumission du formulaire.', 'error');
    }

    handleCloseModal();
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Es-tu sûr ?',
      text: "Cette action supprimera l'utilisateur définitivement !",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
    }).then((result) => {
      if (result.isConfirmed) {
        http.delete(`/api/users/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then(() => {
          Swal.fire('Supprimé !', "L'utilisateur a été supprimé.", 'success');
          fetchUsers();
        })
        .catch(() => {
          Swal.fire('Erreur', "Échec de la suppression de l'utilisateur.", 'error');
        });
      }
    });
  };

  const handleViewDetails = (user) => {
    Swal.fire({
      title: `Détails de ${user.name}`,
      html: `<p><strong>Téléphone :</strong> ${user.telephone}</p>
             <p><strong>Numéro CNI :</strong> ${user.numero_cni}</p>
             <p><strong>Email :</strong> ${user.email || 'Non spécifié'}</p>
             <p><strong>Type :</strong> ${user.type}</p>`,
    });
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Gestion des Utilisateurs</h2>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <Button variant="primary" onClick={() => handleShowModal()}>
          <FaPlus /> Ajouter un Utilisateur
        </Button>
        {errorMessage && <Alert variant="danger" className="mb-0">{errorMessage}</Alert>}
      </div>

      <Table striped bordered hover responsive className="mb-5">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nom</th>
            <th>Téléphone</th>
            <th>Type</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.name}</td>
              <td>{user.telephone}</td>
              <td>{user.type}</td>
              <td>
                <div className="d-flex justify-content-center">
                  <Button variant="warning" className="btn-sm mb-1" onClick={() => handleShowModal(user)}>
                    <FaEdit />
                  </Button>
                  <Button variant="danger" className="btn-sm mb-1" onClick={() => handleDelete(user.id)}>
                    <FaTrashAlt />
                  </Button>
                  <Button variant="secondary" className="btn-sm mb-1" onClick={() => handleViewDetails(user)}>
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
          <Modal.Title>{isEditing ? 'Modifier Utilisateur' : 'Ajouter Utilisateur'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form noValidate>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nom</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Entrez le nom"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Téléphone</Form.Label>
                  <Form.Control
                    type="text"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleInputChange}
                    placeholder="Entrez le téléphone"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Numéro CNI</Form.Label>
                  <Form.Control
                    type="text"
                    name="numero_cni"
                    value={formData.numero_cni}
                    onChange={handleInputChange}
                    placeholder="Entrez le numéro CNI"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Entrez l'email"
                    required={formData.type !== 'client'}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Mot de passe</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Entrez le mot de passe"
                required={formData.type !== 'client'}
                minLength="8"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Confirmer le mot de passe</Form.Label>
              <Form.Control
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirmez le mot de passe"
                required={formData.type !== 'client'}
                minLength="8"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Type</Form.Label>
              <Form.Select name="type" value={formData.type} onChange={handleInputChange}>
                <option value="agent">Agent</option>
                <option value="client">Client</option>
                <option value="admin">Admin</option>
                <option value="agent_om">Agent OM</option>

              </Form.Select>
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

export default UsersCrud;
