function Footer() {
  const footerStyle = {
    backgroundColor: '#1976d2', // Couleur de fond
    color: 'white', // Couleur du texte
    padding: '5px 0', // Réduit l'espacement vertical
    position: 'fixed', // Fixer le footer en bas de l'écran
    bottom: 0, // Coller au bas de l'écran
    width: '100%', // Prendre toute la largeur
    zIndex: 1000, // S'assurer qu'il reste au-dessus du contenu
    fontSize: '11px', // Taille de police réduite
    height: '30px', // Hauteur fixe réduite
  };

  return (
    <footer style={footerStyle}>
      <div className="container-fluid">
        <div className="row justify-content-center align-items-center" style={{ height: '100%' }}>
          <div className="col-12 text-center">
            <p className="mb-0" style={{ color: 'white' }}>
              <strong>Papou Service</strong> &copy; {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

