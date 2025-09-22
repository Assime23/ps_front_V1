import PropTypes from 'prop-types';
import NavbarAgents from './Navbar';
import Footer from './AgentFooter';

function Template({ children }) {
  return (
    <div className="d-flex flex-column vh-100">
      {/* Navbar en haut */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000 }}>
        <NavbarAgents />
      </div>

      {/* Contenu principal */}
      <div className="flex-grow-1 container-fluid p-3" style={{
        paddingTop: '64px', // Ajuster selon la hauteur de votre navbar
        marginTop: '64px', // Pour ne pas que le contenu chevauche la navbar
        overflowY: 'auto', // Permettre le défilement du contenu sans affecter le footer
        maxWidth: '1200px', // Limite la largeur max sur les grands écrans
      }}>
        {children}
      </div>

      {/* Footer en bas */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000 }}>
        <Footer />
      </div>
    </div>
  );
}


// Définition des types de props
Template.propTypes = {
  children: PropTypes.node.isRequired, // 'children' peut être de n'importe quel type React
};

export default Template;
