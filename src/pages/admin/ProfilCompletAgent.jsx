import { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Paper, Typography, Box, Card, CardContent, Grid, Button, TextField,
  FormControl, InputLabel, Select, MenuItem, Chip, Alert, CircularProgress,
  Accordion, AccordionSummary, AccordionDetails, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Stack, Avatar, IconButton, Tabs, Tab, Badge
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon, ArrowBack, Email, Phone, CreditCard } from '@mui/icons-material';
import apiClient from '../../api/apiClient';

/* ===================== Helper UI Components (scoped) ===================== */
const Section = ({ title, icon, actions, children, color, spacing = 3, sx }) => (
  <Paper elevation={1} sx={{ p: { xs: 2, md: 3 }, mb: spacing, ...sx }}>
    {(title || actions) && (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', mb: 2, gap: 1 }}>
        {title && (
          <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1, color }}>
            {icon}{title}
          </Typography>
        )}
        <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>{actions}</Box>
      </Box>
    )}
    {children}
  </Paper>
);

const StatCard = ({ label, value, color }) => (
  <Grid item xs={6} sm={4} md={3} lg={2.4}>
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent sx={{ textAlign: 'center', p: { xs: 1.5, md: 2 } }}>
        <Typography variant="h6" sx={{ color: (theme) => color || theme.palette.text.primary, fontSize: { xs: 16, md: 18 } }}>
          {value}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: 11, md: 12 } }}>{label}</Typography>
      </CardContent>
    </Card>
  </Grid>
);

const SimpleTable = ({ columns, rows, getRowId, dense = false, emptyMessage = 'Aucune donnée' }) => (
  <TableContainer>
    <Table size={dense ? 'small' : 'medium'}>
      <TableHead>
        <TableRow>
          {columns.map(col => (
            <TableCell key={col.key} align={col.align || 'left'} sx={{ whiteSpace: { xs: 'nowrap', md: 'normal' } }}>
              {col.header}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {rows && rows.length > 0 ? rows.map(r => (
          <TableRow key={getRowId(r)} hover>
            {columns.map(col => (
              <TableCell key={col.key} align={col.align || 'left'} sx={{ fontSize: { xs: 12, md: 14 } }}>
                {col.render ? col.render(r) : r[col.key]}
              </TableCell>
            ))}
          </TableRow>
        )) : (
          <TableRow>
            <TableCell colSpan={columns.length} align="center" sx={{ py: 4 }}>
              <Typography variant="body2" color="text.secondary">{emptyMessage}</Typography>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  </TableContainer>
);
/* ======================================================================= */

const ProfilCompletAgent = () => {
  const { agentId } = useParams();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const authUser = useSelector((state)=> state.auth.user);
  const isAgentSelf = !agentId && authUser?.type === 'agent';
  const effectiveAgentId = agentId || authUser?.id || JSON.parse(localStorage.getItem('user')||'{}')?.id;

  const [profilData, setProfilData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [filters, setFilters] = useState({ date_debut: '', date_fin: '', mois: new Date().getMonth() + 1, annee: new Date().getFullYear(), caisse_id: '' });
  const [caisses, setCaisses] = useState([]);

  useEffect(() => { if (effectiveAgentId){ loadProfilComplet(); loadCaisses(); }}, [effectiveAgentId]);

  const loadCaisses = async () => { try { const { data } = await apiClient.get('/getcaisse'); setCaisses(data); } catch(e){ console.error(e);} };

  const buildParams = (obj) => Object.entries(obj).reduce((p,[k,v])=>{ if(v!=='' && v!=null) p.append(k,v); return p; }, new URLSearchParams());

  const loadProfilComplet = async (custom = {}) => {
    if(!effectiveAgentId) return; setLoading(true); setError('');
    try {
      const finalFilters = { ...filters, ...custom };
      const { data } = await apiClient.get(`/utilisateur/${effectiveAgentId}/profil-complet?${buildParams(finalFilters).toString()}`);
      if(data.success === false){ setError(data.message || 'Aucune donnée'); setProfilData(null);} else { setProfilData(data); }
    } catch(err){ setError(err.response?.data?.message || err.message || 'Erreur chargement profil'); setProfilData(null);} finally { setLoading(false);} };

  const formatCurrency = (n) => new Intl.NumberFormat('fr-FR',{ style:'currency', currency:'XOF'}).format(Number(n)||0);
  const formatDate = (d) => { if(!d) return 'N/A'; const date = new Date(d.includes('T')? d : d.replace(' ','T')); return date.toLocaleDateString('fr-FR',{ year:'numeric', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'}); };

  const handleFilterChange = (f,v)=> setFilters(prev=>({...prev,[f]:v}));
  const applyFilters = ()=> loadProfilComplet();
  const resetFilters = ()=> setFilters({ date_debut:'', date_fin:'', mois:new Date().getMonth()+1, annee:new Date().getFullYear(), caisse_id:'' });

  const notesTerminees = profilData?.notes_terminees_recent || [];
  const tx = profilData?.transactions || {};

  /* -------------------- Tab Configuration -------------------- */
  const tabsConfig = useMemo(()=>[
    {
      label: 'Notes Terminées',
      count: notesTerminees.length,
      key: 'notes',
      content: (
        <SimpleTable
          columns={[
            { key:'note', header:'Note', render: r=>`Note #${r.id}` },
            { key:'caisse', header:'Caisse', render: r=>r.caisse?.libelle },
            { key:'periode', header:'Période', render: r=>`${formatDate(r.periode.montee)} → ${formatDate(r.periode.descente)}` },
            { key:'resultat', header:'Résultat', align:'right', render:r=> <Typography color={r.resultat>0?'success.main': r.resultat<0? 'error.main':'text.secondary'} fontWeight="bold">{formatCurrency(r.resultat)}</Typography> },
            { key:'perf', header:'Performance', render:r=> <Chip size="small" label={r.resultat>0?'Bénéfice': r.resultat<0?'Perte':'Équilibre'} color={r.resultat>0?'success': r.resultat<0? 'error':'default'} /> }
          ]}
          rows={notesTerminees}
          getRowId={r=>r.id}
        />)
    },
    {
      label: 'Transferts',
      count: (tx.transferts?.envoyes?.length||0)+(tx.transferts?.recus?.length||0),
      key: 'transferts',
      content: (
        <Stack spacing={3}>
          <Box>
            <Typography variant="subtitle1" color="error.main" gutterBottom>📤 Envoyés ({tx.transferts?.envoyes?.length||0})</Typography>
            <SimpleTable dense getRowId={r=>r.id} rows={tx.transferts?.envoyes||[]} columns={[
              { key:'date', header:'Date', render:r=>formatDate(r.created_at) },
              { key:'dest', header:'Destinataire', render:r=>r.user1?.name },
              { key:'pair', header:'Caisse → Caisse', render:r=>`${r.caisse?.libelle} → ${r.caisse1?.libelle}` },
              { key:'montant', header:'Montant', align:'right', render:r=> <Typography color="error.main">-{formatCurrency(r.montant)}</Typography> },
              { key:'desc', header:'Description', render:r=>r.description }
            ]} />
          </Box>
          <Box>
            <Typography variant="subtitle1" color="success.main" gutterBottom>📥 Reçus ({tx.transferts?.recus?.length||0})</Typography>
            <SimpleTable dense getRowId={r=>r.id} rows={tx.transferts?.recus||[]} columns={[
              { key:'date', header:'Date', render:r=>formatDate(r.created_at) },
              { key:'exp', header:'Expéditeur', render:r=>r.user?.name },
              { key:'pair', header:'Caisse → Caisse', render:r=>`${r.caisse?.libelle} → ${r.caisse1?.libelle}` },
              { key:'montant', header:'Montant', align:'right', render:r=> <Typography color="success.main">+{formatCurrency(r.montant)}</Typography> },
              { key:'desc', header:'Description', render:r=>r.description }
            ]} />
          </Box>
        </Stack>)
    },
    {
      label: 'Ravitaillements',
      count: (tx.ravitaillements?.envoyes?.length||0)+(tx.ravitaillements?.recus?.length||0),
      key: 'ravit',
      content: (
        <Box>
          <Typography variant="subtitle1" color="success.main" gutterBottom>🔄 Reçus ({tx.ravitaillements?.recus?.length||0})</Typography>
            <SimpleTable dense getRowId={r=>r.id} rows={tx.ravitaillements?.recus||[]} columns={[
              { key:'date', header:'Date', render:r=>formatDate(r.created_at) },
              { key:'donneur', header:'Donneur', render:r=>r.user_donneur?.name },
              { key:'caisse', header:'Caisse', render:r=>r.caisse?.libelle },
              { key:'montant', header:'Montant', align:'right', render:r=> <Typography color="success.main">+{formatCurrency(r.montant)}</Typography> },
              { key:'desc', header:'Description', render:r=>r.description }
            ]} />
        </Box>)
    },
    {
      label: 'Retraits',
      count: (tx.retraits?.length||0),
      key: 'retraits',
      content: (
        <SimpleTable getRowId={r=>r.id} rows={tx.retraits||[]} columns={[
          { key:'date', header:'Date', render:r=>formatDate(r.created_at) },
          { key:'caisse', header:'Caisse', render:r=>r.caisse?.libelle },
          { key:'montant', header:'Montant', align:'right', render:r=> <Typography color="error.main">-{formatCurrency(r.montant_retrait)}</Typography> },
          { key:'desc', header:'Description', render:r=> r.description || 'Retrait standard' }
        ]} />)
    },
    {
      label: 'Autres Transferts',
      count: (tx.autres_transferts?.envoyes?.length||0)+(tx.autres_transferts?.recus?.length||0),
      key: 'autres',
      content: (
        <Stack spacing={3}>
          <Box>
            <Typography variant="subtitle1" color="error.main" gutterBottom>📤 Envoyés ({tx.autres_transferts?.envoyes?.length||0})</Typography>
            <SimpleTable dense getRowId={r=>r.id} rows={tx.autres_transferts?.envoyes||[]} columns={[
              { key:'date', header:'Date', render:r=>formatDate(r.created_at) },
              { key:'caisse', header:'Caisse', render:r=>r.caisse?.libelle },
              { key:'montant', header:'Montant', align:'right', render:r=> <Typography color="error.main">-{formatCurrency(r.montant)}</Typography> },
              { key:'desc', header:'Description', render:r=>r.description }
            ]} />
          </Box>
          <Box>
            <Typography variant="subtitle1" color="success.main" gutterBottom>📥 Reçus ({tx.autres_transferts?.recus?.length||0})</Typography>
            <SimpleTable dense getRowId={r=>r.id} rows={tx.autres_transferts?.recus||[]} columns={[
              { key:'date', header:'Date', render:r=>formatDate(r.created_at) },
              { key:'caisse', header:'Caisse', render:r=>r.caisse?.libelle },
              { key:'montant', header:'Montant', align:'right', render:r=> <Typography color="success.main">+{formatCurrency(r.montant)}</Typography> },
              { key:'desc', header:'Description', render:r=>r.description }
            ]} />
          </Box>
        </Stack>)
    },
    {
      label: 'Crédits',
      count: (tx.credits?.donnes?.length||0)+(tx.credits?.pris?.length||0),
      key: 'credits',
      content: (
        <Stack spacing={3}>
          <Box>
            <Typography variant="subtitle1" color="warning.main" gutterBottom>💳 Donnés ({tx.credits?.donnes?.length||0})</Typography>
            <SimpleTable dense getRowId={r=>r.id} rows={tx.credits?.donnes||[]} columns={[
              { key:'date', header:'Date', render:r=>formatDate(r.created_at) },
              { key:'benef', header:'Bénéficiaire', render:r=>r.preneur_credit?.name },
              { key:'caisse', header:'Caisse', render:r=>r.caisse?.libelle },
              { key:'montant', header:'Montant', align:'right', render:r=> <Typography color="warning.main">{formatCurrency(r.montant)}</Typography> },
              { key:'statut', header:'Statut', render:r=> <Chip size="small" label={r.statut} color={r.statut==='paye'?'success':'warning'} /> },
              { key:'remb', header:'Remboursement', render:r=> r.date_remboursement? formatDate(r.date_remboursement): 'En attente' }
            ]} />
          </Box>
          <Box>
            <Typography variant="subtitle1" color="info.main" gutterBottom>🏦 Pris ({tx.credits?.pris?.length||0})</Typography>
            <SimpleTable dense getRowId={r=>r.id} rows={tx.credits?.pris||[]} columns={[
              { key:'date', header:'Date', render:r=>formatDate(r.created_at) },
              { key:'preteur', header:'Prêteur', render:r=>r.donneur_credit?.name },
              { key:'caisse', header:'Caisse', render:r=>r.caisse?.libelle },
              { key:'montant', header:'Montant', align:'right', render:r=> <Typography color="info.main">{formatCurrency(r.montant)}</Typography> },
              { key:'statut', header:'Statut', render:r=> <Chip size="small" label={r.statut} color={r.statut==='paye'?'success':'warning'} /> },
              { key:'remb', header:'Remboursement', render:r=> r.date_remboursement? formatDate(r.date_remboursement): 'En attente' }
            ]} />
          </Box>
        </Stack>)
    }
  ], [notesTerminees.length, tx]);

  if(!effectiveAgentId) return <Container maxWidth="xl" sx={{ py:3 }}><Alert severity="error">Impossible de déterminer l'utilisateur</Alert></Container>;

  const backTarget = isAgentSelf ? '/ag/mon-bilan' : '/bilan-agents';

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 3 } }}>
      <Section
        spacing={2}
        title={isAgentSelf ? 'Mon Profil Complet' : 'Profil Complet Agent'}
        actions={
          <Button size="small" variant="outlined" startIcon={<ArrowBack />} onClick={()=>navigate(backTarget)}>
            Retour
          </Button>
        }
      >
        {profilData?.utilisateur && (
          <Stack direction={{ xs:'column', md:'row' }} spacing={2} alignItems={{ md:'center' }}>
            <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main', fontSize: 28 }}>
              {profilData.utilisateur.name.charAt(0)}
            </Avatar>
            <Box flex={1}>
              <Typography variant="h6" sx={{ fontSize:{ xs:18, md:22 } }}>{profilData.utilisateur.name}</Typography>
              <Stack direction={{ xs:'column', sm:'row' }} spacing={2} mt={1} flexWrap="wrap">
                <Chip size="small" icon={<Email sx={{ fontSize:14 }} />} label={profilData.utilisateur.email} />
                <Chip size="small" icon={<Phone sx={{ fontSize:14 }} />} label={profilData.utilisateur.telephone} />
                {profilData.utilisateur.numero_cni && <Chip size="small" icon={<CreditCard sx={{ fontSize:14 }} />} label={`CNI: ${profilData.utilisateur.numero_cni}`} />}
                <Chip size="small" color="primary" label={profilData.utilisateur.type} />
              </Stack>
            </Box>
          </Stack>
        )}
      </Section>

      {/* Filtres */}
      <Accordion sx={{ mb: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}> 
          <Typography variant="subtitle1" fontWeight={600}>Filtres de période</Typography>
          {profilData?.filtres_appliques && (
            <Chip sx={{ ml:2 }} size="small" color="primary" label={`${profilData.filtres_appliques.mois || 'Tous'}/${profilData.filtres_appliques.annee || 'Toutes'}`} />
          )}
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}><TextField fullWidth type="date" label="Date début" value={filters.date_debut} onChange={e=>handleFilterChange('date_debut', e.target.value)} InputLabelProps={{ shrink:true }} /></Grid>
            <Grid item xs={12} sm={6} md={3}><TextField fullWidth type="date" label="Date fin" value={filters.date_fin} onChange={e=>handleFilterChange('date_fin', e.target.value)} InputLabelProps={{ shrink:true }} /></Grid>
            <Grid item xs={12} sm={6} md={2}><FormControl fullWidth><InputLabel>Mois</InputLabel><Select label="Mois" value={filters.mois} onChange={e=>handleFilterChange('mois', e.target.value)}>{Array.from({length:12},(_,i)=><MenuItem key={i+1} value={i+1}>{new Date(2024,i).toLocaleDateString('fr-FR',{month:'long'})}</MenuItem>)}</Select></FormControl></Grid>
            <Grid item xs={6} sm={3} md={2}><TextField fullWidth type="number" label="Année" value={filters.annee} onChange={e=>handleFilterChange('annee', e.target.value)} /></Grid>
            <Grid item xs={6} sm={3} md={2}><FormControl fullWidth><InputLabel>Caisse</InputLabel><Select label="Caisse" value={filters.caisse_id} onChange={e=>handleFilterChange('caisse_id', e.target.value)}><MenuItem value="">Toutes</MenuItem>{caisses.map(c=><MenuItem key={c.id} value={c.id}>{c.libelle}</MenuItem>)}</Select></FormControl></Grid>
            <Grid item xs={12}><Stack direction="row" spacing={1} flexWrap="wrap"><Button variant="contained" size="small" disabled={loading} onClick={applyFilters}>Appliquer</Button><Button variant="outlined" size="small" onClick={resetFilters}>Reset</Button></Stack></Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {error && <Alert severity={error.includes('Aucune')?'info':'error'} sx={{ mb:2 }}>{error}</Alert>}
      {loading && <Box sx={{ display:'flex', justifyContent:'center', py:4 }}><CircularProgress /></Box>}

      {profilData && !loading && (
        <>
          {profilData.note_active && (
            <Section title="Note Active" color="success.main" spacing={2}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={5} lg={4}>
                  <Card variant="outlined"><CardContent>
                    <Typography variant="subtitle1" fontWeight={600}>{profilData.note_active.caisse.libelle}</Typography>
                    <Typography variant="body2" color="text.secondary">Type: {profilData.note_active.caisse.type}</Typography>
                    <Typography variant="body2">Montée: {formatDate(profilData.note_active.montee)}</Typography>
                  </CardContent></Card>
                </Grid>
                <Grid item xs={12} md={7} lg={8}>
                  <Card variant="outlined"><CardContent>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>Stocks de montée</Typography>
                    <Grid container spacing={1}>
                      {Object.entries(profilData.note_active.stocks_montee).map(([k,v])=> (
                        <Grid item xs={6} sm={4} md={3} key={k}>
                          <Box sx={{ p:1, borderRadius:1, bgcolor:'grey.50', textAlign:'center' }}>
                            <Typography variant="caption" color="text.secondary" sx={{ textTransform:'uppercase', fontSize:10 }}>{k}</Typography>
                            <Typography variant="body2" fontWeight={600}>{formatCurrency(v)}</Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent></Card>
                </Grid>
              </Grid>
            </Section>
          )}

          {profilData.synthese && (
            <Section title="Synthèse Financière" spacing={2}>
              <Grid container spacing={1.5}>
                <StatCard label="Transferts Envoyés" value={formatCurrency(profilData.synthese.transferts_envoyes)} color="error.main" />
                <StatCard label="Transferts Reçus" value={formatCurrency(profilData.synthese.transferts_recus)} color="success.main" />
                <StatCard label="Ravitaillements Reçus" value={formatCurrency(profilData.synthese.ravitaillements_recus)} color="success.main" />
                <StatCard label="Retraits" value={formatCurrency(profilData.synthese.retraits)} color="error.main" />
                <StatCard label="Autres Envoyés" value={formatCurrency(profilData.synthese.autres_transferts_envoyes)} color="error.main" />
                <StatCard label="Autres Reçus" value={formatCurrency(profilData.synthese.autres_transferts_recus)} color="success.main" />
                <StatCard label="Crédits Donnés" value={formatCurrency(profilData.synthese.credits_donnes)} color="warning.main" />
                <StatCard label="Crédits Pris" value={formatCurrency(profilData.synthese.credits_pris)} color="info.main" />
              </Grid>
            </Section>
          )}

          <Paper elevation={1} sx={{ mb: 3 }}>
            <Box sx={{ borderBottom:1, borderColor:'divider' }}>
              <Tabs value={tabValue} onChange={(e,v)=>setTabValue(v)} variant="scrollable" scrollButtons allowScrollButtonsMobile>
                {tabsConfig.map((t,i)=> (
                  <Tab key={t.key} label={<Badge color="primary" badgeContent={t.count}>{t.label}</Badge>} />
                ))}
              </Tabs>
            </Box>
            <Box sx={{ p: { xs:2, md:3 } }}>
              {tabsConfig[tabValue]?.content}
            </Box>
          </Paper>
        </>
      )}
    </Container>
  );
};

export default ProfilCompletAgent;