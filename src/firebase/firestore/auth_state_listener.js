import { getAuth, onAuthStateChanged } from "firebase/auth";

export function GetUser() {
  const auth = getAuth();
  onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in, see docs for a list of available properties
    // https://firebase.google.com/docs/reference/js/firebase.User
    const uid = user.uid;
    const email = user.email;
    console.log(email)
    console.log('user innnn :)')
    return user
    // ...
  } else {
    // User is signed out
    console.log('user gonee :(')
    // ...
  }
  })
}