import { Link, useLocation } from 'react-router-dom';
import './style.css';

function Sidebar({ visible }) {
    const location = useLocation();

    return (
        <nav id="sidebar" className={`sidebar js-sidebar position-fixed bg-light ${visible ? 'visible' : 'hidden'}`} style={{ width: '250px' }}>
            <div className="sidebar-content js-simplebar">
                <Link className="sidebar-brand" to="/#">
                    <img src="/logo.png" alt="Papou Service Logo" className="align-middle" style={{ height: 150, width: 150 }} />
                </Link>
                <ul className="sidebar-nav">

                    <li className={`sidebar-item ${location.pathname === '/' ? 'active' : ''}`}>
                        <Link className="sidebar-link" to="/">
                            <i className="align-middle" data-feather="sliders"></i> <span className="align-middle">Tableau de bord</span>
                        </Link>
                    </li>

                    <li className={`sidebar-item ${location.pathname === '/admin' ? 'active' : ''}`}>
                        <Link className="sidebar-link" to="/admin">
                            <i className="align-middle" data-feather="box"></i> <span className="align-middle">Personnels</span>
                        </Link>
                    </li>


                    <li className={`sidebar-item ${location.pathname === '/listes-caisses' ? 'active' : ''}`}>
                        <Link className="sidebar-link" to="/listes-caisses">
                            <i className="align-middle" data-feather="box"></i> <span className="align-middle">Caisse</span>
                        </Link>
                    </li>

                    <li className={`sidebar-item ${location.pathname === '/jour-comptes' ? 'active' : ''}`}>
                        <Link className="sidebar-link" to="/jour-comptes">
                            <i className="align-middle" data-feather="activity"></i> <span className="align-middle">Compte Journalier</span>
                        </Link>
                    </li>

                    <li className={`sidebar-item ${location.pathname === '/depense' ? 'active' : ''}`}>
                        <Link className="sidebar-link" to="/depense">
                            <i className="align-middle" data-feather="bar-chart"></i> <span className="align-middle">Depense</span>
                        </Link>
                    </li>

                    <li className={`sidebar-item ${location.pathname === '/historiques-comptes' ? 'active' : ''}`}>
                        <Link className="sidebar-link" to="/historiques-comptes">
                            <i className="align-middle" data-feather="trending-up"></i> <span className="align-middle">Historiques des comptes</span>
                        </Link>
                    </li>

                    <li className={`sidebar-item ${location.pathname === '/moyen-paiement' ? 'active' : ''}`}>
                        <Link className="sidebar-link" to="/moyen-paiement">
                            <i className="align-middle" data-feather="trending-up"></i> <span className="align-middle">Moyen de Paiement</span>
                        </Link>
                    </li>

                </ul>
                <div className="sidebar-cta">
                </div>
            </div>
        </nav>
    );
}

export default Sidebar;