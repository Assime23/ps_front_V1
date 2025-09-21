import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../css/Login.css';

const Login = () => {
    const { login, isLoading, error, clearAuthError, user } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    useEffect(() => {
        clearAuthError(); // Réinitialiser les erreurs au changement des champs
    }, [email, password, clearAuthError]);

    // Redirection automatique si l'utilisateur est déjà connecté
    useEffect(() => {
        if (user) {
            const redirectPath = user.type === 'admin' ? '/ad' : '/ag';
            navigate(redirectPath, { replace: true });
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const result = await login({ email, password });
            
            if (result.type === 'auth/login/fulfilled') {
                // La redirection sera gérée par l'effet ci-dessus
            }
        } catch (err) {
            console.error('Login error in handleSubmit:', err);
        }
    };

    return (
        <section>
            <div className="login-container">
                <form onSubmit={handleSubmit}>
                    <div className="logo-container">
                        <img src="/logo.png" alt="Logo de l'entreprise" className="logo" />
                    </div>
                    <h2>Bienvenue</h2>
                    <p>Veuillez vous connecter pour continuer</p>
                    <div>
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            autoComplete="off"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>
                    <div>
                        <label htmlFor="password">Mot de passe</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>
                    <button type="submit" disabled={isLoading}>
                        {isLoading ? 'Connexion en cours...' : 'Se connecter'}
                    </button>
                </form>
                {error && <p className="errmsg">{error}</p>}
            </div>
        </section>
    );
};

export default Login;
