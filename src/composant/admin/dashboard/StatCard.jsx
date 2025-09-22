import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import PropTypes from 'prop-types';

const StatCard = ({ title, value, icon, color = 'primary.main' }) => {
  return (
    <Card sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
      <Box sx={{ 
        bgcolor: color, 
        color: 'white', 
        p: 2, 
        borderRadius: '50%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        mr: 2
      }}>
        {icon}
      </Box>
      <Box>
        <Typography color="text.secondary" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h5" component="div">
          {value}
        </Typography>
      </Box>
    </Card>
  );
};

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.element.isRequired,
  color: PropTypes.string,
};

export default StatCard;
