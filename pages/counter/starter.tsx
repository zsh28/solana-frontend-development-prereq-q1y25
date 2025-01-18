import React, { useState, useEffect } from "react";
import * as web3 from "@solana/web3.js";
import { toast } from "react-toastify";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { ExternalLinkIcon } from "@heroicons/react/outline";
import { Program, AnchorProvider } from "@coral-xyz/anchor";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import CounterIDL from "../../programs/idls/counter.json";
import { Counter } from "../../programs/types/counter";
import { Keypair, PublicKey } from "@solana/web3.js";

const Starter = () => {
  // Local states
  const [counterKey, setCounterKey] = useState("");
  const [count, setCount] = useState(0);
  const [countTarget, setCountTarget] = useState(0);
  const [isClosed, setIsClosed] = useState(false);
  const [shouldBeClosed, setShouldBeClosed] = useState(false);
  const [txSig, setTxSig] = useState("");

  // Wallet adapter and connection
  const { connection } = useConnection();
  const { publicKey, wallet } = useWallet();

  // Anchor provider
  const provider = new AnchorProvider(
    connection,
    wallet?.adapter as unknown as NodeWallet,
    AnchorProvider.defaultOptions()
  );

  // Anchor program for the counter
  const counterProgram = new Program(
    CounterIDL as unknown as Counter,
    provider
  );

  // Utility to create a transaction pre-filled with a blockhash
  const getPreparedInstruction = async () => {
    const { blockhash, lastValidBlockHeight } =
      await connection.getLatestBlockhash();
    return new web3.Transaction({
      feePayer: publicKey || undefined,
      blockhash,
      lastValidBlockHeight,
    });
  };

  // Create Counter
  const handleCreateCounter = async () => {
    if (!connection || !publicKey) {
      toast.error("Please connect your wallet.");
      return;
    }

    try {
      const transaction = await getPreparedInstruction();
      // Generate a fresh keypair for the counter
      const counterKeypair = Keypair.generate();

      // Build the Anchor instruction
      const instruction = await counterProgram.methods
        .initialize()
        .accounts({
          payer: publicKey,
          counter: counterKeypair.publicKey,
        })
        .instruction();

      transaction.add(instruction);

      // Send and confirm
      const signature = await provider.sendAndConfirm(
        transaction,
        [counterKeypair],
        { skipPreflight: true }
      );

      setTxSig(signature);
      setCounterKey(counterKeypair.publicKey.toBase58());

      // Reset closed flags for a brand-new counter
      setIsClosed(false);
      setShouldBeClosed(false);

      toast.success("Counter created successfully!");
    } catch (error: any) {
      console.log(error);
      toast.error("Transaction failed!");
    }
  };

  // Increment Counter
  const handleIncrementCounter = async () => {
    if (!counterKey) {
      toast.error("No counter account found. Create one first.");
      return;
    }

    try {
      const transaction = await getPreparedInstruction();

      const instruction = await counterProgram.methods
        .increment()
        .accounts({ counter: new PublicKey(counterKey) })
        .instruction();

      transaction.add(instruction);

      const signature = await provider.sendAndConfirm(transaction, [], {
        skipPreflight: true,
      });

      setTxSig(signature);
      toast.success("Counter incremented!");
    } catch (error: any) {
      console.log(error);
      toast.error("Transaction failed!");
    }
  };

  // Decrement Counter
  const handleDecrementCounter = async () => {
    if (!counterKey) {
      toast.error("No counter account found. Create one first.");
      return;
    }

    try {
      const transaction = await getPreparedInstruction();

      const instruction = await counterProgram.methods
        .decrement()
        .accounts({ counter: new PublicKey(counterKey) })
        .instruction();

      transaction.add(instruction);

      const signature = await provider.sendAndConfirm(transaction, [], {
        skipPreflight: true,
      });

      setTxSig(signature);
      toast.success("Counter decremented!");
    } catch (error: any) {
      console.log(error);
      toast.error("Transaction failed!");
    }
  };

  // Set Counter to a specific value
  const handleSetCounter = async (value: number) => {
    if (!counterKey) {
      toast.error("No counter account found. Create one first.");
      return;
    }

    try {
      const transaction = await getPreparedInstruction();

      const instruction = await counterProgram.methods
        .set(value)
        .accounts({ counter: new PublicKey(counterKey) })
        .instruction();

      transaction.add(instruction);

      const signature = await provider.sendAndConfirm(transaction, [], {
        skipPreflight: true,
      });

      setTxSig(signature);
      toast.success(`Counter set to ${value}!`);
    } catch (error: any) {
      console.log(error);
      toast.error("Transaction failed!");
    }
  };

  // Close the Counter account
  const handleCloseCounter = async () => {
    if (!counterKey) {
      toast.error("No counter account found. Create one first.");
      return;
    }

    try {
      const transaction = await getPreparedInstruction();

      const instruction = await counterProgram.methods
        .close()
        .accounts({
          payer: publicKey || undefined,
          counter: new PublicKey(counterKey),
        })
        .instruction();

      transaction.add(instruction);

      const signature = await provider.sendAndConfirm(transaction, [], {
        skipPreflight: true,
      });

      setTxSig(signature);
      setShouldBeClosed(true);
      toast.success("Counter closed!");
    } catch (error: any) {
      console.log(error);
      toast.error("Transaction failed!");
    }
  };

  // Update the "count" after any change
  useEffect(() => {
    const getInfo = async () => {
      if (counterKey) {
        try {
          const currentCount = await counterProgram.account.counter.fetch(
            new PublicKey(counterKey)
          );
          setCount(currentCount.count);
        } catch (error) {
          // If the account is closed or not found, ignore
          console.log(error);
        }
      }
    };
    getInfo();
  }, [counterKey, txSig, counterProgram]);

  // Check if the counter is closed (null)
  useEffect(() => {
    const getInfo = async () => {
      if (counterKey && shouldBeClosed) {
        try {
          const userAccount =
            await counterProgram.account.counter.fetchNullable(
              new PublicKey(counterKey)
            );
          setIsClosed(userAccount === null);
        } catch (error) {
          console.log(error);
        }
      }
    };
    getInfo();
  }, [counterKey, txSig, shouldBeClosed, counterProgram]);

  // Prepare outputs (added "Counter Key" to show the key in outputs)
  const outputs = [
    {
      title: "Counter Key",
      dependency: counterKey,
    },
    {
      title: "Counter Value",
      dependency: count,
    },
    {
      title: "Latest Transaction Signature",
      dependency: txSig,
      href: `https://explorer.solana.com/tx/${txSig}?cluster=devnet`,
    },
    {
      title: "Counter Closed?",
      dependency: isClosed ? "Yes" : "No",
    },
  ];

  return (
    <main className="min-h-screen text-white bg-gray-900 p-4">
      <div className="max-w-2xl mx-auto flex flex-col gap-4">
        {/* CREATE */}
        <div className="bg-gray-800 p-4 rounded">
          <h2 className="text-xl font-bold mb-2">Create Counter</h2>
          <button
            onClick={handleCreateCounter}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Create
          </button>
        </div>

        {/* INCREMENT */}
        <div className="bg-gray-800 p-4 rounded">
          <h2 className="text-xl font-bold mb-2">Increment Counter</h2>
          <button
            onClick={handleIncrementCounter}
            disabled={!counterKey || isClosed}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Increment
          </button>
        </div>

        {/* DECREMENT */}
        <div className="bg-gray-800 p-4 rounded">
          <h2 className="text-xl font-bold mb-2">Decrement Counter</h2>
          <button
            onClick={handleDecrementCounter}
            disabled={!counterKey || count === 0 || isClosed}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Decrement
          </button>
        </div>

        {/* SET VALUE */}
        <div className="bg-gray-800 p-4 rounded">
          <h2 className="text-xl font-bold mb-2">Set Counter Value</h2>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={countTarget}
              onChange={(e) => setCountTarget(Number(e.target.value))}
              className="px-2 py-1 text-black rounded"
              min={0}
            />
            <button
              onClick={() => handleSetCounter(countTarget)}
              disabled={!counterKey || isClosed}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              Set
            </button>
          </div>
        </div>

        {/* CLOSE */}
        <div className="bg-gray-800 p-4 rounded">
          <h2 className="text-xl font-bold mb-2">Close Counter</h2>
          <button
            onClick={handleCloseCounter}
            disabled={!counterKey || isClosed}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
          >
            Close
          </button>
        </div>

        {/* OUTPUTS */}
        <div className="bg-gray-800 p-4 rounded">
          <h2 className="text-xl font-bold mb-4">Outputs</h2>
          <ul className="space-y-2">
            {outputs.map(({ title, dependency, href }, index) => (
              <li key={index} className="flex justify-between">
                <span>{title}:</span>
                {dependency ? (
                  href ? (
                    <a
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-400 underline flex items-center"
                    >
                      {/* limit length for neatness */}
                      {dependency.toString().slice(0, 24)}
                      <ExternalLinkIcon className="h-4 w-4 ml-2" />
                    </a>
                  ) : (
                    <span className="font-semibold">
                      {dependency.toString()}
                    </span>
                  )
                ) : (
                  <span className="text-gray-400">N/A</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
};

export default Starter;
