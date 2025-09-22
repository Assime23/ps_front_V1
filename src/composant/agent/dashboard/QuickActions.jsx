import React from 'react';
import { Button, Grid, Paper, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { 
    ArrowDownward as RetraitIcon,
    SwapHoriz as TransfertAgentIcon,
    AddCard as DonnerCreditIcon,
    AssignmentTurnedIn as RembourserCreditIcon,
    MoveUp as AutreTransfertIcon
} from '@mui/icons-material';

const actions = [
  { label: 'Effectuer un retrait', path: '/ag/retrait', icon: <RetraitIcon /> },
  { label: 'Transférer à un agent', path: '/ag/transfert-agent', icon: <TransfertAgentIcon /> },
  { label: 'Donner un crédit', path: '/ag/donner-credit', icon: <DonnerCreditIcon /> },
  { label: 'Rembourser un crédit', path: '/ag/rembourser-credit', icon: <RembourserCreditIcon /> },
  { label: 'Autre transfert', path: '/ag/autres-transfert', icon: <AutreTransfertIcon /> },
];

const QuickActions = () => {
  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Actions Rapides
      </Typography>
      <Grid container spacing={2}>
        {actions.map((action, index) => (
          <Grid item xs={12} sm={6} md key={index}>
            <Button
              component={RouterLink}
              to={action.path}
              variant="contained"
              startIcon={action.icon}
              fullWidth
              sx={{ justifyContent: 'flex-start', py: 1.5, textTransform: 'none' }}
            >
              {action.label}
            </Button>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

export default QuickActions;