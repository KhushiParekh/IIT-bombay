import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

// Import ABI
const contractABI = [
  {
    "inputs": [{"internalType": "address","name": "user","type": "address"}],
    "name": "getUserNFTs",
    "outputs": [
      {"internalType": "uint256[]","name": "","type": "uint256[]"},
      {"internalType": "string[]","name": "","type": "string[]"},
      {"internalType": "string[]","name": "","type": "string[]"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256","name": "tokenId","type": "uint256"}],
    "name": "burnNFT",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const UserNFTs = ({ contractAddress, walletAddress }) => {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [burnStatus, setBurnStatus] = useState({});
  const CONTRACT = '0x376Fb6EB51F0860d699EC73e49CB79AF7F9fE0f8';
  contractAddress = CONTRACT;
  useEffect(() => {
    fetchNFTs();
  }, [contractAddress, walletAddress]);

  const fetchNFTs = async () => {
    try {
      setLoading(true);
      setError(null);

      // if (!contractAddress || !walletAddress) {
      //   throw new Error('Contract address and wallet address are required');
      // }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, contractABI, provider);

      const [tokenIds, ipfsHashes, metadata] = await contract.getUserNFTs(walletAddress);

      const formattedNFTs = tokenIds.map((id, index) => ({
        tokenId: id.toString(),
        ipfsHash: ipfsHashes[index],
        metadata: metadata[index],
      }));

      setNfts(formattedNFTs);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching NFTs:', err);
    } finally {
      setLoading(false);
    }
  };

  const burnNFT = async (tokenId) => {
    try {
      setBurnStatus(prev => ({ ...prev, [tokenId]: 'pending' }));

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      const tx = await contract.burnNFT(tokenId);
      await tx.wait();

      setBurnStatus(prev => ({ ...prev, [tokenId]: 'success' }));
      // Refresh NFT list
      fetchNFTs();
    } catch (err) {
      setBurnStatus(prev => ({ ...prev, [tokenId]: 'error' }));
      console.error('Error burning NFT:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="text-gray-600">Loading NFTs...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  if (!nfts.length) {
    return (
      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-gray-600">No NFTs found for this address.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {nfts.map((nft) => (
        <div key={nft.tokenId} className="bg-white p-4 rounded-lg shadow">
          <div className="space-y-2">
            <p className="text-sm text-gray-500">Token ID: {nft.tokenId}</p>
            <p className="text-sm text-gray-500 truncate">IPFS: {nft.ipfsHash}</p>
            <p className="text-sm text-gray-500">Metadata: {nft.metadata}</p>
            
            <button
              onClick={() => burnNFT(nft.tokenId)}
              disabled={burnStatus[nft.tokenId] === 'pending'}
              className={`w-full mt-2 px-4 py-2 rounded-md text-white ${
                burnStatus[nft.tokenId] === 'pending'
                  ? 'bg-gray-400'
                  : burnStatus[nft.tokenId] === 'error'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              } transition-colors`}
            >
              {burnStatus[nft.tokenId] === 'pending'
                ? 'Burning...'
                : burnStatus[nft.tokenId] === 'error'
                ? 'Error - Try Again'
                : 'Burn NFT'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserNFTs;