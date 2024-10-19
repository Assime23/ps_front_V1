import PropTypes from 'prop-types';
import NavbarAgents from './Navbar';
import Footer from './AgentFooter';

function Template({ children }) {
  return (
    <div className="d-flex flex-column vh-100">
      {/* Navbar en haut */}
      <NavbarAgents />

      {/* Contenu principal */}
      <div className="flex-grow-1 container-fluid p-3 overflow-auto" style={{
        paddingTop: '64px', // Ajuster selon la hauteur de votre navbar
        margin: '0 auto',
        maxWidth: '1200px', // Limite la largeur max sur les grands écrans
      }}>
        {children}
      </div>

      {/* Footer en bas */}
      <Footer />
    </div>
  );
}


// Définition des types de props
Template.propTypes = {
  children: PropTypes.node.isRequired, // 'children' peut être de n'importe quel type React
};

export default Template;
