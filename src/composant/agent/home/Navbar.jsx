import { useState, useEffect } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import { Link } from 'react-router-dom';
import LogoutButton from '../../logoutButton';
import DescendreCaisseButton from '../../DescendreCaisseButton'; // Import du nouveau composant

function NavbarAgents() {
  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [libelleCaisse, setLibelleCaisse] = useState('');

  useEffect(() => {
    const savedLibelle = localStorage.getItem('selectedCaisseLibelle');
    if (savedLibelle) {
      setLibelleCaisse(savedLibelle);
    }

    // Écouter les changements de caisse
    const handleCaisseChange = () => {
      const newLibelle = localStorage.getItem('selectedCaisseLibelle');
      setLibelleCaisse(newLibelle || '');
    };

    // Ajouter l'écouteur d'événement
    window.addEventListener('caisseChanged', handleCaisseChange);
    
    // Nettoyer l'écouteur au démontage
    return () => {
      window.removeEventListener('caisseChanged', handleCaisseChange);
    };
  }, []);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const pages = [
    { name: 'Tableau de bord', path: '/agent/dashboard' },
    { name: 'Ma caisse', path: '/ag/ma' },
    { name: 'Transactions Agents', path: '/ag/transfert-agent' },
    { name: 'Autres Transfert', path: '/ag/autres-transfert' },
    { name: 'Credit', path: '/ag/donner-credit' },
    { name: 'Rétrait de 10%', path: '/ag/retrait' }
  ];

  const settings = [
    { name: 'Profile', path: '/ag/profil' },
  ];

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <a className="sidebar-brand">
            <img src="/logo.png" alt="Papou Service Logo" className="align-middle" style={{ height: '75px', width: '75px' }} />
          </a>

          <Typography
            variant="h6"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
              fontSize: '1rem',
            }}
          >
            {libelleCaisse ? ` ${libelleCaisse}` : 'Aucune caisse sélectionnée'}
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="open navigation menu"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{ display: { xs: 'block', md: 'none' } }}
            >
              {pages.map((page, index) => (
                <MenuItem key={index} onClick={handleCloseNavMenu}>
                  <Link to={page.path} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <Typography>{page.name}</Typography>
                  </Link>
                </MenuItem>
              ))}
            </Menu>
          </Box>

          <Typography
            variant="h5"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
              fontSize: '1rem',
            }}
          >
            {libelleCaisse ? ` ${libelleCaisse}` : 'Aucune caisse'}
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {pages.map((page, index) => (
              <Button
                key={index}
                onClick={handleCloseNavMenu}
                sx={{ my: 2, color: 'white', display: 'block' }}
                component={Link}
                to={page.path}
              >
                {page.name}
              </Button>
            ))}
          </Box>

          <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Open settings">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar alt="User Avatar" src="/static/images/avatar/2.jpg" />
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: '45px' }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              {settings.map((setting, index) => (
                <MenuItem key={index} onClick={handleCloseUserMenu}>
                  <Link to={setting.path} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <Typography textAlign="center">{setting.name}</Typography>
                  </Link>
                </MenuItem>
              ))}
              <MenuItem key="descendreCaisse" onClick={handleCloseUserMenu}>
                <DescendreCaisseButton setLibelleCaisse={setLibelleCaisse} />
              </MenuItem>
              <MenuItem key="logout" onClick={handleCloseUserMenu}>
                <LogoutButton />
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default NavbarAgents;
