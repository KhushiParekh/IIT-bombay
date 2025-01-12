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
  const [revokingAccess, setRevokingAccess] = useState(false);
  
  const CONTRACT = '0x376Fb6EB51F0860d699EC73e49CB79AF7F9fE0f8';
  contractAddress = CONTRACT;

  const abi = [
    {
      "inputs": [{"internalType": "address","name": "user","type": "address"}],
      "name": "getUserUploadedData",
      "outputs": [
        {"internalType": "string[]","name": "","type": "string[]"},
        {"internalType": "string[]","name": "","type": "string[]"},
        {"internalType": "bool[]","name": "","type": "bool[]"},
        {"internalType": "bool[]","name": "","type": "bool[]"}
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {"internalType": "string","name": "ipfsHash","type": "string"},
        {"internalType": "address","name": "recipient","type": "address"},
        {"internalType": "uint256","name": "expiration","type": "uint256"}
      ],
      "name": "grantAccess",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {"internalType": "string","name": "ipfsHash","type": "string"},
        {"internalType": "address","name": "recipient","type": "address"}
      ],
      "name": "revokeAccess",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];

  const viewIPFSFile = async (ipfsHash) => {
    try {
      const gatewayUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
      window.open(gatewayUrl, '_blank');
    } catch (error) {
      console.error('Error viewing file:', error);
      alert('Failed to view file. Please try again.');
    }
  };

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

  const handleRevokeAccess = async (file, recipient) => {
    try {
      setRevokingAccess(true);

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, abi, signer);

      const tx = await contract.revokeAccess(file.ipfsHash, recipient);
      await tx.wait();

      alert('Access revoked successfully!');
      fetchUserData();
    } catch (error) {
      console.error('Error revoking access:', error);
      alert('Failed to revoke access. Please try again.');
    } finally {
      setRevokingAccess(false);
    }
  };

  useEffect(() => {
    if (walletAddress && contractAddress) {
      fetchUserData();
    }
  }, [walletAddress, contractAddress]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">Your Uploaded Files</h2>
        <div className="overflow-x-auto rounded-lg shadow-lg">
          <table className="w-full bg-white border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                <th className="px-6 py-4 text-left text-sm font-semibold">IPFS Hash</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Metadata</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Type</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Access</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {userFiles.map((file, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-mono">{file.ipfsHash}</td>
                  <td className="px-6 py-4 text-sm">{file.metadata}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      file.isNFT ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {file.isNFT ? 'NFT' : 'File'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      file.isUniversal ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {file.isUniversal ? 'Universal' : 'Restricted'}
                    </span>
                  </td>
                  <td className="px-6 py-4 space-x-3">
                    <button
                      onClick={() => setSelectedFile(file)}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                    >
                      Grant Access
                    </button>
                    <button
    onClick={() => handleRevokeAccess(file, recipientAddress)}
    className="text-red-600 hover:text-red-800 font-medium text-sm"
  >
    Revoke Access
  </button>
                    <button
                      onClick={() => viewIPFSFile(file.ipfsHash)}
                      className="text-green-600 hover:text-green-800 font-medium text-sm"
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
        <div className="mt-8 p-6 bg-white rounded-lg shadow-lg">
          <h3 className="text-xl font-bold mb-6 text-gray-800">Grant Access to File</h3>
          <form onSubmit={handleGrantAccess} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Selected File</label>
              <input
                type="text"
                value={selectedFile.ipfsHash}
                disabled
                className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Recipient Address</label>
              <input
                type="text"
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                placeholder="0x..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Access Expiration Date</label>
              <input
                type="datetime-local"
                value={expirationDate}
                onChange={(e) => setExpirationDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setSelectedFile(null)}
                className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={grantingAccess}
                className={`px-6 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
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