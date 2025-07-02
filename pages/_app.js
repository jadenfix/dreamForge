import '../styles/globals.css';
import Starfield from '../components/Starfield.jsx';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Starfield />
      <Component {...pageProps} />
    </>
  );
} 