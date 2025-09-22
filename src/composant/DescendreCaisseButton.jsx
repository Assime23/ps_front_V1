import { useState } from 'react';
import { Button, Modal, Form } from 'react-bootstrap';
import Swal from 'sweetalert2';
import useAuthUser from '../services/useAuthUser';

const DescendreCaisseButton = ({ setLibelleCaisse }) => {
  const { http } = useAuthUser();
  const [show, setShow] = useState(false);
  const [formData, setFormData] = useState({
    stock_dexante_caisse: 0,
    stock_dexante_mp_1: 0,
    stock_dexante_mp_2: 0,
    stock_dexante_mp_3: 0,
    stock_dexante_mp_4: 0,
    liquidite_descente: 0,
  });

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleDescendreCaisse = async () => {
    try {
      // Fenêtre de confirmation des informations saisies
      const result = await Swal.fire({
        title: 'Confirmez-vous la descente de la caisse?',
        html: `
          <p><strong>Stock Caisse:</strong> ${formData.stock_dexante_caisse} FCFA</p>
          <p><strong>Stock MP 1:</strong> ${formData.stock_dexante_mp_1} FCFA</p>
          <p><strong>Stock MP 2:</strong> ${formData.stock_dexante_mp_2} FCFA</p>
          <p><strong>Stock MP 3:</strong> ${formData.stock_dexante_mp_3} FCFA</p>
          <p><strong>Stock MP 4:</strong> ${formData.stock_dexante_mp_4} FCFA</p>
          <p><strong>Liquidité Descente:</strong> ${formData.liquidite_descente} FCFA</p>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Confirmer',
        cancelButtonText: 'Annuler',
      });

      if (result.isConfirmed) {
        // Si l'utilisateur confirme, envoyer les données
        const response = await http.post('/descendre-caisse', formData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        Swal.fire({
          title: 'Succès',
          text: response.data.message,
          icon: 'success',
        });

        // Réinitialiser les champs et fermer le modal
        localStorage.removeItem('selectedCaisse');
        localStorage.removeItem('noteId');
        localStorage.removeItem('selectedCaisseLibelle');
        
        // Déclencher l'événement de changement de caisse
        window.dispatchEvent(new Event('caisseChanged'));
        
        setLibelleCaisse('');
        handleClose();
      }
    } catch (error) {
      Swal.fire({
        title: 'Erreur',
        text: error.response?.data?.error || 'Erreur lors de la descente de la caisse.',
        icon: 'error',
      });
    }
  };

  return (
    <>
      <a href="#" onClick={handleShow} className="dropdown-item">
        Descendre Caisse
      </a>

      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Descendre la Caisse</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="stock_dexante_caisse">
              <Form.Label>Stock caisse</Form.Label>
              <Form.Control
                type="number"
                name="stock_dexante_caisse"
                value={formData.stock_dexante_caisse}
                onChange={handleChange}
                placeholder="0 FCFA"
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="stock_dexante_mp_1">
              <Form.Label>Stock MP 1</Form.Label>
              <Form.Control
                type="number"
                name="stock_dexante_mp_1"
                value={formData.stock_dexante_mp_1}
                onChange={handleChange}
                placeholder="0 FCFA"
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="stock_dexante_mp_2">
              <Form.Label>Stock MP 2</Form.Label>
              <Form.Control
                type="number"
                name="stock_dexante_mp_2"
                value={formData.stock_dexante_mp_2}
                onChange={handleChange}
                placeholder="0 FCFA"
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="stock_dexante_mp_3">
              <Form.Label>Stock MP 3</Form.Label>
              <Form.Control
                type="number"
                name="stock_dexante_mp_3"
                value={formData.stock_dexante_mp_3}
                onChange={handleChange}
                placeholder="0 FCFA"
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="stock_dexante_mp_4">
              <Form.Label>Stock MP 4</Form.Label>
              <Form.Control
                type="number"
                name="stock_dexante_mp_4"
                value={formData.stock_dexante_mp_4}
                onChange={handleChange}
                placeholder="0 FCFA"
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="liquidite_descente">
              <Form.Label>Liquidité descente</Form.Label>
              <Form.Control
                type="number"
                name="liquidite_descente"
                value={formData.liquidite_descente}
                onChange={handleChange}
                placeholder="0 FCFA"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Annuler
          </Button>
          <Button variant="primary" onClick={handleDescendreCaisse}>
            Descendre
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default DescendreCaisseButton;
