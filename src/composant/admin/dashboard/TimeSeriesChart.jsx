import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Paper, Typography, Box, CircularProgress } from '@mui/material';
import PropTypes from 'prop-types';

const TimeSeriesChart = ({ data }) => {
  // Assurer que chartData est toujours un tableau.
  // Si `data` est un objet, on cherche la première propriété qui est un tableau.
  // Cela rend le composant plus robuste aux variations de la réponse API.
  const chartData = Array.isArray(data) 
    ? data 
    : (data && typeof data === 'object' && Object.values(data).find(Array.isArray)) || [];

  if (!chartData || chartData.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Typography>Aucune donnée à afficher pour cette période.</Typography>
      </Box>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={chartData}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="bucket" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="operations.volume_total" name="Volume Total" stroke="#8884d8" activeDot={{ r: 8 }} />
        <Line type="monotone" dataKey="notes.resultat_total" name="Résultat Net" stroke="#82ca9d" />
      </LineChart>
    </ResponsiveContainer>
  );
};

TimeSeriesChart.propTypes = {
    data: PropTypes.array,
};

export default TimeSeriesChart;
