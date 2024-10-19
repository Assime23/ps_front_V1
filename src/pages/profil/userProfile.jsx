import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Utilisation de useNavigate pour naviguer
import useAuthUser from '../../services/useAuthUser'; // Hook personnalisé pour récupérer les infos utilisateur
import Swal from 'sweetalert2'; // Import de SweetAlert2
import './UserProfile.css';

const UserProfile = () => {
    const { user, http } = useAuthUser(); // Récupération des infos utilisateur et du client HTTP personnalisé
    const id = user?.id;
    const navigate = useNavigate(); // Hook pour la navigation

    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        numero_cni: '',
        telephone: '',
        type: '',
        is_actif: false,
        created_at: ''
    });

    // Fonction pour récupérer les données utilisateur
    const fetchUser = async () => {
        try {
            const response = await http.get(`users/${id}`);
            const fetchedUser = response.data;
            setFormData({
                name: fetchedUser.name,
                email: fetchedUser.email,
                numero_cni: fetchedUser.numero_cni,
                telephone: fetchedUser.telephone,
                type: fetchedUser.type,
                is_actif: fetchedUser.is_actif,
                created_at: fetchedUser.created_at
            });
            setLoading(false); // Arrêter le chargement lorsque les données sont prêtes
        } catch (err) {
            console.error('Erreur lors de la récupération des données utilisateur:', err);
            Swal.fire({
                icon: 'error',
                title: 'Erreur',
                text: 'Erreur lors de la récupération des données utilisateur.'
            });
            setLoading(false);
        }
    };

    // Chargement des données utilisateur lors du montage du composant
    useEffect(() => {
        if (id) {
            fetchUser();
        }
    }, [id]);

    // Fonction pour gérer les changements dans le formulaire
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    // Fonction pour soumettre les modifications avec une confirmation
    const handleUpdate = async () => {
        Swal.fire({
            title: 'Êtes-vous sûr ?',
            text: "Vous êtes sur le point de mettre à jour votre profil.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Oui, mettre à jour !',
            cancelButtonText: 'Annuler'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const updatedUser = { ...formData };

                    // Appel à l'API pour mettre à jour l'utilisateur
                    const response = await http.put(`users/${user.id}`, updatedUser);

                    if (response.status === 200) {
                        Swal.fire({
                            icon: 'success',
                            title: 'Succès',
                            text: 'Profil mis à jour avec succès !'
                        });
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Erreur',
                            text: 'Erreur lors de la mise à jour du profil.'
                        });
                    }
                } catch (err) {
                    console.error('Erreur lors de la mise à jour du profil', err);
                    Swal.fire({
                        icon: 'error',
                        title: 'Erreur',
                        text: 'Erreur lors de la mise à jour du profil.'
                    });
                }
            }
        });
    };

    // Fonction pour annuler et revenir à la page précédente
    const handleCancel = () => {
        navigate(-1); // Revenir à la page précédente
    };

    // Gestion du chargement ou de l'erreur
    if (loading) return <div>Chargement...</div>;

    return (
        user && (
            <div className="container mt-4">
                <div className="row gutters">
                    {/* Section Profil utilisateur */}
                    <div className="col-xl-3 col-lg-3 col-md-12 col-sm-12 col-12">
                        <div className="card h-100">
                            <div className="card-body">
                                <div className="account-settings">
                                    <div className="user-profile text-center">
                                        <div className="user-avatar mb-3">
                                            <img
                                                src={user.image || "https://bootdey.com/img/Content/avatar/avatar7.png"}
                                                alt="Avatar utilisateur"
                                                className="rounded-circle"
                                                width="90"
                                                height="90"
                                            />
                                        </div>
                                        <h5 className="user-name">{formData.name}</h5>
                                        <h6 className="user-email">{formData.email}</h6>
                                    </div>
                                    <div className="about">
                                        <h5>À propos</h5>
                                        <p>{`Type d'utilisateur: ${formData.type}`}</p>
                                        <p>{`Numéro CNI: ${formData.numero_cni}`}</p>
                                        <p>{`Téléphone: ${formData.telephone}`}</p>
                                        <p>{`Compte actif: ${formData.is_actif ? 'Oui' : 'Non'}`}</p>
                                        <p>{`Créé le: ${new Date(user.created_at).toLocaleDateString()}`}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section Détails personnels */}
                    <div className="col-xl-9 col-lg-9 col-md-12 col-sm-12 col-12">
                        <div className="card h-100">
                            <div className="card-body">
                                <div className="row gutters">
                                    <div className="col-xl-12 mb-3">
                                        <h6 className="text-primary">Détails personnels</h6>
                                    </div>
                                    <div className="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-12">
                                        <div className="form-group">
                                            <label htmlFor="name">Nom complet</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-12">
                                        <div className="form-group">
                                            <label htmlFor="email">Email</label>
                                            <input
                                                type="email"
                                                className="form-control"
                                                id="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-12">
                                        <div className="form-group">
                                            <label htmlFor="numero_cni">Numéro CNI</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="numero_cni"
                                                value={formData.numero_cni}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-12">
                                        <div className="form-group">
                                            <label htmlFor="telephone">Téléphone</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="telephone"
                                                value={formData.telephone}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="row gutters">
                                    <div className="col-xl-12 text-right">
                                        <button type="button" className="btn btn-secondary" onClick={handleCancel}>Annuler</button>
                                        <button type="button" className="btn btn-primary" onClick={handleUpdate}>Mettre à jour</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    );
};

export default UserProfile;
