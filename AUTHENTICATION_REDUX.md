# Système d'Authentification avec Redux Toolkit

## 🔧 Architecture Refactorisée

L'application a été refactorisée pour utiliser **Redux Toolkit** au lieu de l'approche basée sur les hooks React. Cette nouvelle architecture offre une gestion d'état plus robuste et prévisible.

## 📁 Structure des Fichiers

```
src/
├── api/
│   ├── apiClient.js         # Configuration Axios avec intercepteurs
│   └── authService.js       # Services d'API pour l'authentification
├── components/
│   ├── ProtectedRoute.jsx   # Protection des routes authentifiées
│   └── PublicRoute.jsx      # Routes publiques avec redirection
├── hooks/
│   └── useAuth.js           # Hook personnalisé pour Redux
├── store/
│   ├── index.js             # Configuration du store Redux
│   └── slices/
│       └── authSlice.js     # Slice d'authentification
└── ...
```

## 🔐 Fonctionnalités Principales

### 1. **Gestion d'État Centralisée**
- Redux Toolkit pour une gestion d'état prévisible
- Persistence automatique dans localStorage
- État synchronisé entre tous les composants

### 2. **Actions Asynchrones (Thunks)**
- `loginUser` : Connexion utilisateur
- `logoutUser` : Déconnexion sécurisée
- `getCurrentUser` : Récupération des données utilisateur
- `getCurrentCaisse` : Récupération des données de caisse
- `refreshToken` : Rafraîchissement automatique du token

### 3. **Protection des Routes**
```jsx
// Route protégée pour admin uniquement
<ProtectedRoute allowedRoles={['admin']}>
  <AdminComponent />
</ProtectedRoute>

// Route publique avec redirection si connecté
<PublicRoute>
  <LoginComponent />
</PublicRoute>
```

### 4. **Intercepteurs Axios**
- Ajout automatique du token aux requêtes
- Gestion des erreurs 401 (token expiré)
- Nettoyage automatique du localStorage

## 🎯 Utilisation

### Hook useAuth
```jsx
import { useAuth } from '../hooks/useAuth';

function MonComposant() {
  const { 
    user, 
    isAuthenticated, 
    isLoading, 
    error,
    login, 
    logout,
    hasRole,
    hasPermission 
  } = useAuth();

  // Utilisation...
}
```

### Actions Redux Directes
```jsx
import { useDispatch } from 'react-redux';
import { loginUser, logoutUser } from '../store/slices/authSlice';

function MonComposant() {
  const dispatch = useDispatch();
  
  const handleLogin = (credentials) => {
    dispatch(loginUser(credentials));
  };
}
```

## 🔄 Flux d'Authentification

1. **Connexion** :
   ```
   Formulaire → loginUser thunk → API call → État Redux → localStorage → Navigation
   ```

2. **Protection des routes** :
   ```
   Navigation → ProtectedRoute → Vérification Redux → Autorisation/Redirection
   ```

3. **Déconnexion** :
   ```
   Bouton → logoutUser thunk → API call → Nettoyage Redux/localStorage → Redirection
   ```

## 🛡️ Sécurité

- ✅ Validation des tokens côté client
- ✅ Expiration automatique des sessions
- ✅ Nettoyage sécurisé lors de la déconnexion
- ✅ Gestion des erreurs 401/403
- ✅ Protection CSRF avec tokens

## 🆕 Améliorations Apportées

1. **Performance** : État centralisé évite les re-rendus inutiles
2. **Debugging** : Redux DevTools pour inspecter l'état
3. **Prévisibilité** : Actions synchrones et asynchrones tracées
4. **Maintenabilité** : Code mieux structuré et réutilisable
5. **Extensibilité** : Facile d'ajouter de nouvelles fonctionnalités

## 🔧 Configuration

### Variables d'Environnement
```env
VITE_API_URL=http://127.0.0.1:8000/api
```

### Store Redux
Le store est configuré avec :
- Redux DevTools (développement)
- Middleware pour les actions asynchrones
- Sérialisation automatique de l'état

## 📝 Prochaines Étapes

- [ ] Implémentation du refresh token automatique
- [ ] Gestion avancée des permissions/rôles
- [ ] Tests unitaires pour les slices et services
- [ ] Mise en cache optimisée des données
- [ ] Gestion hors-ligne avec Redux Persist

## 🐛 Debugging

Pour débugger l'authentification :
1. Ouvrir Redux DevTools dans le navigateur
2. Surveiller les actions `auth/login`, `auth/logout`
3. Vérifier l'état dans l'onglet State
4. Analyser le localStorage dans les DevTools du navigateur