import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Dialog, DialogTitle, DialogContent, CircularProgress } from '@mui/material';
import { getDecryptedUserType } from '../../Services/LoginUserDetails.js/LoginUserSavedDetails';

const allowedUserTypes = ['admin', 'Provider', 'receptionist', 'physician', 'clinician'];

const AdminRouteAccess = ({ element }) => {
  const LoginUserType = getDecryptedUserType(); ;
  const [open, setOpen] = useState(false);
  const [redirect, setRedirect] = useState(false);

  useEffect(() => {
    // if (!allowedUserTypes.includes(LoginUserType)) {
    //   setOpen(true);
    //   setTimeout(() => {
    //     setOpen(false);
    //     setRedirect(true);
    //   }, 3000);
    // }
  }, [LoginUserType]);

  if (redirect) {
    return <Navigate to="/provider-emr-login" />;
  }

  if (allowedUserTypes.includes(LoginUserType)) {
    return element;
  }

  return (
    <Dialog open={open} maxWidth="xs" fullWidth>
      <DialogTitle>Access Denied</DialogTitle>
      <DialogContent>
        You do not have permission to access this page. Your session may have expired, or you may be trying to access a restricted area. Please log in again to continue.
        <div style={{ textAlign: 'center', marginTop: '10px' }}>
          <CircularProgress size={24} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminRouteAccess;
