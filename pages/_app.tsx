import '@interchain-ui/react/styles';
import '@interchain-ui/react/globalStyles';
import '../styles/globals.css';

import type { AppProps } from 'next/app';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import {wallets as keplrWallets} from '@cosmos-kit/keplr';
import {wallets as leapWallets} from '@cosmos-kit/leap';
import { useEffect } from 'react';

import { SignerOptions } from 'cosmos-kit';
import { ChainProvider } from '@cosmos-kit/react';
import { GasPrice } from '@cosmjs/stargate';
import { Registry } from '@cosmjs/proto-signing';
import { defaultRegistryTypes } from '@cosmjs/stargate';
import { cosmos } from 'interchain-query';

import {
  Box,
  Toaster,
  useTheme,
  useColorModeValue,
  ThemeProvider,
  OverlaysManager,
} from '@interchain-ui/react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

function CreateCosmosApp({ Component, pageProps }: AppProps) {
  const { themeClass, theme } = useTheme();

  // Fix background color for overscroll and scrollbar
  useEffect(() => {
    const backgroundColor = theme === 'dark' ? '#0f0f0f' : '#ffffff';
    document.documentElement.style.backgroundColor = backgroundColor;
    document.body.style.backgroundColor = backgroundColor;
  }, [theme]);

  //@ts-ignore
  const customRegistry = new Registry([
    ...defaultRegistryTypes,
    [
      '/cosmos.staking.v1beta1.MsgCancelUnbondingDelegation',
      cosmos.staking.v1beta1.MsgCancelUnbondingDelegation,
    ],
  ]);

  const signerOptions: SignerOptions = {
    preferredSignType: (chainName) => {
      return 'direct'
    },
    // @ts-ignore
    signingStargate: (chain) => {
      const gasPrice = GasPrice.fromString('0.01ubze')
      return { gasPrice, registry: customRegistry };
    },
  };

  return (
    <ThemeProvider>
      <ChainProvider
        // @ts-ignore
        chains={["beezee"]}
        // @ts-ignore
        assetLists={["ubze"]}
        wallets={[...keplrWallets, ...leapWallets]}
        walletConnectOptions={{
          signClient: {
            projectId: "7e8510ae772ef527bd711c9bc02f0cb7",
            metadata: {
              name: "BZE Staking",
              description: "BZE Staking Page",
              url: "https://staking.getbze.com",
              icons: [
                "https://app.getbze.com/logo_320px.png",
              ],
            },
          },
        }}
        endpointOptions={{
          isLazy: true,
          endpoints: {
            "beezee": {
              rest: ["https://rest.getbze.com"],
              rpc: ["https://rpc.getbze.com"],
            }
          }
        }}
        signerOptions={signerOptions}
      >
        <QueryClientProvider client={queryClient}>
          <Box
            className={themeClass}
            minHeight="100dvh"
            backgroundColor={useColorModeValue('$white', '$background')}
            attributes={{
              transition: 'background-color 0.3s ease',
            }}
          >
            {/* TODO fix type error */}
            {/* @ts-ignore */}
            <Component {...pageProps} />
            <Toaster position="top-right" closeButton={true} />
          </Box>
          {/* <ReactQueryDevtools /> */}
        </QueryClientProvider>
      </ChainProvider>
      <OverlaysManager />
    </ThemeProvider>
  );
}

export default CreateCosmosApp;
