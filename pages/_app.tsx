import '../configureAmplify';
import 'tailwindcss/tailwind.css'
import "easymde/dist/easymde.min.css";
import "../styles/editor.css"
import type { AppProps } from 'next/app'

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}
