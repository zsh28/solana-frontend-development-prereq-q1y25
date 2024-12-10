import React, { useState, useEffect } from "react";
import * as web3 from "@solana/web3.js";
import { toast } from "react-toastify";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { ExternalLinkIcon } from "@heroicons/react/outline";
import { Program, AnchorProvider, BN } from "@coral-xyz/anchor";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import CounterIDL from "../../programs/idls/counter.json";
import { Counter } from "../../programs/types/counter";
import { Keypair, PublicKey } from "@solana/web3.js";

const Finished = () => {
  const [counterKey, setCounterKey] = useState("");
  const [count, setCount] = useState(0);
  const [countTarget, setCountTarget] = useState(0);
  const [isClosed, setIsClosed] = useState(false);
  const [shouldBeClosed, setShouldBeClosed] = useState(false);
  const [txSig, setTxSig] = useState("");

  const { connection } = useConnection();
  const { publicKey, sendTransaction, wallet } = useWallet();
  const provider = new AnchorProvider(
    connection,
    wallet?.adapter as unknown as NodeWallet,
    AnchorProvider.defaultOptions()
  );

  const counterProgram = new Program(
    CounterIDL as unknown as Counter,
    provider
  );

  const getPreparedInstruction = async () => {
    const { blockhash, lastValidBlockHeight } =
      await connection.getLatestBlockhash();
    const txInfo = {
      /** The transaction fee payer */
      feePayer: publicKey,
      /** A recent blockhash */
      blockhash: blockhash,
      /** the last block chain can advance to before tx is exportd expired */
      lastValidBlockHeight: lastValidBlockHeight,
    };
    const transaction = new web3.Transaction(txInfo);
    return transaction;
  };

  const handleCreateCounter = async () => {
    if (!connection || !publicKey) {
      toast.error("Please connect your wallet.");
      return;
    }
    const transaction = await getPreparedInstruction();
    const counterKeypair = Keypair.generate();
    const instruction = await counterProgram.methods
      .initialize()
      .accounts({
        payer: publicKey,
        counter: counterKeypair.publicKey,
      })
      .instruction();
    transaction.add(instruction);

    try {
      const signature = await provider.sendAndConfirm(
        transaction,
        [counterKeypair],
        {
          skipPreflight: true,
        }
      );
      setTxSig(signature);
      setCounterKey(counterKeypair.publicKey.toBase58());
    } catch (error) {
      console.log(error);
      toast.error("Transaction failed!");
    }
  };

  const handleIncrementCounter = async () => {
    if (!connection || !publicKey) {
      toast.error("Please connect your wallet.");
      return;
    }

    const transaction = await getPreparedInstruction();
    const instruction = await counterProgram.methods
      .increment()
      .accounts({
        counter: new PublicKey(counterKey),
      })
      .instruction();
    transaction.add(instruction);

    try {
      const signature = await provider.sendAndConfirm(transaction, [], {
        skipPreflight: true,
      });
      setTxSig(signature);
    } catch (error) {
      console.log(error);
      toast.error("Transaction failed!");
    }
  };

  const handleDecrementCounter = async () => {
    if (!connection || !publicKey) {
      toast.error("Please connect your wallet.");
      return;
    }

    const transaction = await getPreparedInstruction();
    const instruction = await counterProgram.methods
      .decrement()
      .accounts({
        counter: new PublicKey(counterKey),
      })
      .instruction();
    transaction.add(instruction);

    try {
      const signature = await provider.sendAndConfirm(transaction, [], {
        skipPreflight: true,
      });
      setTxSig(signature);
    } catch (error) {
      console.log(error);
      toast.error("Transaction failed!");
    }
  };

  const handleSetCounter = async (value: number) => {
    if (!connection || !publicKey) {
      toast.error("Please connect your wallet.");
      return;
    }

    const transaction = await getPreparedInstruction();
    const instruction = await counterProgram.methods
      .set(value)
      .accounts({
        counter: new PublicKey(counterKey),
      })
      .instruction();
    transaction.add(instruction);

    try {
      const signature = await provider.sendAndConfirm(transaction, [], {
        skipPreflight: true,
      });
      setTxSig(signature);
    } catch (error) {
      console.log(error);
      toast.error("Transaction failed!");
    }
  };

  const handleCloseCounter = async () => {
    if (!connection || !publicKey) {
      toast.error("Please connect your wallet.");
      return;
    }

    const transaction = await getPreparedInstruction();
    const instruction = await counterProgram.methods
      .close()
      .accounts({
        payer: publicKey,
        counter: new PublicKey(counterKey),
      })
      .instruction();
    transaction.add(instruction);

    try {
      const signature = await provider.sendAndConfirm(transaction, [], {
        skipPreflight: true,
      });
      setTxSig(signature);
      setShouldBeClosed(true);
    } catch (error) {
      console.log(error);
      toast.error("Transaction failed!");
    }
  };

  useEffect(() => {
    const getInfo = async () => {
      if (connection && publicKey && counterKey) {
        try {
          const currentCount = await counterProgram.account.counter.fetch(
            new PublicKey(counterKey)
          );
          setCount(currentCount.count);
        } catch (error) {
          console.log(error);
        }
      }
    };
    getInfo();
  }, [connection, publicKey, counterKey, txSig]);

  useEffect(() => {
    const getInfo = async () => {
      if (connection && publicKey && counterKey && shouldBeClosed) {
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
  }, [connection, publicKey, counterKey, txSig, shouldBeClosed]);

  const outputs = [
    {
      title: "Counter Value...",
      dependency: count,
    },
    {
      title: "Latest Transaction Signature...",
      dependency: txSig,
      href: `https://explorer.solana.com/tx/${txSig}?cluster=devnet`,
    },
    {
      title: "Counter Closed...",
      dependency: isClosed,
    },
  ];

  return (
    <main className="min-h-screen text-white max-w-7xl">
      <section className="grid grid-cols-1 sm:grid-cols-6 gap-4 p-4">
        <form className="rounded-lg min-h-content p-4 bg-[#2a302f] sm:col-span-6 lg:col-start-2 lg:col-end-6">
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-2xl text-[#fa6ece]">
              Create Counter 💸
            </h2>
          </div>
          <div className="flex flex-col gap-2 mt-2">
            <button
              onClick={(e) => {
                e.preventDefault();
                handleCreateCounter();
              }}
              disabled={!publicKey}
              className="disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#fa6ece] bg-[#fa6ece] rounded-lg w-auto py-1 font-semibold transition-all duration-200 hover:bg-transparent border-2 border-transparent hover:border-[#fa6ece]"
            >
              Initialize Counter
            </button>
            {counterKey && (
              <p className="text-sm text-gray-400">Counter Key: {counterKey}</p>
            )}
            <button
              onClick={(e) => {
                e.preventDefault();
                handleIncrementCounter();
              }}
              disabled={!publicKey || !counterKey || shouldBeClosed}
              className="disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#fa6ece] bg-[#fa6ece] rounded-lg w-auto py-1 font-semibold transition-all duration-200 hover:bg-transparent border-2 border-transparent hover:border-[#fa6ece]"
            >
              Increment Counter
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                handleDecrementCounter();
              }}
              disabled={
                !publicKey || !counterKey || count === 0 || shouldBeClosed
              }
              className="disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#fa6ece] bg-[#fa6ece] rounded-lg w-auto py-1 font-semibold transition-all duration-200 hover:bg-transparent border-2 border-transparent hover:border-[#fa6ece]"
            >
              Decrement Counter
            </button>
            <div className="mt-6">
              <h3 className="italic text-sm">Number amount</h3>
              <input
                id="amount"
                type="number"
                min={1}
                placeholder="Counter Value"
                className="text-[#9e80ff] py-1 w-full bg-transparent outline-none resize-none border-2 border-transparent border-b-white"
                onChange={(event) => setCountTarget(Number(event.target.value))}
              />
            </div>

            <button
              onClick={(e) => {
                e.preventDefault();
                handleSetCounter(countTarget);
              }}
              disabled={
                !publicKey || !counterKey || countTarget === 0 || shouldBeClosed
              }
              className="disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#fa6ece] bg-[#fa6ece] rounded-lg w-auto py-1 font-semibold transition-all duration-200 hover:bg-transparent border-2 border-transparent hover:border-[#fa6ece]"
            >
              Set Counter
            </button>

            <button
              onClick={(e) => {
                e.preventDefault();
                handleCloseCounter();
              }}
              disabled={!publicKey || !counterKey || shouldBeClosed}
              className="disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#fa6ece] bg-[#fa6ece] rounded-lg w-auto py-1 font-semibold transition-all duration-200 hover:bg-transparent border-2 border-transparent hover:border-[#fa6ece]"
            >
              Close Counter
            </button>
          </div>
          <div className="text-sm font-semibold mt-8 bg-[#222524] border-2 border-gray-500 rounded-lg p-2">
            <ul className="p-2">
              {outputs.map(({ title, dependency, href }, index) => (
                <li
                  key={title}
                  className={`flex justify-between items-center ${
                    index !== 0 && "mt-4"
                  }`}
                >
                  <p className="tracking-wider">{title}</p>
                  {dependency && (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex text-[#80ebff] italic ${
                        href && "hover:text-white"
                      } transition-all duration-200`}
                    >
                      {typeof dependency === "boolean"
                        ? dependency
                          ? "True"
                          : "False"
                        : dependency.toString().slice(0, 25)}
                      {href && <ExternalLinkIcon className="w-5 ml-1" />}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </form>
      </section>
    </main>
  );
};

export default Finished;
