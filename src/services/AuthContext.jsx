import { createContext, useState } from "react";
import PropTypes from "prop-types"; // Importez prop-types

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState({});
    return (
        <AuthContext.Provider value={{ auth, setAuth }}>
            {children}
        </AuthContext.Provider>
    );
};

// Validation des props
AuthProvider.propTypes = {
    children: PropTypes.node.isRequired, // 'children' est obligatoire
};

export default AuthContext;
