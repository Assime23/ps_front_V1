// Fonction utilitaire pour formater les montants en F CFA
export const formatCurrency = (value) => {
  if (value === null || value === undefined) return 'N/A';
  // Formater le nombre sans symbole monétaire puis ajouter "F CFA"
  const formattedNumber = new Intl.NumberFormat('fr-FR', { 
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
  return `${formattedNumber} F CFA`;
};