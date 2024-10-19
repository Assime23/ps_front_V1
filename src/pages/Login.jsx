import  { useState, useEffect } from 'react';
import useAuthUser from '../services/useAuthUser';
import logo from '../../public/logo.png'
import '../css/Login.css';

const Login = () => {
    const { login } = useAuthUser();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errMsg, setErrMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);  // État pour le chargement

    useEffect(() => {
        setErrMsg('');  // Réinitialiser le message d'erreur si l'email ou le mot de passe change
    }, [email, password]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);  // Commence le chargement
        try {
            await login({ email, password });

            // Ajout d'un délai pour simuler le temps d'enregistrement dans le localStorage
         /*   setTimeout(() => {
                navigate('/');  // Rediriger après l'enregistrement réussi dans le localStorage
            }, 100);  // Délai d'attente (ajustez la durée selon vos besoins)
            */
        } catch (err) {
            console.error('Login error in handleSubmit:', err);
            setIsLoading(false);  // Arrête le chargement en cas d'erreur
            if (!err.response) {
                setErrMsg('Le serveur backend ne fonctionne pas');
            } else if (err.response.status === 400) {
                setErrMsg('Email ou mot de passe manquant');
            } else if (err.response.status === 401) {
                setErrMsg('Non autorisé. Vérifiez vos identifiants');
            } else {
                setErrMsg('Échec de la connexion');
            }
        }
    };

    return (
        <section>
            <div className="login-container">
                <form onSubmit={handleSubmit}>
                    <div className="logo-container">
                        <img src={logo} alt="Logo de l'entreprise" className="logo" />
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
                            disabled={isLoading}  // Désactiver les champs pendant le chargement
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
                            disabled={isLoading}  // Désactiver les champs pendant le chargement
                        />
                    </div>
                    <button type="submit" disabled={isLoading}>
                        {isLoading ? 'Connexion en cours...' : 'Se connecter'}
                    </button>
                </form>
                {errMsg && <p className="errmsg">{errMsg}</p>}
            </div>
        </section>
    );
};

export default Login;
