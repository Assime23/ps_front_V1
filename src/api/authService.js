import apiClient from './apiClient';

class AuthService {
  // Connexion utilisateur
  async login(credentials) {
    try {
      const response = await apiClient.post('/login', credentials);
      const { access_token, token_type, expires_in } = response.data;
      
      // Récupérer les informations utilisateur
      const userResponse = await apiClient.post('/me', {}, {
        headers: {
          Authorization: `${token_type} ${access_token}`
        }
      });
      const user = userResponse.data;

      // Récupérer les informations de la caisse courante
      let caisseData = null;
      try {
        const caisseResponse = await apiClient.get('/ma-caisse', {
          headers: {
            Authorization: `${token_type} ${access_token}`
          }
        });
        caisseData = caisseResponse.data;
      } catch (caisseError) {
        console.error('Error fetching caisse courante:', caisseError);
      }

      return {
        user,
        token: access_token,
        tokenType: token_type,
        expiresIn: expires_in,
        caisse: caisseData
      };
    } catch (error) {
      throw error;
    }
  }

  // Déconnexion
  async logout() {
    try {
      await apiClient.post('/logout');
    } catch (error) {
      console.error('Logout error:', error);
      // Même en cas d'erreur, on procède à la déconnexion locale
    }
  }

  // Rafraîchir le token (si supporté par l'API)
  async refreshToken() {
    try {
      const response = await apiClient.post('/refresh');
      const { access_token, expires_in } = response.data;
      return {
        token: access_token,
        expiresIn: expires_in
      };
    } catch (error) {
      throw error;
    }
  }

  // Récupérer les informations utilisateur
  async getCurrentUser() {
    try {
      const response = await apiClient.post('/me');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Récupérer les informations de la caisse
  async getCurrentCaisse() {
    try {
      const response = await apiClient.get('/ma-caisse');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default new AuthService();