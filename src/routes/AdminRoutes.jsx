import { Routes, Route } from 'react-router-dom';
import Login from '../pages/Login';
import Template from '../composant/admin/Template';
import HomePage from '../pages/home';
import UserProfile from '../pages/profil/userProfile';
import UsersCrud from '../composant/admin/personnel/personnelTable';
import CaisseCrud from '../composant/admin/personnel/caisse';
import BilanAgents from '../pages/admin/BilanAgents';
import ProfilCompletAgent from '../pages/admin/ProfilCompletAgent';
import ProfilsAgents from '../pages/admin/ProfilsAgents';

const AdminRoutes = () => (
  <Routes>
    <Route path="dashboard" element={<Login />} />
    <Route path="/" element={<Template><HomePage /></Template>} />
    <Route path="/profil" element={<Template><UserProfile /></Template>} />
    <Route path="/users" element={<Template><UsersCrud /></Template>} />
    <Route path="/caisses" element={<Template><CaisseCrud /></Template>} />
    <Route path="/bilan-agents" element={<Template><BilanAgents /></Template>} />
    <Route path="/profils-agents" element={<Template><ProfilsAgents /></Template>} />
    <Route path="/profil-agent/:agentId" element={<Template><ProfilCompletAgent /></Template>} />
    {/* Ajoutez plus de routes admin ici */}
  </Routes>
);

export default AdminRoutes;
