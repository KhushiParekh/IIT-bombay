import React, { useState } from 'react';
import { ethers } from 'ethers';

const ViewData = ({ contractAddress }) => {
  const [ipfsHash, setIpfsHash] = useState('');
  const [fileData, setFileData] = useState(null);
  const [encryptedKey, setEncryptedKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [accessError, setAccessError] = useState('');
  const CONTRACT = '0x376Fb6EB51F0860d699EC73e49CB79AF7F9fE0f8';
  contractAddress = CONTRACT;
  const CONTRACT_ABI = [
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "ipfsHash",
          "type": "string"
        }
      ],
      "name": "getEncryptedKey",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "ipfsHash",
          "type": "string"
        }
      ],
      "name": "getSharedFile",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        },
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ];

  // Add function to view IPFS file
  const viewIPFSFile = async (hash) => {
    try {
      // Construct Pinata Gateway URL
      const gatewayUrl = `https://gateway.pinata.cloud/ipfs/${hash}`;
      
      // Open file in new tab
      window.open(gatewayUrl, '_blank');
    } catch (error) {
      console.error('Error viewing file:', error);
      setError('Failed to view file. Please try again.');
    }
  };

  const fetchFileData = async () => {
    try {
      setLoading(true);
      setError('');
      setAccessError('');
      setFileData(null);
      setEncryptedKey('');

      if (!window.ethereum) throw new Error("Please install MetaMask");
      
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, signer);

      try {
        // Get shared file data
        const [hash, metadata, isUniversal] = await contract.getSharedFile(ipfsHash);
        setFileData({ hash, metadata, isUniversal });

        // Get encrypted key
        const key = await contract.getEncryptedKey(ipfsHash);
        setEncryptedKey(key);
      } catch (err) {
        if (err.message.includes("Access expired")) {
          setAccessError("Your access to this file has expired");
        } else if (err.message.includes("Access not granted")) {
          setAccessError("You don't have access to this file");
        } else {
          throw err;
        }
      }

    } catch (err) {
      setError(err.message || 'An error occurred while fetching the file');
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Enter IPFS Hash
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={ipfsHash}
            onChange={(e) => setIpfsHash(e.target.value)}
            className="flex-1 shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Enter IPFS hash"
          />
          <button
            onClick={fetchFileData}
            disabled={loading || !ipfsHash}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:bg-gray-400"
          >
            {loading ? 'Loading...' : 'Fetch Data'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {accessError && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {accessError}
        </div>
      )}

      {fileData && !accessError && (
        <div className="bg-white shadow-md rounded px-8 py-6">
          <h3 className="text-xl font-bold mb-4">File Details</h3>
          <div className="space-y-3">
            <div>
              <span className="font-semibold">IPFS Hash:</span>
              <p className="text-gray-700 break-all">{fileData.hash}</p>
            </div>
            <div>
              <span className="font-semibold">Metadata:</span>
              <p className="text-gray-700 break-all">{fileData.metadata}</p>
            </div>
            <div>
              <span className="font-semibold">Universal Access:</span>
              <p className="text-gray-700">{fileData.isUniversal ? 'Yes' : 'No'}</p>
            </div>
            {encryptedKey && (
              <div>
                <span className="font-semibold">Encrypted Key:</span>
                <p className="text-gray-700 break-all">{encryptedKey}</p>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(encryptedKey);
                      alert('Encryption key copied to clipboard!');
                    }}
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200 transition-colors"
                  >
                    Copy Key
                  </button>
                  <button
                    onClick={() => viewIPFSFile(fileData.hash)}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition-colors"
                  >
                    View File
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewData;