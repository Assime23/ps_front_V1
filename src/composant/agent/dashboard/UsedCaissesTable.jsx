import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Typography,
  Box,
  CircularProgress
} from '@mui/material';

const UsedCaissesTable = ({ data, loading }) => {

  const formatCurrency = (value) => {
    if (typeof value !== 'number') return 'N/A';
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(value);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!data || data.length === 0) {
    return <Typography sx={{ textAlign: 'center', mt: 4 }}>Aucune donnée de caisse disponible pour cette période.</Typography>;
  }

  return (
    <TableContainer component={Paper} sx={{ maxHeight: 340 }}>
      <Table stickyHeader aria-label="tableau des caisses utilisées">
        <TableHead>
          <TableRow>
            <TableCell>Caisse</TableCell>
            <TableCell align="right">Notes</TableCell>
            <TableCell>Dernière Fois</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((caisse) => (
            <TableRow key={caisse.caisse.id}>
              <TableCell component="th" scope="row">
                {caisse.caisse.libelle}
              </TableCell>
              <TableCell align="right">{caisse.notes}</TableCell>
              <TableCell>{new Date(caisse.derniere_fois).toLocaleDateString('fr-FR')}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default UsedCaissesTable;