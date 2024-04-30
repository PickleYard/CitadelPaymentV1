Fiat NFT checkout with thirdweb Engine
This guide demonstrates using thirdweb Engine to sell NFTs with credit card.

Process Overview
Buyers pay with credit card.
Upon payment, your backend calls Engine.
Engine mints an NFT to the buyer's wallet. The buyer receives the NFT without requiring wallet signatures or gas funds.
Instructions
Read the full guide: https://portal.thirdweb.com/guides/engine/fiat-nft-checkout.

Setup Environment
Create a .env.local file from the template:
bash
Copy code
cp .env.example .env.local
Provide details of your project:
makefile
Copy code
ENGINE_URL=https://...
THIRDWEB_CLIENT_ID=0123...
THIRDWEB_SECRET_KEY=AaBb...
BACKEND_WALLET_ADDRESS=0x...
NFT_CONTRACT_ADDRESS=0x...
Start the Server
Start the server with your favorite package manager:
Copy code
bun dev
Get in touch
Support: Join the Discord
Twitter: @thirdweb
CitadelPaymentV1
