export type Project = {
  name: string;
  desc: string;
  link: string;
};

export const products: Project[] = [
  {
    name: 'Cosmos Kit',
    desc: 'A wallet adapter for react with mobile WalletConnect support for the Cosmos ecosystem.',
    link: 'https://github.com/hyperweb-io/cosmos-kit',
  },
  {
    name: 'Telescope',
    desc: 'A TypeScript Transpiler for Cosmos Protobufs to generate libraries for Cosmos blockchains.',
    link: 'https://github.com/hyperweb-io/telescope',
  },
  {
    name: 'TS Codegen',
    desc: 'The quickest and easiest way to convert CosmWasm Contracts into dev-friendly TypeScript classes.',
    link: 'https://github.com/CosmWasm/ts-codegen',
  },
  {
    name: 'CosmWasm Academy',
    desc: 'Master CosmWasm and build your secure, multi-chain dApp on any CosmWasm chain!',
    link: 'https://academy.cosmwasm.com/',
  },
  {
    name: 'Chain Registry',
    desc: 'Get chain and asset list information from the npm package for the Official Cosmos chain registry.',
    link: 'https://github.com/hyperweb-io/chain-registry',
  },
  {
    name: 'Videos',
    desc: 'How-to videos from the official Cosmology website, with learning resources for building in Cosmos.',
    link: 'https://cosmology.zone/learn',
  },
];

export const dependencies: Project[] = [
  {
    name: 'BZE Website',
    desc: 'Learn more about BZE coin and the BeeZee blockchain.',
    link: 'https://getbze.com',
  },
  {
    name: 'BeeZee DEX & App',
    desc: 'Powered by BZE coin, BeeZee DEX offers simplified DeFi services.',
    link: 'https://app.getbze.com',
  },
];
