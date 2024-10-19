import PropTypes from 'prop-types';
import { createContext, useState } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [UserType, setUserType] = useState('');
    
    return (
        <UserContext.Provider value={{ UserType, setUserType }}>
            {children}
        </UserContext.Provider>
    );
};

// Définition des types de props
UserProvider.propTypes = {
    children: PropTypes.node.isRequired, // 'children' peut être de n'importe quel type React
};

export default UserContext;
