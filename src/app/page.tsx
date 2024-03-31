"use client";

import "@thirdweb-dev/react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";

import {
  ConnectWallet,
  useAddress,
  useContract,
  useContractMetadata,
  MediaRenderer,
  ThirdwebProvider,
  metamaskWallet,
  coinbaseWallet,
  walletConnect,
  trustWallet,
  phantomWallet,
  Web3Button,
  useSDKChainId,

} from "@thirdweb-dev/react";
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";

import { ThirdwebSDK } from "@thirdweb-dev/sdk";

import { 
  NEXT_PUBLIC_THIRDWEB_CLIENT_ID,
  NEXT_PUBLIC_NFT_CONTRACT_ADDRESS,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  BACKEND_WALLET_ADDRESS,
  NEXT_PUBLIC_CLIENT_ID_2
} from "../app/consts/addresses"

import {
  createThirdwebClient,
  prepareTransaction,
  toWei,
  sendAndConfirmTransaction,
  waitForReceipt,
  sendTransaction,
} from "thirdweb";
import { polygonMumbai } from "thirdweb/chains";


const client = createThirdwebClient({
  secretKey: NEXT_PUBLIC_THIRDWEB_CLIENT_ID,
});

// instantiate the SDK with a simple chain name or chain id
const sdk = new ThirdwebSDK("mumbai");

export default function Home() {
  return (
    <ThirdwebProvider
      activeChain="mumbai"
      clientId="c13572bca94a4faabca8160f9b7cae43"
      supportedWallets={[
        metamaskWallet({ recommended: true }),
        coinbaseWallet({ recommended: true }),
        walletConnect(),
        trustWallet({ recommended: true }),
        phantomWallet({ recommended: true }),
      ]}
    >
      <PurchasePage />
    </ThirdwebProvider>
  );
}


function PurchasePage() {
  const address = useAddress();
  const { contract } = useContract(NEXT_PUBLIC_NFT_CONTRACT_ADDRESS);
  const [isLoading, setIsLoading] = useState(false);
  // const { contract } = useContract(
  //  NEXT_PUBLIC_CONTRACT_ADDRESS,
  //);
  const [ethPaymentMessage, setEthPaymentMessage] = useState('');

  const sendEth = async () => {
    if (!address) {
      console.error("Wallet is not connected");
      return;
    }

    setIsLoading(true);
    try {
      // Fetch the current ETH price in USD
      const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd");
      const data = await response.json();
      const ethPriceInUsd = data.ethereum.usd;
  
      // Calculate the amount of ETH for $98 USD
      const usdAmount = 98;
      const amountInEth = usdAmount / ethPriceInUsd;
      const amountInWei = ethers.utils.parseUnits(amountInEth.toString(), "ether");

      // Make sure the signer is available
      const signer = sdk.getSigner();
      if (!signer) {
        alert("Signer is not available. Make sure your wallet is connected.");
        setIsLoading(false);
        return;
      }

      // Send ETH transaction
      const txResponse = prepareTransaction({
        to: NEXT_PUBLIC_NFT_CONTRACT_ADDRESS,
        value: toWei(amountInWei),
        chain: "mumbai",
        client: client,
      });

      await txResponse.wait(); // Wait for the transaction to be mined
      setEthPaymentMessage("ETH payment successful!");
    } catch (error) {
      console.error("Payment error:", error);
      setEthPaymentMessage("ETH payment failed.");
    } finally {
      setIsLoading(false);
    }
  };
  

//----------------------------------------------------------------
  const { data: contractMetadata } = useContractMetadata(contract);
  const [clientSecret, setClientSecret] = useState("");

  const onClickStripePayment = async () => {
    const resp = await fetch("/api/stripe-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        buyerWalletAddress: address,
      }),
    });
    if (resp.ok) {
      const json = await resp.json();
      setClientSecret(json.clientSecret);
    }
  };

  if (!NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    throw 'Did you forget to add a ".env.local" file?';
  }
  const stripe = loadStripe(NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

  return (
    <main className="flex flex-col gap-y-8 items-center p-12">
      <ConnectWallet 
        theme={"dark"}
        btnTitle={"Connect"}
        modalTitle={"Cultivate Crypto Citadel 🪙"}
        switchToActiveChain={true}
        modalSize={"compact"}
        welcomeScreen={{
          img: {
            src: "https://cdn.discordapp.com/attachments/1096805918114586694/1220244909559382067/Cultivate_Crypto.jpg?ex=660e3ca1&is=65fbc7a1&hm=bd4b540cd90c8651fa78a84954634fc20df50e85a339524c897506bf9e85c3df&",
            width: 150,
            height: 150,
          },
        }}
        modalTitleIconUrl={
          "https://cdn.discordapp.com/attachments/1096805918114586694/1220244909559382067/Cultivate_Crypto.jpg?ex=660e3ca1&is=65fbc7a1&hm=bd4b540cd90c8651fa78a84954634fc20df50e85a339524c897506bf9e85c3df&"
        }
        termsOfServiceUrl={""}
        privacyPolicyUrl={""}
        showThirdwebBranding={false}
      />

      {contractMetadata && (
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
            src="https://cdn.discordapp.com/attachments/1096805918114586694/1220244909559382067/Cultivate_Crypto.jpg?ex=660e3ca1&is=65fbc7a1&hm=bd4b540cd90c8651fa78a84954634fc20df50e85a339524c897506bf9e85c3df&"
//          ⬆️Use this for an NFT drop instead:(src={contractMetadata.image || "Your IPFS link to your NFT collection"})
//        ⬇️Use (<h2 className="text-xl font-extrabold">{contractMetadata.name}</h2>) instead for NFT Drop Contract⬇️
          />

          
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-extrabold" style={{ textAlign: "center", margin: "0"}}>{"Join the Citadel"}
            </h2>
            <p className="text-gray-500">
              {contractMetadata.description || 
              "Pay w/ Crypto or Card.💳 Faster Verification!✅"}
            </p>
          </div>

          {!clientSecret ? (
            <><button 
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-400 disabled:opacity-50"
              onClick={sendEth}
              disabled={!address}
              >
                Send ETH
              </button>  {/*<-- Button to send eth*/}
              {isLoading ? 'Processing...' : ''}
            <button
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-400 disabled:opacity-50"
              onClick={onClickStripePayment}
              disabled={!address}
            >
                Pay with credit card
              </button></>
          ) : (
            <Elements
              options={{
                clientSecret,
                appearance: { theme: "night" },
              }}
              stripe={stripe}
            >
              <CreditCardForm />
            </Elements>
          )}
        </div>
        
      )}
      {ethPaymentMessage && (
  <p className="text-white mt-2">{ethPaymentMessage}</p>
)}
    </main>
  );
}

const CreditCardForm = () => {
  const elements = useElements();
  const stripe = useStripe();
  const [isLoading, setIsLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [ message, setMessage ] = useState("");

  const onClick = async () => {
    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    try {
      const { paymentIntent, error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: "http://localhost:3001",
        },
        redirect: "if_required",
      });
      if (error) {
        throw error.message;
      }
      if (paymentIntent.status === "succeeded") {
        setMessage("Payment success. You will recieve your one-time invite shortly.");
        setIsCompleted(true);
      } else {
        alert("Payment failed. Please try again.");
      }
    } catch (e) {
      alert(`There was an error with the payment. ${e}. Please try again.`);
    }

    setIsLoading(false);
  };

  return (
    <><>
      <PaymentElement />

      <button
        className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg w-full"
        onClick={onClick}
        disabled={isLoading || isCompleted || !stripe || !elements}
      >
        {isCompleted
          ? "Payment received"
          : isLoading
            ? "Please wait..."
            : "Pay now"}
      </button>
    </><p>{message}</p></>
  );

};
