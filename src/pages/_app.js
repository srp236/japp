import '@/src/styles/globals.css'
import { AuthUserProvider } from '../utils/AuthUserContext'

export default function App({ Component, pageProps }) {
  return <AuthUserProvider><Component {...pageProps} /></AuthUserProvider>
}
