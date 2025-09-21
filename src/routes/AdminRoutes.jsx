import { Routes, Route } from 'react-router-dom';
import Login from '../pages/Login';
import Template from '../composant/admin/Template';
import HomePage from '../pages/home';
import UserProfile from '../pages/profil/userProfile';
import UsersCrud from '../composant/admin/personnel/personnelTable';
import CaisseCrud from '../composant/admin/personnel/caisse';

const AdminRoutes = () => (
  <Routes>
    <Route path="dashboard" element={<Login />} />
    <Route path="/" element={<Template><HomePage /></Template>} />
    <Route path="/profil" element={<Template><UserProfile /></Template>} />
    <Route path="/users" element={<Template><UsersCrud /></Template>} />
    <Route path="/caisses" element={<Template><CaisseCrud /></Template>} />
    {/* Ajoutez plus de routes admin ici */}
  </Routes>
);

export default AdminRoutes;
