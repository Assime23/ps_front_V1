import React, { useState } from 'react';
import { Grid, TextField, Button, Box, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import fr from 'date-fns/locale/fr';
import PropTypes from 'prop-types';

const DateFilter = ({ onFilterChange, initialFilters }) => {
  const [filterType, setFilterType] = useState('range');
  const [startDate, setStartDate] = useState(initialFilters?.date_debut ? new Date(initialFilters.date_debut) : new Date());
  const [endDate, setEndDate] = useState(initialFilters?.date_fin ? new Date(initialFilters.date_fin) : new Date());
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);

  const handleFilterTypeChange = (event, newFilterType) => {
    if (newFilterType !== null) {
      setFilterType(newFilterType);
    }
  };

  const handleApplyFilter = () => {
    let params = {};
    if (filterType === 'range') {
      params = {
        date_debut: startDate.toISOString().split('T')[0],
        date_fin: endDate.toISOString().split('T')[0],
      };
    } else if (filterType === 'month') {
      params = { annee: year, mois: month };
    }
    onFilterChange(params);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
      <Box sx={{ mb: 2 }}>
        <ToggleButtonGroup
          value={filterType}
          exclusive
          onChange={handleFilterTypeChange}
          aria-label="filter type"
        >
          <ToggleButton value="range" aria-label="plage de dates">
            Plage de dates
          </ToggleButton>
          <ToggleButton value="month" aria-label="mois">
            Mois/Année
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
      <Grid container spacing={2} alignItems="center">
        {filterType === 'range' && (
          <>
            <Grid item>
              <DatePicker
                label="Date de début"
                value={startDate}
                onChange={(newValue) => setStartDate(newValue)}
                renderInput={(params) => <TextField {...params} />}
              />
            </Grid>
            <Grid item>
              <DatePicker
                label="Date de fin"
                value={endDate}
                onChange={(newValue) => setEndDate(newValue)}
                renderInput={(params) => <TextField {...params} />}
              />
            </Grid>
          </>
        )}
        {filterType === 'month' && (
          <>
            <Grid item>
              <TextField
                label="Année"
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
              />
            </Grid>
            <Grid item>
              <TextField
                label="Mois"
                type="number"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                inputProps={{ min: 1, max: 12 }}
              />
            </Grid>
          </>
        )}
        <Grid item>
          <Button variant="contained" onClick={handleApplyFilter}>
            Appliquer
          </Button>
        </Grid>
      </Grid>
    </LocalizationProvider>
  );
};

DateFilter.propTypes = {
    onFilterChange: PropTypes.func.isRequired,
    initialFilters: PropTypes.object,
};

DateFilter.defaultProps = {
    initialFilters: {},
};

export default DateFilter;
