//commented out since it is not required
//import BoilerPlate from '../../components/BoilerPlate';
//first we will import react
import * as React from "react";
//used to interact with solana json rpc api
import * as web3 from "@solana/web3.js";
//the wallet adapter is used to interact with the user's wallet data via solana json rpc api
import * as walletAdapterReact from "@solana/wallet-adapter-react";
//used to choose from the available wallets supported by the wallet adapter
import * as walletAdapterWallets from "@solana/wallet-adapter-wallets";
//used as a component which can be rendered in the browser
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
//applies the styling to the components which are rendered on the browser relating to wallets
require("@solana/wallet-adapter-react-ui/styles.css");
//used to derive data from the wallet's data store
//useConnection is used to interact with the solana json rpc api
//useWallet is used to interact with the user's wallet data via the solana json rpc api
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

const Starter = () => {
  //<BoilerPlate />
  //useState is used here to set the balance of the user's wallet
  const [balance, setBalance] = React.useState<number | null>(0);
  //you need to set the network you want to connect to this can be devnet, mainnet, or testnet
  //const endpoint = web3.clusterApiUrl("mainnet");
  //const endpoint = web3.clusterApiUrl("testnet");
  const endpoint = web3.clusterApiUrl("devnet");
  //you set which wallets you want to support using the wallet adapter
  const wallets = [new walletAdapterWallets.PhantomWalletAdapter()];

  //context obj that is injected into the browser by the wallet
  const { connection } = useConnection();
  //user's public key of the wallet they connected to our application
  const { publicKey } = useWallet();

  //status of connection or public key changes we will execute the useEffect block below
  React.useEffect(() => {
    const getInfo = async () => {
      if (connection && publicKey) {
        const info = await connection.getAccountInfo(publicKey);
        setBalance(info!.lamports / web3.LAMPORTS_PER_SOL);
      }
    };
    getInfo();
    //when the variables change above this code above is executed
  }, [connection, publicKey]);

  return (
    <>
      <walletAdapterReact.ConnectionProvider endpoint={endpoint}>
        <walletAdapterReact.WalletProvider wallets={wallets}>
          <WalletModalProvider>
            <main className="min-h-screen bg-[#0d1b2a] text-white">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-6">
                <div className="col-span-1 lg:col-start-2 lg:col-end-4 rounded-lg bg-[#1b263b] h-60 p-6 shadow-lg">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-[#e0e1dd]">
                      {publicKey
                        ? `Account Info for ${publicKey.toBase58()}`
                        : "Wallet not connected"}
                    </h2>

                  </div>

                  <div className="mt-8 bg-[#1a2a42] border border-[#415a77] rounded-lg p-4">
                    <ul className="space-y-4">
                      <li className="flex justify-between">
                        <p className="tracking-wide text-[#e0e1dd]">
                          Wallet is connected...
                        </p>
                        <p className="text-[#2ec4b6] italic font-semibold">
                          {publicKey ? "Yes" : "No"}
                        </p>
                      </li>

                      <li className="flex justify-between">
                        <p className="tracking-wide text-[#e0e1dd]">
                          Balance...
                        </p>
                        <p className="text-[#2ec4b6] italic font-semibold">
                          {balance}
                        </p>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </main>
          </WalletModalProvider>
        </walletAdapterReact.WalletProvider>
      </walletAdapterReact.ConnectionProvider>
    </>
  );
};

export default Starter;
