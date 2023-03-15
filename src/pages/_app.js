import '@/src/styles/globals.css'
import { UserProvider } from '../firebase/userContext'

export default function App({ Component, pageProps }) {
  return (
    <UserProvider>
       <Component {...pageProps} />
    </UserProvider>
  )
}
