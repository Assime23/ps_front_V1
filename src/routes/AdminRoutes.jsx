import { Routes, Route } from 'react-router-dom';
import RequireAuth from '../services/requireAuth';
import TYPE from '../constants/TYPE';
import Login from '../pages/Login';

const AdminRoutes = () => (
  <Routes>
    <Route element={<RequireAuth allowedTypes={[TYPE.admin]} />}>
      <Route path="dashboard" element={<Login />} />
      {/* Ajoutez plus de routes admin ici */}
    </Route>
  </Routes>
);

export default AdminRoutes;
