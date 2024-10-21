import { Link } from 'react-router-dom'; // Importer Link depuis react-router-dom
function Footer() {
  const footerStyle = {
    backgroundColor: '#1976d2', // Couleur de fond
    color: 'white', // Couleur du texte
    padding: '10px 0', // Ajuster l'espacement vertical
    position: 'fixed', // Fixer le footer en bas de l'écran
    bottom: 0, // Coller au bas de l'écran
    width: '100%', // Prendre toute la largeur
    zIndex: 1000, // S'assurer qu'il reste au-dessus du contenu
    fontSize: '12px', // Taille de police plus petite
  };

  return (
    <footer style={footerStyle}>
      <div className="container-fluid">
        <div className="row text-muted justify-content-between align-items-center">
          <div className="col-12 col-md-6 text-start mb-1 mb-md-0">
            <p className="mb-0">
              <Link className="text-muted" to="https://adminkit.io/" target="_blank">
                <strong>Papou Service</strong>
              </Link> &copy; {new Date().getFullYear()}
            </p>
          </div>
          <div className="col-12 col-md-6 text-end">
            <ul className="list-inline mb-0">
              <li className="list-inline-item">
                <Link className="text-muted" to="https://adminkit.io/" target="_blank">Support</Link>
              </li>
              <li className="list-inline-item">
                <Link className="text-muted" to="" target="_blank">Centre d&apos;aide</Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

