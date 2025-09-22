import React, { useState, useEffect, useCallback } from 'react';
import { Container, Typography, Grid, Paper, CircularProgress, Box } from '@mui/material';
import { People, Store, TrendingUp, AccountBalanceWallet } from '@mui/icons-material';
import { format } from 'date-fns'; // Importer format
import StatCard from '../../composant/admin/dashboard/StatCard';
import DateFilter from '../../composant/admin/dashboard/DateFilter';
import TimeSeriesChart from '../../composant/admin/dashboard/TimeSeriesChart';
import AgentsRanking from '../../composant/admin/dashboard/AgentsRanking';
import useAuthUser from '../../services/useAuthUser';

// Fonction utilitaire pour formater la date
const formatDate = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.error("Date invalide reçue:", dateString);
      return dateString;
    }
    return format(date, 'dd/MM/yyyy');
  } catch (e) {
    console.error("Erreur lors du formatage de la date:", e);
    return dateString;
  }
};

const AdminDashboard = () => {
  const [overviewStats, setOverviewStats] = useState(null);
  const [timeSeriesData, setTimeSeriesData] = useState([]);
  const [rankingData, setRankingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    date_debut: new Date(), // Utiliser des objets Date
    date_fin: new Date(),   // Utiliser des objets Date
  });
  const [rankingSortBy, setRankingSortBy] = useState('resultat');
  const { http } = useAuthUser();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      // Formatter les dates pour l'API
      const apiFilters = {
        date_debut: filters.date_debut ? format(filters.date_debut, 'yyyy-MM-dd') : undefined,
        date_fin: filters.date_fin ? format(filters.date_fin, 'yyyy-MM-dd') : undefined,
      };

      const overviewPromise = http.get('/admin/stats/overview', { params: apiFilters });
      const timeSeriesPromise = http.get('/admin/stats/time-series', { params: apiFilters });
      const rankingPromise = http.get('/admin/stats/agents/ranking', { 
        params: { ...apiFilters, sort_by: rankingSortBy, limit: 5 }
      });

      const [overviewResponse, timeSeriesResponse, rankingResponse] = await Promise.all([
        overviewPromise,
        timeSeriesPromise,
        rankingPromise,
      ]);

      setOverviewStats(overviewResponse.data);
      // Assurez-vous que timeSeriesResponse.data.series existe
      setTimeSeriesData(timeSeriesResponse.data?.series || []);
      setRankingData(rankingResponse.data.items);

    } catch (error) {
      console.error("Erreur lors de la récupération des statistiques:", error);
    } finally {
      setLoading(false);
    }
  }, [http, filters, rankingSortBy]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleSortChange = (newSortBy) => {
    setRankingSortBy(newSortBy);
  };

  const formatCurrency = (value) => {
    if (typeof value !== 'number') return '...';
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(value);
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Tableau de bord Administrateur
      </Typography>
      <Grid container spacing={3}>
        {/* Section des filtres */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Filtres</Typography>
            <DateFilter onFilterChange={handleFilterChange} initialFilters={filters} />
          </Paper>
        </Grid>

        {/* Section des KPIs */}
        <Grid item xs={12}>
            <Typography variant="h5" gutterBottom>
              Aperçu {overviewStats?.period ? `du ${formatDate(overviewStats.period.from)} au ${formatDate(overviewStats.period.to)}`: ''}
            </Typography>
            {loading && !overviewStats ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>
            ) : (
              <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={3}>
                      <StatCard 
                          title="Agents Actifs" 
                          value={`${overviewStats?.totals.agents_actifs || 0} / ${overviewStats?.totals.agents_total || 0}`}
                          icon={<People />}
                          color="primary.main"
                      />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                      <StatCard 
                          title="Caisses Actives" 
                          value={`${overviewStats?.totals.caisses_actives || 0} / ${overviewStats?.totals.caisses_total || 0}`}
                          icon={<Store />}
                          color="secondary.main"
                      />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                      <StatCard 
                          title="Volume Total" 
                          value={formatCurrency((overviewStats?.volumes.transferts_total || 0) + (overviewStats?.volumes.ravitaillements_total || 0) + (overviewStats?.volumes.retraits_total || 0))}
                          icon={<TrendingUp />}
                          color="success.main"
                      />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                      <StatCard 
                          title="Résultat Net" 
                          value={formatCurrency(overviewStats?.performance.resultat_total_notes_terminees)}
                          icon={<AccountBalanceWallet />}
                          color="error.main"
                      />
                  </Grid>
              </Grid>
            )}
        </Grid>

        {/* Section du graphique */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: 400, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6">Évolution des Opérations</Typography>
            <TimeSeriesChart data={timeSeriesData} loading={loading} />
          </Paper>
        </Grid>

        {/* Section du classement des agents */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: 400, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6">Top 5 Agents</Typography>
            <AgentsRanking data={rankingData} loading={loading} onSortChange={handleSortChange} sortBy={rankingSortBy} />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminDashboard;
