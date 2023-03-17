import '@/src/styles/globals.css'
import { AuthUserProvider } from '../utils/AuthUserContext'
import {Potta_One} from 'next/font/google'

const pottaone = Potta_One({
  subsets:['latin'],
  weight: ['400']
})

export default function App({ Component, pageProps }) {
  return <AuthUserProvider><Component {...pageProps} /></AuthUserProvider>
}
