import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import AIAnalysisDashboard from './AIAnalysisDashboard';
const AccessControl = ({ contractAddress, walletAddress }) => {
  const [userFiles, setUserFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [recipientAddress, setRecipientAddress] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [grantingAccess, setGrantingAccess] = useState(false);
  const CONTRACT = '0x376Fb6EB51F0860d699EC73e49CB79AF7F9fE0f8';
  contractAddress = CONTRACT;
  // const CONTRACT = '0x376Fb6EB51F0860d699EC73e49CB79AF7F9fE0f8';
  // const GEMINI_API_KEY = 'AIzaSyBXvyQXa7LjTNqqDkm3uvubhhkQ1A5dWZs';
  // Add function to view IPFS file
  const viewIPFSFile = async (ipfsHash) => {
    try {
      // Construct Pinata Gateway URL
      const gatewayUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
      
      // Open file in new tab
      window.open(gatewayUrl, '_blank');
    } catch (error) {
      console.error('Error viewing file:', error);
      alert('Failed to view file. Please try again.');
    }
  };

  // Rest of the existing code remains unchanged
  const abi = [{
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "getUserUploadedData",
    "outputs": [
      {
        "internalType": "string[]",
        "name": "",
        "type": "string[]"
      },
      {
        "internalType": "string[]",
        "name": "",
        "type": "string[]"
      },
      {
        "internalType": "bool[]",
        "name": "",
        "type": "bool[]"
      },
      {
        "internalType": "bool[]",
        "name": "",
        "type": "bool[]"
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
      },
      {
        "internalType": "address",
        "name": "recipient",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "expiration",
        "type": "uint256"
      }
    ],
    "name": "grantAccess",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }];

  const fetchUserData = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, abi, provider);

      const [hashes, metadata, isNFTs, isUniversal] = await contract.getUserUploadedData(walletAddress);

      const filesData = hashes.map((hash, index) => ({
        ipfsHash: hash,
        metadata: metadata[index],
        isNFT: isNFTs[index],
        isUniversal: isUniversal[index]
      }));

      setUserFiles(filesData);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGrantAccess = async (e) => {
    e.preventDefault();
    if (!selectedFile || !recipientAddress || !expirationDate) return;

    try {
      setGrantingAccess(true);

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, abi, signer);

      const expirationTimestamp = Math.floor(new Date(expirationDate).getTime() / 1000);

      const tx = await contract.grantAccess(selectedFile.ipfsHash, recipientAddress, expirationTimestamp);
      await tx.wait();

      setSelectedFile(null);
      setRecipientAddress('');
      setExpirationDate('');

      alert('Access granted successfully!');
    } catch (error) {
      console.error('Error granting access:', error);
      alert('Failed to grant access. Please try again.');
    } finally {
      setGrantingAccess(false);
    }
  };

  useEffect(() => {
    if (walletAddress && contractAddress) {
      fetchUserData();
    }
  }, [walletAddress, contractAddress]);

  if (loading) {
    return <div className="text-center py-4">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Your Uploaded Files</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IPFS Hash</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Metadata</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Access</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300">
              {userFiles.map((file, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{file.ipfsHash}</td>
                  <td className="px-6 py-4 text-sm">{file.metadata}</td>
                  <td className="px-6 py-4 text-sm">{file.isNFT ? 'NFT' : 'File'}</td>
                  <td className="px-6 py-4 text-sm">{file.isUniversal ? 'Universal' : 'Restricted'}</td>
                  <td className="px-6 py-4 text-sm space-x-4">
                    <button
                      onClick={() => setSelectedFile(file)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Grant Access
                    </button>
                    <button
                      onClick={() => viewIPFSFile(file.ipfsHash)}
                      className="text-green-600 hover:text-green-900"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedFile && (
        <div className="mt-8 p-6 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium mb-4">Grant Access to File</h3>
          <form onSubmit={handleGrantAccess} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Selected File</label>
              <input
                type="text"
                value={selectedFile.ipfsHash}
                disabled
                className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Recipient Address</label>
              <input
                type="text"
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                placeholder="0x..."
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Access Expiration Date</label>
              <input
                type="datetime-local"
                value={expirationDate}
                onChange={(e) => setExpirationDate(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setSelectedFile(null)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={grantingAccess}
                className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                  grantingAccess ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {grantingAccess ? 'Granting Access...' : 'Grant Access'}
              </button>
            </div>
          </form>
        </div>
      )}
      <AIAnalysisDashboard contractAddress={contractAddress} walletAddress={walletAddress} />
    </div>
  );
};

export default AccessControl;