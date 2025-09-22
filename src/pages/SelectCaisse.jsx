import { useState, useEffect } from 'react';
import { Container, Alert } from 'react-bootstrap';
import { 
  Card, 
  CardContent, 
  Typography, 
  TextField, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemText, 
  Box,
  Chip,
  Grid,
  Paper,
  IconButton,
  InputAdornment,
  Divider
} from '@mui/material';
import { Search, AccountBalance, Info, TrendingUp, Schedule, DateRange } from '@mui/icons-material';
import useAuthUser from '../services/useAuthUser';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

const SelectCaisse = () => {
  const [caisses, setCaisses] = useState([]);
  const [selectedCaisse, setSelectedCaisse] = useState(null);
  const [selectedCaisseLibelle, setSelectedCaisseLibelle] = useState('');
  const [libelle, setLibelle] = useState('');
  const [message, setMessage] = useState('');
  const [activeCaisse, setActiveCaisse] = useState(null); // Caisse active si elle existe
  const { http, token, fetchData } = useAuthUser();
  const navigate = useNavigate(); // Pour la redirection

  // Fonction pour vérifier si une caisse active existe
  const verifierCaisseActive = async () => {
    try {
      const response = await fetchData('get', '/ma-caisse');
      setActiveCaisse(response.data);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        // Si aucune caisse active n'est trouvée, rediriger vers la sélection
        setActiveCaisse(null);
      } else {
        setMessage('Erreur lors de la vérification de la caisse active.');
      }
    }
  };

  const rechercherCaisses = async () => {
    try {
      const response = await fetchData('get', '/rechercher-caisses', { libelle });
      setCaisses(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des caisses", error);
      setMessage('Erreur lors de la récupération des caisses disponibles.');
    }
  };

  useEffect(() => {
    verifierCaisseActive(); // Vérifier si une caisse active existe au montage
  }, []);

  useEffect(() => {
    rechercherCaisses(); // Rechercher les caisses
  }, [libelle]);

  // Fonction pour sélectionner une caisse
  const selectCaisse = (caisseId, caisseLibelle) => {
    Swal.fire({
      title: 'Confirmation',
      text: `Voulez-vous vraiment sélectionner la caisse : ${caisseLibelle} ?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, sélectionner',
      cancelButtonText: 'Annuler'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await http.post('/select-caisse', {
            caisse_id: caisseId
          }, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          setSelectedCaisse(caisseId);
          setSelectedCaisseLibelle(caisseLibelle);

          // Enregistrer dans le localStorage
          localStorage.setItem('selectedCaisse', caisseId);
          localStorage.setItem('selectedCaisseLibelle', caisseLibelle);
          localStorage.setItem('noteId', response.data.note_id);

          // Déclencher l'événement de changement de caisse
          window.dispatchEvent(new Event('caisseChanged'));

          Swal.fire({
            title: 'Succès!',
            text: `Caisse sélectionnée avec succès : ${caisseLibelle}`,
            icon: 'success',
            timer: 1000,
            showConfirmButton: false
          }).then(() => {
            navigate('/ag'); // Redirection après succès
          });

          rechercherCaisses(); // Recharger les caisses
        } catch (error) {
          Swal.fire({
            title: 'Erreur',
            text: 'Erreur lors de la sélection de la caisse.',
            icon: 'error',
            confirmButtonText: 'OK'
          });
          console.error("Erreur lors de la sélection de la caisse", error);
        }
      } else {
        Swal.fire({
          title: 'Annulé',
          text: 'La sélection de la caisse a été annulée.',
          icon: 'info',
          timer: 1000,
          showConfirmButton: false
        });
      }
    });
  };

  // Fonction utilitaire pour formater les montants en F CFA
  const formatCurrency = (value) => {
    if (value === null || value === undefined) return 'N/A';
    // Formater le nombre sans symbole monétaire puis ajouter "F CFA"
    const formattedNumber = new Intl.NumberFormat('fr-FR', { 
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
    return `${formattedNumber} F CFA`;
  };

  // Fonction pour formater la date avec l'heure
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long', 
        day: 'numeric'
      }),
      time: date.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    };
  };

  // Si une caisse active est présente, afficher ses informations
  if (activeCaisse) {
    const dateTime = formatDateTime(activeCaisse.date_monte);
    
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box textAlign="center" mb={4}>

          <Chip 
            label={activeCaisse.libelle} 
            color="primary" 
            size="large"
            sx={{ fontSize: '1.1rem', py: 2, mb: 2 }}
          />
          
          {/* Date et heure de montée en haut */}
          <Card elevation={2} sx={{ mb: 3, backgroundColor: 'primary.main', color: 'white' }}>
            <CardContent sx={{ py: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <DateRange />
                  <Typography variant="h6" fontWeight="bold">
                    {dateTime.date}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Schedule />
                  <Typography variant="h6" fontWeight="bold">
                    {dateTime.time}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Grid container spacing={3}>
          {/* Informations principales */}
          <Grid item xs={12} md={6}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  <TrendingUp sx={{ mr: 1 }} />
                  Stocks Montés
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body1">Stock Monté Caisse:</Typography>
                    <Chip label={formatCurrency(activeCaisse.stock_monte_caisse)} color="primary" />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body1">Liquidité Montée:</Typography>
                    <Chip label={formatCurrency(activeCaisse.liquidite_monte)} color="info" />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Stocks MP Montés */}
          <Grid item xs={12} md={6}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  Mobile Payment
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {[1, 2, 3, 4].map((mp) => (
                    <Box key={mp} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body1">Stock MP {mp}:</Typography>
                      <Chip 
                        label={formatCurrency(activeCaisse[`stock_monte_mp_${mp}`])} 
                        variant="outlined" 
                        size="small"
                        color="primary"
                      />
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Transactions et Transferts */}
          <Grid item xs={12}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  Transactions
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body1">Somme Retrait 10%:</Typography>
                    <Chip 
                      label={formatCurrency(activeCaisse.somme_retrait)} 
                      variant="outlined" 
                      size="small"
                      color={activeCaisse.somme_retrait ? "primary" : "default"}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body1">Somme Transfert Agent envoyé:</Typography>
                    <Chip 
                      label={formatCurrency(activeCaisse.somme_transfert)} 
                      variant="outlined" 
                      size="small"
                      color={activeCaisse.somme_transfert ? "primary" : "default"}
                    />
                   </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body1">Somme Transfert Agent Reçu:</Typography>
                    <Chip 
                      label={formatCurrency(activeCaisse.somme_transfert_recu)} 
                      variant="outlined" 
                      size="small"
                      color={activeCaisse.somme_transfert_recu ? "primary" : "default"}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body1">Autres Transferts:</Typography>
                    <Chip 
                      label={formatCurrency(activeCaisse.somme_autres_transfert)} 
                      variant="outlined" 
                      size="small"
                      color={activeCaisse.somme_autres_transfert ? "primary" : "default"}
                    />
                  </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body1">Autres Transferts Recu:</Typography>
                    <Chip 
                      label={formatCurrency(activeCaisse.somme_autres_transfert_recu)} 
                      variant="outlined" 
                      size="small"
                      color={activeCaisse.somme_autres_transfert_recu ? "primary" : "default"}
                    />
                       </Box>

     
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body1">Somme Crédit Reçu:</Typography>
                    <Chip 
                      label={formatCurrency(activeCaisse.somme_credit_recu)} 
                      variant="outlined" 
                      size="small"
                      color={activeCaisse.somme_credit_recu ? "primary" : "default"}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body1">Somme Crédit donné:</Typography>
                    <Chip 
                      label={formatCurrency(activeCaisse.somme_credit)} 
                      variant="outlined" 
                      size="small"
                      color={activeCaisse.somme_credit ? "primary" : "default"}
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    );
  }

  // Si aucune caisse active, afficher la sélection de caisse
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box textAlign="center" mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          <Search sx={{ mr: 2, verticalAlign: 'middle' }} />
          Sélectionner une Caisse
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Recherchez et sélectionnez votre caisse de travail
        </Typography>
      </Box>

      <Card elevation={3} sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Rechercher une caisse par libellé..."
            value={libelle}
            onChange={(e) => setLibelle(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />

          {caisses.length > 0 ? (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <AccountBalance sx={{ mr: 1 }} />
                Caisses disponibles ({caisses.length})
              </Typography>
              <List>
                {caisses.map((caisse) => (
                  <ListItem key={caisse.id} disablePadding>
                    <ListItemButton
                      onClick={() => selectCaisse(caisse.id, caisse.libelle)}
                      sx={{
                        borderRadius: 2,
                        mb: 1,
                        border: '1px solid',
                        borderColor: 'divider',
                        '&:hover': {
                          backgroundColor: 'primary.light',
                          borderColor: 'primary.main',
                        }
                      }}
                    >
                      <AccountBalance sx={{ mr: 2, color: 'primary.main' }} />
                      <ListItemText
                        primary={caisse.libelle}
                        primaryTypographyProps={{
                          fontWeight: 'bold',
                          fontSize: '1.1rem'
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Box>
          ) : (
            <Alert variant="warning" className="text-center">
              <Info sx={{ mr: 1, verticalAlign: 'middle' }} />
              Aucune caisse disponible pour le moment.
            </Alert>
          )}
        </CardContent>
      </Card>

      {message && (
        <Alert variant={message.includes("succès") ? "success" : "danger"} className="mt-3">
          {message}
        </Alert>
      )}
    </Container>
  );
};

export default SelectCaisse;
