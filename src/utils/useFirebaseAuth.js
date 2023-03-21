import { useState, useEffect } from 'react'
import { getAuth, onAuthStateChanged } from "firebase/auth";
import app from '../firebase/config'

const formatAuthUser = (user) => ({
  uid: user.uid,
  email: user.email,
  name: user.displayName,
});

export default function useFirebaseAuth() {
  const [authUser, setAuthUser] = useState(null);
  const [loading, setsLoading] = useState(true);

useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log('user innnn :)')
      setsLoading(true)
      var formattedUser = formatAuthUser(user);
      setAuthUser(formattedUser);    
      setsLoading(false);
    } else {
      console.log('user gonee :(')
      setAuthUser(null)
      setsLoading(false)
      return;
    }
  });
    return () => unsubscribe();
  }, []);

  return {
    authUser,
    loading
  };
}