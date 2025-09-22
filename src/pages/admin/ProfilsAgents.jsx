import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  Avatar,
  Chip,
  Alert,
  CircularProgress,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Person,
  Visibility,
  Phone,
  Email,
  Search,
  Assessment,
} from '@mui/icons-material';
import apiClient from '../../api/apiClient';

const ProfilsAgents = () => {
  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.auth);
  
  // États pour la gestion des données
  const [agents, setAgents] = useState([]);
  const [filteredAgents, setFilteredAgents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Charger les agents au montage du composant
  useEffect(() => {
    loadAgents();
  }, []);

  // Filtrer les agents quand le terme de recherche change
  useEffect(() => {
    if (searchTerm) {
      const filtered = agents.filter(agent => 
        agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.telephone.includes(searchTerm)
      );
      setFilteredAgents(filtered);
    } else {
      setFilteredAgents(agents);
    }
  }, [searchTerm, agents]);

  const loadAgents = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await apiClient.get('/users');
      const agentsData = response.data.filter(u => u.type === 'agent');
      setAgents(agentsData);
      setFilteredAgents(agentsData);
    } catch (err) {
      const apiMessage = err.response?.data?.message || err.message;
      setError(apiMessage || 'Erreur lors du chargement des agents');
      console.error('Erreur agents:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* En-tête */}
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          👥 Profils des Agents
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Consultez les profils détaillés de tous vos agents
        </Typography>
      </Paper>

      {/* Barre de recherche */}
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Rechercher un agent par nom, email ou téléphone..."
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {/* Messages d'erreur */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Loading */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Liste des agents */}
      {!loading && (
        <>
          {/* Statistiques */}
          <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">
                {filteredAgents.length} agent(s) {searchTerm && `trouvé(s) pour "${searchTerm}"`}
              </Typography>
              <Button
                variant="outlined"
                startIcon={<Assessment />}
                onClick={() => navigate('/ad/bilan-agents')}
              >
                Voir Bilans
              </Button>
            </Box>
          </Paper>

          {/* Grille des agents */}
          <Grid container spacing={3}>
            {filteredAgents.map((agent) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={agent.id}>
                <Card elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    {/* Avatar et nom */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar 
                        sx={{ 
                          width: 50, 
                          height: 50, 
                          bgcolor: 'primary.main',
                          mr: 2 
                        }}
                      >
                        {agent.name.charAt(0)}
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" noWrap>
                          {agent.name}
                        </Typography>
                        <Chip 
                          label={agent.type} 
                          color="primary" 
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    </Box>

                    {/* Informations de contact */}
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Email fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" noWrap>
                          {agent.email}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Phone fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          {agent.telephone}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Informations supplémentaires */}
                    {agent.numero_cni && (
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                        CNI: {agent.numero_cni}
                      </Typography>
                    )}

                    {/* Dates */}
                    <Typography variant="caption" color="textSecondary">
                      Créé le: {new Date(agent.created_at).toLocaleDateString('fr-FR')}
                    </Typography>
                  </CardContent>

                  {/* Actions */}
                  <Box sx={{ p: 2, pt: 0 }}>
                    <Grid container spacing={1}>
                      <Grid item xs={6}>
                        <Button
                          fullWidth
                          variant="contained"
                          size="small"
                          startIcon={<Visibility />}
                          onClick={() => navigate(`/ad/profil-agent/${agent.id}`)}
                        >
                          Profil
                        </Button>
                      </Grid>
                      <Grid item xs={6}>
                        <Button
                          fullWidth
                          variant="outlined"
                          size="small"
                          startIcon={<Assessment />}
                          onClick={() => {
                            navigate('/ad/bilan-agents');
                            // On pourrait stocker l'ID de l'agent sélectionné dans le localStorage
                            localStorage.setItem('selectedAgentId', agent.id);
                          }}
                        >
                          Bilan
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Message si aucun agent trouvé */}
          {filteredAgents.length === 0 && !loading && (
            <Paper elevation={1} sx={{ p: 6, textAlign: 'center' }}>
              <Person sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h5" color="textSecondary" gutterBottom>
                {searchTerm ? 'Aucun agent trouvé' : 'Aucun agent disponible'}
              </Typography>
              <Typography variant="body1" color="textSecondary">
                {searchTerm 
                  ? `Aucun agent ne correspond à "${searchTerm}"`
                  : 'Il n\'y a actuellement aucun agent dans le système'
                }
              </Typography>
              {searchTerm && (
                <Button
                  variant="outlined"
                  onClick={() => setSearchTerm('')}
                  sx={{ mt: 2 }}
                >
                  Afficher tous les agents
                </Button>
              )}
            </Paper>
          )}
        </>
      )}
    </Container>
  );
};

export default ProfilsAgents;