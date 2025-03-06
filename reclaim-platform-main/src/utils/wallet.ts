import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { polygon, mainnet, sepolia } from "wagmi/chains";
import { createConfig, configureChains, http } from "wagmi";

const { publicClient } = configureChains(
  [polygon, mainnet, sepolia],
  [http()]
);

export const wagmiConfig = createConfig(
  getDefaultConfig({
    appName: "Reclaim Lost & Found",
    projectId: "YOUR_INFURA_OR_ALCHEMY_PROJECT_ID", // Replace with actual ID
    chains: [polygon, mainnet, sepolia],
    publicClient,
  })
);
