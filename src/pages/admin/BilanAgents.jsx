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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  Divider,
  Avatar,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  TrendingUp,
  TrendingDown,
  AccountBalance,
  Person,
  DateRange,
  FilterList,
  Refresh,
  Visibility,
  Download,
} from '@mui/icons-material';
import apiClient from '../../api/apiClient';

const BilanAgents = () => {
  const { user, token } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  
  // États pour la gestion des données
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [bilanData, setBilanData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // États pour les filtres
  const [filters, setFilters] = useState({
    date_debut: '',
    date_fin: '',
    mois: '',
    annee: new Date().getFullYear(),
    caisse_id: '',
    status: '',
    page: 1,
    limite: 10
  });
  
  // États pour les caisses
  const [caisses, setCaisses] = useState([]);

  const isSelfAgent = user?.type === 'agent';

  // Charger les agents au montage du composant
  useEffect(() => {
    loadAgents();
    loadCaisses();
    
    // Vérifier s'il y a un agent présélectionné dans le localStorage
    const preSelectedAgentId = localStorage.getItem('selectedAgentId');
    if (preSelectedAgentId) {
      setSelectedAgent(preSelectedAgentId);
      localStorage.removeItem('selectedAgentId'); // Nettoyer après utilisation
    }
  }, []);

  // Auto-select self if agent
  useEffect(() => {
    if (isSelfAgent && user?.id) {
      if (!selectedAgent) setSelectedAgent(user.id);
    }
  }, [isSelfAgent, user?.id]);

  // Charger le bilan quand un agent est sélectionné
  useEffect(() => {
    if (selectedAgent) {
      loadBilanAgent(selectedAgent);
    }
  }, [selectedAgent]);

  const loadAgents = async () => {
    try {
      const response = await apiClient.get('/users');
      const agentsData = response.data.filter(u => u.type === 'agent');
      setAgents(agentsData);
    } catch (err) {
      const apiMessage = err.response?.data?.message || err.message;
      setError(apiMessage || 'Erreur lors du chargement des agents');
      console.error('Erreur agents:', err);
    }
  };

  const loadCaisses = async () => {
    try {
      const response = await apiClient.get('/getcaisse');
      setCaisses(response.data);
    } catch (err) {
      const apiMessage = err.response?.data?.message || err.message;
      console.error('Erreur caisses:', apiMessage, err);
    }
  };

  const loadBilanAgent = async (agentId, customFilters = {}) => {
    if (!agentId) return;
    
    setLoading(true);
    setError('');
    
    try {
      const params = new URLSearchParams();
      const finalFilters = { ...filters, ...customFilters };
      
      Object.entries(finalFilters).forEach(([key, value]) => {
        if (value && value !== '') {
          params.append(key, value);
        }
      });

      const response = await apiClient.get(`/utilisateur/${agentId}/bilan?${params.toString()}`);
      
      // Vérifier si l'API retourne success: false
      if (response.data.success === false) {
        setBilanData({
          utilisateur: agents.find(agent => agent.id == agentId),
          resume_general: {
            total_notes: 0,
            notes_actives: 0,
            notes_terminees: 0,
            benefice_total: 0,
            perte_totale: 0,
            resultat_total: 0
          },
          bilans_notes: [],
          pagination: {
            page_actuelle: 1,
            limite_par_page: 10,
            total_notes: 0,
            notes_sur_cette_page: 0
          }
        });
        setError(response.data.message || 'Aucune note trouvée pour cet utilisateur avec ces critères');
      } else {
        setBilanData(response.data);
        setError(''); // Réinitialiser l'erreur en cas de succès
      }
    } catch (err) {
      // Utiliser le message de l'API si disponible
      const apiMessage = err.response?.data?.message || err.message;
      setError(apiMessage || 'Erreur lors du chargement du bilan');
      console.error('Erreur bilan:', err);
      setBilanData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAgentChange = (agentId) => {
    setSelectedAgent(agentId);
    setBilanData(null);
    if (agentId) {
      loadBilanAgent(agentId);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const applyFilters = () => {
    if (selectedAgent) {
      loadBilanAgent(selectedAgent);
    }
  };

  const resetFilters = () => {
    setFilters({
      date_debut: '',
      date_fin: '',
      mois: '',
      annee: new Date().getFullYear(),
      caisse_id: '',
      status: '',
      page: 1,
      limite: 10
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    // Gérer les différents formats de date
    let date;
    if (dateString.includes('T')) {
      // Format ISO avec T (2025-09-22T00:58:17.000000Z)
      date = new Date(dateString);
    } else {
      // Format simple (2025-09-22 00:09:11)
      date = new Date(dateString.replace(' ', 'T'));
    }
    
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'success';
      case 'terminée': return 'default';
      case 'terminé': return 'default';
      default: return 'default';
    }
  };

  const getResultatColor = (resultat) => {
    if (resultat > 0) return 'success';
    if (resultat < 0) return 'error';
    return 'default';
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* En-tête */}
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {isSelfAgent ? '📊 Mon Bilan' : '📊 Bilan des Agents'}
        </Typography>
        <Typography variant="body1" color="textSecondary">
          {isSelfAgent ? 'Vue synthétique de vos performances personnelles' : 'Consultez les performances et bilans financiers de vos agents'}
        </Typography>
      </Paper>

      {/* Sélection de l'agent (cachée pour un agent) */}
      {!isSelfAgent && (
        <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Sélectionner un agent</InputLabel>
                <Select
                  value={selectedAgent}
                  onChange={(e) => handleAgentChange(e.target.value)}
                  label="Sélectionner un agent"
                >
                  <MenuItem value="">
                    <em>Choisir un agent...</em>
                  </MenuItem>
                  {agents.map((agent) => (
                    <MenuItem key={agent.id} value={agent.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 24, height: 24 }}>
                          <Person fontSize="small" />
                        </Avatar>
                        {agent.name} - {agent.email}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={() => selectedAgent && loadBilanAgent(selectedAgent)}
                  disabled={!selectedAgent || loading}
                >
                  Actualiser
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Person />}
                  onClick={()=> navigate(`/ag/mon-profil-complet`)}
                  disabled={!selectedAgent && !isSelfAgent}
                >
                  Profil Complet
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Download />}
                  disabled={!bilanData}
                >
                  Exporter
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Filtres */}
      {selectedAgent && (
        <Accordion sx={{ mb: 3 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FilterList />
              <Typography>Filtres avancés</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  type="date"
                  label="Date début"
                  value={filters.date_debut}
                  onChange={(e) => handleFilterChange('date_debut', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  type="date"
                  label="Date fin"
                  value={filters.date_fin}
                  onChange={(e) => handleFilterChange('date_fin', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Mois</InputLabel>
                  <Select
                    value={filters.mois}
                    onChange={(e) => handleFilterChange('mois', e.target.value)}
                    label="Mois"
                  >
                    <MenuItem value="">Tous les mois</MenuItem>
                    {Array.from({ length: 12 }, (_, i) => (
                      <MenuItem key={i + 1} value={i + 1}>
                        {new Date(2024, i).toLocaleDateString('fr-FR', { month: 'long' })}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  type="number"
                  label="Année"
                  value={filters.annee}
                  onChange={(e) => handleFilterChange('annee', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Caisse</InputLabel>
                  <Select
                    value={filters.caisse_id}
                    onChange={(e) => handleFilterChange('caisse_id', e.target.value)}
                    label="Caisse"
                  >
                    <MenuItem value="">Toutes les caisses</MenuItem>
                    {caisses.map((caisse) => (
                      <MenuItem key={caisse.id} value={caisse.id}>
                        {caisse.libelle}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Statut</InputLabel>
                  <Select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    label="Statut"
                  >
                    <MenuItem value="">Tous les statuts</MenuItem>
                    <MenuItem value="active">Actives</MenuItem>
                    <MenuItem value="terminee">Terminées</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    onClick={applyFilters}
                    disabled={loading}
                  >
                    Appliquer les filtres
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={resetFilters}
                  >
                    Réinitialiser
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      )}

      {/* Messages d'information et d'erreur */}
      {error && (
        <Alert 
          severity={error.includes('Aucune note trouvée') ? 'info' : 'error'} 
          sx={{ mb: 3 }}
        >
          {error}
        </Alert>
      )}

      {/* Loading */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Résultats du bilan */}
      {bilanData && !loading && (
        <>
          {/* Résumé général */}
          <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              📈 Résumé Général - {bilanData.utilisateur?.name}
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={2.4}>
                <Card variant="outlined">
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary">
                      {bilanData.resume_general?.total_notes || 0}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Total Notes
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <Card variant="outlined">
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="success.main">
                      {bilanData.resume_general?.notes_actives || 0}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Notes Actives
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <Card variant="outlined">
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="textSecondary">
                      {bilanData.resume_general?.notes_terminees || 0}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Notes Terminées
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <Card variant="outlined">
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                      <TrendingUp color="success" />
                      <Typography variant="h6" color="success.main">
                        {formatCurrency(bilanData.resume_general?.benefice_total)}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="textSecondary">
                      Bénéfices
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <Card variant="outlined">
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                      <TrendingDown color="error" />
                      <Typography variant="h6" color="error.main">
                        {formatCurrency(bilanData.resume_general?.perte_totale)}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="textSecondary">
                      Pertes
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            
            {/* Résultat total */}
            <Divider sx={{ my: 3 }} />
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color={getResultatColor(bilanData.resume_general?.resultat_total)}>
                Résultat Total: {formatCurrency(bilanData.resume_general?.resultat_total)}
              </Typography>
            </Box>
          </Paper>

          {/* Détail des notes */}
          <Paper elevation={1} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap:'wrap', gap:1 }}>
              <Typography variant="h5" sx={{ mr:2 }}>
                📋 Détail des Notes
              </Typography>
              <Box sx={{ display:'flex', alignItems:'center', gap:1, flexWrap:'wrap', ml:'auto' }}>
                {bilanData.pagination && (
                  <Chip 
                    label={`${bilanData.pagination.notes_sur_cette_page} / ${bilanData.pagination.total_notes}`}
                    variant="outlined"
                    size="small"
                  />
                )}
                {isSelfAgent && (
                  <Box sx={{ display:'flex', gap:1, flexWrap:'wrap' }}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Refresh />}
                      onClick={()=> loadBilanAgent(user.id)}
                      disabled={loading}
                    >
                      Actualiser
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<Person />}
                      onClick={()=> navigate('/ag/mon-profil-complet')}
                    >
                      Profil Complet
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<Download />}
                      disabled={!bilanData}
                    >
                      Exporter
                    </Button>
                  </Box>
                )}
              </Box>
            </Box>
            
            {bilanData.bilans_notes && bilanData.bilans_notes.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Note</TableCell>
                      <TableCell>Caisse</TableCell>
                      <TableCell>Période</TableCell>
                      <TableCell>Statut</TableCell>
                      <TableCell align="right">Bénéfices</TableCell>
                      <TableCell align="right">Pertes</TableCell>
                      <TableCell align="right">Résultat</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {bilanData.bilans_notes.map((note) => (
                      <TableRow key={note.note_id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <AccountBalance fontSize="small" />
                            Note #{note.note_id}
                          </Box>
                        </TableCell>
                        <TableCell>{note.caisse?.libelle || 'N/A'}</TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2">
                              Du: {formatDate(note.periode?.date_montee)}
                            </Typography>
                            {note.periode?.date_descente && (
                              <Typography variant="body2" color="textSecondary">
                                Au: {formatDate(note.periode.date_descente)}
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={note.periode?.status || 'N/A'}
                            color={getStatusColor(note.periode?.status?.toLowerCase())}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography color={note.resultat > 0 ? "success.main" : "text.secondary"}>
                            {note.resultat > 0 ? formatCurrency(note.resultat) : '0 F CFA'}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography color={note.resultat < 0 ? "error.main" : "text.secondary"}>
                            {note.resultat < 0 ? formatCurrency(Math.abs(note.resultat)) : '0 F CFA'}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography color={getResultatColor(note.resultat)}>
                            {formatCurrency(note.resultat)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Tooltip title="Voir profil complet">
                            <IconButton 
                              size="small"
                              onClick={() => navigate(`/ad/profil-agent/${selectedAgent}`)}
                            >
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <AccountBalance sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="textSecondary" gutterBottom>
                  Aucune note trouvée
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {error || 'Aucune note ne correspond aux critères sélectionnés pour cet agent.'}
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<FilterList />}
                  sx={{ mt: 2 }}
                  onClick={resetFilters}
                >
                  Réinitialiser les filtres
                </Button>
              </Box>
            )}
          </Paper>
        </>
      )}

      {/* Message si aucun agent sélectionné */}
      {!isSelfAgent && !selectedAgent && (
        <Paper elevation={1} sx={{ p: 6, textAlign: 'center' }}>
          <Person sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" color="textSecondary" gutterBottom>Sélectionnez un agent</Typography>
          <Typography variant="body1" color="textSecondary">Choisissez un agent dans la liste pour consulter son bilan financier</Typography>
        </Paper>
      )}
    </Container>
  );
};

export default BilanAgents;