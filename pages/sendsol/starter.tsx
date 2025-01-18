import { useState, useEffect } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { toast } from "react-toastify";
import * as web3 from "@solana/web3.js";

const Starter = () => {
  // Recipient's address/public key
  const [account, setAccount] = useState("");
  // Amount of SOL to send
  const [amount, setAmount] = useState(0);
  // Balance of the sender
  const [balance, setBalance] = useState(0);
  // Transaction signature
  const [txSig, setTxSig] = useState("");

  // Connection to the Solana network
  const { connection } = useConnection();
  // Wallet adapter: gets user’s public key & sendTransaction function
  const { publicKey, sendTransaction } = useWallet();

  // Utility to check if a string is a valid Solana address
  const isValidSolanaAddress = (address: string) => {
    try {
      new web3.PublicKey(address);
      return true;
    } catch (error) {
      return false;
    }
  };

  // Send Transaction
  const handleTransaction = async () => {
    // Ensure wallet is connected
    if (!connection || !publicKey) {
      toast.error("Please connect your wallet.");
      return;
    }

    // Validate the recipient address
    if (!isValidSolanaAddress(account)) {
      toast.error("Invalid recipient address.");
      return;
    }

    try {
      // Get the latest blockhash info
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      const txInfo = {
        feePayer: publicKey,
        blockhash,
        lastValidBlockHeight,
      };

      // Create the transaction
      const transaction = new web3.Transaction(txInfo);

      // Create a transfer instruction
      const instruction = web3.SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: new web3.PublicKey(account), // now safe because we checked validity
        lamports: amount * web3.LAMPORTS_PER_SOL,
      });

      transaction.add(instruction);

      // Send the transaction to the network
      const signature = await sendTransaction(transaction, connection);
      setTxSig(signature);

      // Update local balance
      const newBalance = balance - amount;
      setBalance(newBalance);

      toast.success("Transaction successful!");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  // Fetch user's current wallet balance
  useEffect(() => {
    const getInfo = async () => {
      if (connection && publicKey) {
        const info = await connection.getAccountInfo(publicKey);
        if (info?.lamports) {
          setBalance(info.lamports / web3.LAMPORTS_PER_SOL);
        }
      }
    };
    getInfo();
  }, [connection, publicKey]);

  // Helper to snip the transaction signature
  const snipSignature = (signature: string) => {
    if (signature.length <= 15) return signature;
    return signature.slice(0, 6) + "..." + signature.slice(-6);
  };

  return (
    <main className="min-h-screen text-white max-w-7xl mx-auto p-4">
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Sending Form */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Send SOL</h2>

          {/* Recipient Address */}
          <label className="block mb-2 text-sm">Recipient Address</label>
          <input
            type="text"
            className="mb-4 p-2 w-full text-black rounded"
            placeholder="Enter receiver's public key"
            value={account}
            onChange={(e) => setAccount(e.target.value)}
          />

          {/* Amount to Send */}
          <label className="block mb-2 text-sm">Amount (SOL)</label>
          <input
            type="number"
            min={0}
            className="mb-4 p-2 w-full text-black rounded"
            placeholder="Enter amount of SOL"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />

          {/* Submit Button */}
          <button
            onClick={handleTransaction}
            disabled={!account || !amount}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-4 py-2 rounded"
          >
            Send
          </button>
        </div>

        {/* Output Section */}
        <div className="bg-gray-800 p-4 rounded-lg">
          {/* Balance Display */}
          <h3 className="text-xl font-semibold">Balance</h3>
          <p className="mb-4">{balance.toFixed(4)} SOL</p>

          {/* Transaction Signature Display */}
          <h3 className="text-xl font-semibold">Transaction Signature</h3>
          {txSig ? (
            <a
              href={`https://explorer.solana.com/tx/${txSig}?cluster=devnet`}
              target="_blank"
              rel="noreferrer"
              className="text-blue-400 underline"
            >
              {/* Snip the signature */}
              {snipSignature(txSig)}
            </a>
          ) : (
            <p className="text-gray-300">No transaction sent yet.</p>
          )}
        </div>

      </section>
    </main>
  );
};

export default Starter;
