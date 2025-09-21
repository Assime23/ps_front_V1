import { Routes, Route } from 'react-router-dom';
import Template from '../composant/agent/home/Template';
import SelectCaisse from '../pages/SelectCaisse';
import PageError from '../pages/pageError';
import TransferAgent from '../pages/TransferAgent';
import AutresTransfert from '../pages/autresTransfert';
import DonnerCredit from '../pages/donnerCredit';
import RembourserCredit from '../pages/rembourserCredit';
import Retrait from '../pages/retrait';
import UserProfile from '../pages/profil/userProfile';
import CreerCredit from '../pages/creerCredit';
import HomePage from '../pages/home';

const AgentRoutes = () => (
  <Routes>
    <Route path="/select-caisse" element={<Template><SelectCaisse /></Template>} />
    <Route path="/" element={<Template><HomePage /></Template>} />
    <Route path="/ma" element={<Template><SelectCaisse /></Template>} />
    <Route path="/transfert-agent" element={<Template><TransferAgent /></Template>} />
    <Route path="/autres-transfert" element={<Template><AutresTransfert /></Template>} />
    <Route path="/donner-credit" element={<Template><DonnerCredit /></Template>} />
    <Route path="/rembourser-credit" element={<Template><RembourserCredit /></Template>} />
    <Route path="/retrait" element={<Template><Retrait /></Template>} />
    <Route path="/creecredit" element={<Template><CreerCredit /></Template>} />
    <Route path="/profil" element={<Template><UserProfile /></Template>} />
    <Route path="*" element={<Template><PageError /></Template>} />
    {/* Ajoutez plus de routes agent ici */}
  </Routes>
);

export default AgentRoutes;
