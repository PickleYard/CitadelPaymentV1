"use client";
require("dotenv").config();

import "@thirdweb-dev/react";
import {
  ConnectWallet,
  useAddress,
  MediaRenderer,
  ThirdwebProvider,
  metamaskWallet,
  coinbaseWallet,
  walletConnect,
  trustWallet,
  phantomWallet,
  useSigner,
  localWallet,
  embeddedWallet,
  ThirdwebSDK
} from "@thirdweb-dev/react";
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { 
  NEXT_PUBLIC_THIRDWEB_CLIENT_ID,
  RECIPIENT_ADDRESS,
} from "./consts/addresses"

import {
  createThirdwebClient,
  prepareTransaction,
  toWei,
  sendAndConfirmTransaction,
  prepareContractCall,
  getContract,
  sendTransaction
} from "thirdweb";
import { sepolia } from "thirdweb/chains";
import { ethers5Adapter } from "thirdweb/adapters/ethers5";
import { ThirdwebProvider as ThirdwebProviderV5 } from "thirdweb/react"

const client = createThirdwebClient({
  clientId: NEXT_PUBLIC_THIRDWEB_CLIENT_ID,
});

export default function Home() {
  return (
    <ThirdwebProvider
      activeChain="sepolia"
      clientId="c13572bca94a4faabca8160f9b7cae43"
      supportedWallets={[
        metamaskWallet({ recommended: true }),
        coinbaseWallet({ recommended: true }),
        trustWallet(),
        phantomWallet(),
        walletConnect(),
        embeddedWallet()
      ]}
    >
      <ThirdwebProviderV5>
        <PurchasePage />
      </ThirdwebProviderV5>
    </ThirdwebProvider>
  );
}

function PurchasePage() {
  const address = useAddress();
  const signer = useSigner();
  const [isLoading, setIsLoading] = useState(false);
  const [ethPaymentMessage, setEthPaymentMessage] = useState('');
  const [usdcPaymentMessage, setUsdcPaymentMessage] = useState('');
  const [paymentMethod, setPaymentMethod] = useState("");

  useEffect(() => {
    if (!signer) {
      console.log("Waiting for signer...");
    } else {
      console.log("Signer is available");
      // You can now use the signer for transactions
    }
  }, [signer]);

  const sendEth = async () => {
  // Make sure the signer is available
    if (!address || !signer) {
      alert("Please connect your wallet.");
      return;
    }

    setIsLoading(true);
    setPaymentMethod("ETH");
    try {

      // Fetch the current ETH price in USD
      const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd");
      const data = await response.json();
      const ethPriceInUsd = data.ethereum.usd;
  
      // Calculate the amount of ETH for $98 USD
      const usdAmount = 98;
      const amountInEth = usdAmount / ethPriceInUsd;

      // Prepare ETH transaction
      const transaction = prepareTransaction({
        to: RECIPIENT_ADDRESS,
        value: toWei('1'), // after Demo --> value: toWei(amountInEth.toString()), 
        chain: sepolia,
        client: client,
      });


      // convert the signer to used with the new SDK
      const account = await ethers5Adapter.signer.fromEthers(signer);
      // then use the new SDK normally

      const txReceipt = await sendAndConfirmTransaction({
        transaction,
        account,
      });
      // Accessing the transaction hash directly
      const txHash = txReceipt.transactionHash;
      console.log(txHash);

      setEthPaymentMessage(txHash);
    } catch (error) {
      console.error("Payment error:", error);
      setEthPaymentMessage("ETH payment failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const sendUsdc = async () => {
    // Make sure the signer is available
    if (!address || !signer) {
      alert("Please connect your wallet.");
      return;
    }

    setIsLoading(true);
    setPaymentMethod("USDC");

    try {
    // Fetch the current USDC contract address
    const contract = getContract({
      client,
      chain: sepolia,
      address: "0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8",
    });


    // Specify the amount of USDC to send (in smallest unit, e.g., wei for ETH)
    const amount = ethers.utils.parseUnits("98.0", 6); // Setting USDC amount (6 decimal places)
    // console.log(amount);
    const usdcAmount = BigInt(amount.toString()); // Convert BigNumber to bigint
    // console.log(usdcAmount);

    
    // convert the signer to used with the new SDK
    const account = await ethers5Adapter.signer.fromEthers(signer);

    // Prepare USDC transaction
    const transaction = prepareContractCall({
      contract,
      method: {
        name: "transfer",
        type: "function",
        inputs: [
          { name: "to", type: "address" },
          { name: "value", type: "uint256" },
        ],
        outputs: [],
        stateMutability: "payable"
        },
      params: [RECIPIENT_ADDRESS, usdcAmount],
    });


    // Use the new SDK normally
    const txReceipt = await sendAndConfirmTransaction({
      transaction,
      account,
    });
      // Accessing the transaction hash directly
      const txHash = txReceipt.transactionHash;

      setUsdcPaymentMessage(txHash);
    } catch (error) {
      console.error("Payment error:", error);
      setUsdcPaymentMessage("USDC payment failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex flex-col gap-y-8 items-center p-12">
      <ConnectWallet 
        theme={"dark"}
        btnTitle={"Connect"}
        modalTitle={"Cultivate Crypto Citadel 🪙"}
        switchToActiveChain={true}
        modalSize={"wide"}
        modalTitleIconUrl={
          "https://cdn.discordapp.com/attachments/1096805918114586694/1220244909559382067/Cultivate_Crypto.jpg?ex=662fdae1&is=662e8961&hm=bd0d6c9e6a286e1fae0031fdabf6e7cf43dc0dca3a3aff7ebaad3f9de318410b&"
        }
        termsOfServiceUrl={""}
        privacyPolicyUrl={""}
        showThirdwebBranding={false}
      />

        <div className="flex flex-col gap-8 border border-gray-700 rounded-xl p-12">
          <MediaRenderer
            className="rounded-lg"
            style={{
              maxWidth: '100%', 
              maxHeight: '100%', 
              objectFit: 'contain', 
              objectPosition: 'center center', 
              borderRadius: '0.75rem',
              display: 'block', 
              marginLeft: 'auto', 
              marginRight: 'auto'
            }}
            src="https://cdn.discordapp.com/attachments/1096805918114586694/1220244909559382067/Cultivate_Crypto.jpg?ex=662fdae1&is=662e8961&hm=bd0d6c9e6a286e1fae0031fdabf6e7cf43dc0dca3a3aff7ebaad3f9de318410b&"/>

          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-extrabold" style={{ textAlign: "center", margin: "0"}}>{"Join the Citadel"}
            </h2>
            <p className="text-gray-500" style={{ textAlign: "center", margin: "0"}}>
              Now you can Subscribe with Crypto!!! ✅
            </p>
          </div>

            <><button 
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-400 disabled:opacity-50"
              onClick={sendEth}
              disabled={!address}
              >
                Subscribe w/ Eth
              </button></>
              <><button 
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-400 disabled:opacity-50"
              onClick={sendUsdc}
              disabled={!address}
              >
                Subscribe w/ USDC
              </button>
              {isLoading ? 'Processing...' : ''}</>
        </div>
        <p className="text-white mt-2">
  {paymentMethod === "ETH" && ethPaymentMessage ? (
    <span>ETH payment successful! Transaction: <a href={`https://sepolia.etherscan.io/tx/${ethPaymentMessage}`} target="_blank" style={{ color: '#4CAF50' }}>{ethPaymentMessage}</a></span>
  ) : null}
  {paymentMethod === "USDC" && usdcPaymentMessage ? (
    <span>USDC payment successful! Transaction: <a href={`https://sepolia.etherscan.io/tx/${usdcPaymentMessage}`} target="_blank" style={{ color: '#0096c7' }}>{usdcPaymentMessage}</a></span>
  ) : null}
</p>
    </main>
  );
}


