import Head from 'next/head';
import { Container } from '@interchain-ui/react';
import { Header } from './Header';
import { Footer } from './Footer';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Container maxWidth="64rem" attributes={{ py: '$14' }}>
      <Head>
        <title>BZE Staking</title>
        <meta name="description" content="BZE Staking page enabling users to stake their BZE on BeeZee blockchain" />
          <link rel="icon" href="/logo_320px.png"/>
      </Head>
      <Header/>
        {children}
      <Footer />
    </Container>
  );
}
