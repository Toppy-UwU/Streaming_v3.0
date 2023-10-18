import { useState, useEffect } from "react";

export function useLoginCheck() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Retrieve login status from storage
    const storedLoginStatus = localStorage.getItem('isLoggedIn');
    if (storedLoginStatus === 'true') {
      // Perform the login status check
      const isLoggedIn = checkLoginStatus(); // Implement your own logic here
      setIsLoggedIn(isLoggedIn);
    } 
  }, []);

  const checkLoginStatus = () => {
    const accessToken = localStorage.getItem('accessToken');
    return !!accessToken;
  };

  const handleLogout = () => {
    // Clear login status and redirect to login page
    localStorage.removeItem('isLoggedIn');
    setIsLoggedIn(false);
    // Additional logic like redirecting to the login page
    window.location.href = '/login';
  };

  return isLoggedIn;
}