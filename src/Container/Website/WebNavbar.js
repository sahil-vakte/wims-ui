// src/components/Navbar.jsx
import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Button,
} from '@mui/material';
import { NavLink, useNavigate } from 'react-router-dom';
import { styled } from '@mui/system';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from '../../Services/Contexts/AuthContext';

const StyledNavLink = styled(NavLink)(({ theme }) => ({
  textDecoration: 'none',
  color: '#000', // black text
  fontWeight: 500,
  margin: '0 0.75rem',
  position: 'relative',
  '&.active': {
    color: '#094c9f', // blue when active
  },
  '&:hover::after': {
    width: '100%',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: -4,
    left: 0,
    height: 2,
    width: '0%',
    backgroundColor: '#094c9f',
    transition: 'width 0.3s ease',
  },
}));

const MobileNavLink = styled(NavLink)(() => ({
  textDecoration: 'none',
  color: '#000', // black text
  fontWeight: 500,
  padding: '0.75rem 1rem',
  display: 'block',
  width: '100%',
  '&.active': {
    color: '#094c9f', // blue active
    backgroundColor: '#f4f8ff',
  },
}));

const WebNavbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const { isPatientLoggedIn, logout } = useAuth();

  const handleLogout = () => {
    sessionStorage.clear();
    logout();
    navigate("/login");
  };

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about-us' },
    { name: 'Services', path: '/services' },
    { name: 'Testimonials', path: '/testimonials' },
    { name: 'Contact', path: '/contact' },
    { name: 'FAQS', path: '/faq' },
  ];

  const drawer = (
    <Box sx={{ width: 250 }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}>
        <IconButton onClick={handleDrawerToggle}>
          <CloseIcon />
        </IconButton>
      </Box>
      <List>
        {navItems.map((item) => (
          <ListItem key={item.name} disablePadding>
            <MobileNavLink to={item.path} onClick={handleDrawerToggle}>
              <ListItemText primary={item.name} />
            </MobileNavLink>
          </ListItem>
        ))}
        <ListItem disablePadding>
          {/* <Button
            variant="contained"
            sx={{
              margin: '0.5rem 1rem',
              backgroundColor: '#094c9f',
              color: '#fff',
              borderRadius: '20px',
              width: 'calc(100% - 2rem)',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: '#063677',
              },
            }}
            onClick={() => {
              navigate('/book-appointment');
              handleDrawerToggle();
            }}
          >
            Book Appointment
          </Button> */}
        </ListItem>
        <ListItem disablePadding>
          {isPatientLoggedIn ? (
            <Button
              variant="outlined"
              sx={{
                margin: '0.5rem 1rem',
                borderColor: '#094c9f',
                color: '#094c9f',
                borderRadius: '20px',
                width: 'calc(100% - 2rem)',
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: '#f4f8ff',
                },
              }}
              onClick={handleLogout}
            >
              Logout
            </Button>
          ) : (
            <Button
              variant="outlined"
              sx={{
                margin: '0.5rem 1rem',
                borderColor: '#094c9f',
                color: '#094c9f',
                borderRadius: '20px',
                width: 'calc(100% - 2rem)',
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: '#f4f8ff',
                },
              }}
              onClick={() => {
                navigate('/login');
                handleDrawerToggle();
              }}
            >
              Login
            </Button>
          )}
        </ListItem>
      </List>
    </Box>
  );

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        backgroundColor: '#fff', // white navbar background
        padding: { xs: '0 1rem', sm: '0 1.5rem' },
        position: 'relative',
      }}
    >
      <Toolbar
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          minHeight: '64px !important',
        }}
      >
        {/* Logo */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 'bold',
            color: '#094c9f',
            cursor: 'pointer',
            '&:hover': {
              opacity: 0.8,
            },
          }}
          onClick={() => navigate('/')}
        >
          LOGO
        </Typography>

        {/* Desktop Nav */}
        <Box
          sx={{
            display: { xs: 'none', sm: 'flex' },
            alignItems: 'center',
          }}
        >
          {navItems.map((item) => (
            <StyledNavLink key={item.name} to={item.path}>
              {item.name}
            </StyledNavLink>
          ))}
        </Box>

        {/* Desktop Buttons */}
        <Box
          sx={{
            display: { xs: 'none', sm: 'flex' },
            gap: 1,
          }}
        >
          {isPatientLoggedIn ? (
            <Button
              variant="outlined"
              sx={{
                color: '#094c9f',
                borderColor: '#094c9f',
                borderRadius: '20px',
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: '#f4f8ff',
                },
              }}
              onClick={handleLogout}
            >
              Logout
            </Button>
          ) : (
            <Button
              variant="outlined"
              sx={{
                color: '#094c9f',
                borderColor: '#094c9f',
                borderRadius: '20px',
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: '#f4f8ff',
                },
              }}
              onClick={() => navigate('/login')}
            >
              Login
            </Button>
          )}
          {/* <Button
            variant="contained"
            sx={{
              backgroundColor: '#094c9f',
              color: '#fff',
              borderRadius: '20px',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: '#063677',
              },
            }}
            onClick={() => navigate('/book-appointment')}
          >
            Book Appointment
          </Button> */}
        </Box>

        {/* Mobile Menu Icon */}
        <Box sx={{ display: { sm: 'none' } }}>
          <IconButton onClick={handleDrawerToggle} sx={{ color: '#000' }}>
            <MenuIcon />
          </IconButton>
        </Box>
      </Toolbar>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 250,
            backgroundColor: '#fff',
          },
        }}
      >
        {drawer}
      </Drawer>
    </AppBar>
  );
};

export default WebNavbar;
