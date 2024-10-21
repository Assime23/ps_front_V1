import { Link } from 'react-router-dom';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { FaCashRegister, FaExchangeAlt, FaCreditCard, FaUser, FaHandHoldingUsd, FaUndoAlt, FaMoneyCheckAlt } from 'react-icons/fa';  // Importation des icônes

const HomePage = () => {
  return (
    <Container className="py-5">
      <Row className="justify-content-center mb-4">
        <Col xs={12} md={8}>
          <h2 className="text-center mb-4">Bienvenue sur la plateforme de gestion d'entreprise</h2>
        </Col>
      </Row>
      <Row className="g-3">
        <Col xs={12} sm={6} md={4}>
          <Button as={Link} to="/ag/select-caisse" variant="outline-primary" className="w-100 py-3 d-flex align-items-center justify-content-center">
            <FaCashRegister className="me-2" /> Sélectionner une Caisse
          </Button>
        </Col>
        <Col xs={12} sm={6} md={4}>
          <Button as={Link} to="/ag/transfert-agent" variant="outline-primary" className="w-100 py-3 d-flex align-items-center justify-content-center">
            <FaExchangeAlt className="me-2" /> Transfert entre Agents
          </Button>
        </Col>
        <Col xs={12} sm={6} md={4}>
          <Button as={Link} to="/ag/autres-transfert" variant="outline-primary" className="w-100 py-3 d-flex align-items-center justify-content-center">
            <FaExchangeAlt className="me-2" /> Autres Transferts
          </Button>
        </Col>
        <Col xs={12} sm={6} md={4}>
          <Button as={Link} to="/ag/donner-credit" variant="outline-primary" className="w-100 py-3 d-flex align-items-center justify-content-center">
            <FaCreditCard className="me-2" /> Donner un Crédit
          </Button>
        </Col>
        <Col xs={12} sm={6} md={4}>
          <Button as={Link} to="/ag/rembourser-credit" variant="outline-primary" className="w-100 py-3 d-flex align-items-center justify-content-center">
            <FaUndoAlt className="me-2" /> Rembourser un Crédit
          </Button>
        </Col>
        <Col xs={12} sm={6} md={4}>
          <Button as={Link} to="/ag/retrait" variant="outline-primary" className="w-100 py-3 d-flex align-items-center justify-content-center">
            <FaHandHoldingUsd className="me-2" /> Retrait
          </Button>
        </Col>
        <Col xs={12} sm={6} md={4}>
          <Button as={Link} to="/ag/creecredit" variant="outline-primary" className="w-100 py-3 d-flex align-items-center justify-content-center">
            <FaMoneyCheckAlt className="me-2" /> Créer un Crédit
          </Button>
        </Col>
        <Col xs={12} sm={6} md={4}>
          <Button as={Link} to="/ag/profil" variant="outline-primary" className="w-100 py-3 d-flex align-items-center justify-content-center">
            <FaUser className="me-2" /> Profil de l'Utilisateur
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default HomePage;
