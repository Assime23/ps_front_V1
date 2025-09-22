import React, { useState, useEffect, useCallback } from 'react';
import { Container, Typography, Grid, Paper, Box, CircularProgress } from '@mui/material';
import { CheckCircleOutline, AccountBalanceWallet, SwapHoriz, PostAdd } from '@mui/icons-material';
import { format } from 'date-fns';
import StatCard from '../../composant/admin/dashboard/StatCard';
import AgentFilters from '../../composant/agent/dashboard/AgentFilters';
import TimeSeriesChart from '../../composant/admin/dashboard/TimeSeriesChart';
import UsedCaissesTable from '../../composant/agent/dashboard/UsedCaissesTable';
import QuickActions from '../../composant/agent/dashboard/QuickActions';
import useAuthUser from '../../services/useAuthUser';

// Fonction utilitaire pour formater la date, placée à l'extérieur du composant
const formatDate = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.error("Date invalide reçue:", dateString);
      return dateString; // Retourne la chaîne originale si la date est invalide
    }
    return format(date, 'dd/MM/yyyy');
  } catch (e) {
    console.error("Erreur lors du formatage de la date:", e);
    return dateString; // En cas d'erreur, retourne la chaîne originale
  }
};

const AgentDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    startDate: new Date(),
    endDate: new Date(),
    caisseId: '',
  });
  const [evolutionData, setEvolutionData] = useState([]);
  const [caissesData, setCaissesData] = useState([]);
  const { http } = useAuthUser();

  const fetchStats = useCallback(async (currentFilters) => {
    try {
      setLoading(true);
      const params = {
        from: currentFilters.startDate ? format(currentFilters.startDate, 'yyyy-MM-dd') : undefined,
        to: currentFilters.endDate ? format(currentFilters.endDate, 'yyyy-MM-dd') : undefined,
        caisse_id: currentFilters.caisseId || undefined,
      };
      
      const [overviewResponse, timeSeriesResponse] = await Promise.all([
        http.get('/agent/stats/overview', { params }),
        http.get('/agent/stats/time-series', { params })
      ]);
      
      setStats(overviewResponse.data);
      setCaissesData(overviewResponse.data.caisses_utilisees || []);
      setEvolutionData(timeSeriesResponse.data || []);

    } catch (error) {
      console.error("Erreur lors de la récupération des statistiques de l'agent:", error);
      setStats(null); 
      setEvolutionData([]);
      setCaissesData([]);
    } finally {
      setLoading(false);
    }
  }, [http]);

  useEffect(() => {
    fetchStats(filters);
  }, [fetchStats, filters]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const formatCurrency = (value) => {
    if (typeof value !== 'number') return '...';
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(value);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
     
      <QuickActions />

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Filtres</Typography>
            <AgentFilters 
              onFilterChange={handleFilterChange} 
              loading={loading} 
              initialFilters={filters}
            />
          </Paper>
        </Grid>

        <Grid item xs={12}>
            <Typography variant="h5" gutterBottom>
              Ma Performance {stats?.period ? `du ${formatDate(stats.period.from)} au ${formatDate(stats.period.to)}`: ''}
            </Typography>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>
            ) : (
              <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={3}>
                      <StatCard 
                          title="Notes Terminées" 
                          value={stats?.notes.terminees_sur_periode || 0}
                          icon={<CheckCircleOutline />}
                          color="primary.main"
                      />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                      <StatCard 
                          title="Résultat Net" 
                          value={formatCurrency(stats?.notes.resultat_total_terminees)}
                          icon={<AccountBalanceWallet />}
                          color="success.main"
                      />
                  </Grid>
                 {/* <Grid item xs={12} sm={6} md={3}>
                      <StatCard 
                          title="Volume Transferts" 
                          value={formatCurrency(stats?.volumes.transferts.envoyes + stats?.volumes.transferts.recus)}
                          icon={<SwapHoriz />}
                          color="secondary.main"
                      />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                      <StatCard 
                          title="Crédits Ouverts" 
                          value={stats?.volumes.credits.ouverts || 0}
                          icon={<PostAdd />}
                          color="error.main"
                      />
                  </Grid>*/}
              </Grid>
            )}
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: 400, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>Mon Évolution</Typography>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><CircularProgress /></Box>
            ) : (
              <TimeSeriesChart data={evolutionData} />
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: 400, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>Caisses Utilisées</Typography>
            <UsedCaissesTable data={caissesData} loading={loading} />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AgentDashboard;
