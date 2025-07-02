import '../styles/globals.css';
import Starfield from '../components/Starfield.jsx';
import Layout from '../components/Layout.jsx';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Starfield />
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </>
  );
} 