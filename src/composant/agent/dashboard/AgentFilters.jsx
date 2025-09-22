import React, { useState, useEffect, useCallback } from 'react';
import { Grid, Button, FormControl, InputLabel, Select, MenuItem, CircularProgress, Box } from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import useAuthUser from '../../../services/useAuthUser';
import frLocale from 'date-fns/locale/fr';

const AgentFilters = ({ onFilterChange, loading: propsLoading, initialFilters }) => {
  const [startDate, setStartDate] = useState(initialFilters.startDate);
  const [endDate, setEndDate] = useState(initialFilters.endDate);
  const [caisses, setCaisses] = useState([]);
  const [selectedCaisse, setSelectedCaisse] = useState(initialFilters.caisseId);
  const [loadingCaisses, setLoadingCaisses] = useState(true);
  const { http } = useAuthUser();

  const fetchCaisses = useCallback(async () => {
    try {
      setLoadingCaisses(true);
      // Note: L'endpoint /api/agent/caisses est supposé.
      // Il devra peut-être être ajusté en fonction de l'API réelle.
      const response = await http.get('/caisses'); 
      setCaisses(response.data || []);
    } catch (error) {
      console.error("Erreur lors de la récupération des caisses de l'agent:", error);
      setCaisses([]);
    } finally {
      setLoadingCaisses(false);
    }
  }, [http]);

  useEffect(() => {
    fetchCaisses();
  }, [fetchCaisses]);

  const handleApplyFilters = () => {
    onFilterChange({
      startDate,
      endDate,
      caisseId: selectedCaisse,
    });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={frLocale}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={4}>
          <DatePicker
            label="Date de début"
            value={startDate}
            onChange={(newValue) => setStartDate(newValue)}
            slotProps={{ textField: { fullWidth: true, margin: "normal" } }}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <DatePicker
            label="Date de fin"
            value={endDate}
            onChange={(newValue) => setEndDate(newValue)}
            slotProps={{ textField: { fullWidth: true, margin: "normal" } }}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth margin="normal">
            <InputLabel id="caisse-select-label">Caisse</InputLabel>
            <Select
              labelId="caisse-select-label"
              id="caisse-select"
              value={selectedCaisse}
              label="Caisse"
              onChange={(e) => setSelectedCaisse(e.target.value)}
              disabled={loadingCaisses}
            >
              <MenuItem value="">
                <em>Toutes les caisses</em>
              </MenuItem>
              {loadingCaisses ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 1 }}>
                  <CircularProgress size={20} />
                </Box>
              ) : (
                caisses.map((caisse) => (
                  <MenuItem key={caisse.id} value={caisse.id}>
                    {caisse.libelle}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sx={{ textAlign: 'right' }}>
          <Button 
            variant="contained" 
            onClick={handleApplyFilters}
            disabled={propsLoading}
          >
            {propsLoading ? <CircularProgress size={24} /> : 'Appliquer'}
          </Button>
        </Grid>
      </Grid>
    </LocalizationProvider>
  );
};

export default AgentFilters;