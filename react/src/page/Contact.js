import React from 'react';
import { useLoginCheck } from '../logincheck';
import { Navigate } from 'react-router-dom';

const Contact = () => {
  const isLoggedIn = useLoginCheck();

  if (isLoggedIn) {
    return <h2>Contact</h2>;
  } else {
    console.log('not login yet')
    return  <Navigate to="/login" /> 
  }

  
};

export default Contact;