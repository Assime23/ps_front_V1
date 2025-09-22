import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  CircularProgress,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import PropTypes from 'prop-types';

const AgentsRanking = ({ data, loading, onSortChange, sortBy }) => {
  const formatCurrency = (value) => {
    if (typeof value !== 'number') return 'N/A';
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(value);
  };

  return (
    <Box>
      <FormControl size="small" sx={{ mb: 2, minWidth: 180 }}>
        <InputLabel id="sort-by-label">Trier par</InputLabel>
        <Select
          labelId="sort-by-label"
          value={sortBy}
          label="Trier par"
          onChange={(e) => onSortChange(e.target.value)}
        >
          <MenuItem value="resultat">Résultat</MenuItem>
          <MenuItem value="volume">Volume</MenuItem>
          <MenuItem value="transferts">Transferts</MenuItem>
          <MenuItem value="credits">Crédits</MenuItem>
          <MenuItem value="retraits">Retraits</MenuItem>
        </Select>
      </FormControl>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table aria-label="classement des agents">
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Agent</TableCell>
                <TableCell align="right">Résultat Total</TableCell>
                <TableCell align="right">Volume Total</TableCell>
                <TableCell align="right">Notes Terminées</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data && data.length > 0 ? (
                data.map((item, index) => (
                  <TableRow key={item.agent.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{item.agent.name}</TableCell>
                    <TableCell align="right">{formatCurrency(item.resultat_total_notes)}</TableCell>
                    <TableCell align="right">{formatCurrency(item.volume_total)}</TableCell>
                    <TableCell align="right">{item.notes_terminees}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography>Aucun agent à classer pour cette période.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

AgentsRanking.propTypes = {
  data: PropTypes.array,
  loading: PropTypes.bool,
  onSortChange: PropTypes.func.isRequired,
  sortBy: PropTypes.string.isRequired,
};

export default AgentsRanking;
