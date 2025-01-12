import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import axios from 'axios';
import abi from '../abi.json';
// Pinata configuration

const CONTRACT_ADDRESS = '0x376Fb6EB51F0860d699EC73e49CB79AF7F9fE0f8';
const PINATA_API_KEY = '815cb6c5b936de120de6';
const PINATA_SECRET_KEY = '71b9f2139171591882a5b4cbb9d5ab4846b9b845911a5960111a2cd8ad4a9984';

// CompanyUpload Component
const CompanyUpload = ({ contract }) => {
  const [file, setFile] = useState(null);
  const [metadata, setMetadata] = useState('');
  const [encryptedKey, setEncryptedKey] = useState('');
  const [isUniversal, setIsUniversal] = useState(false);
  const [status, setStatus] = useState('');
  const [uploading, setUploading] = useState(false);

  const uploadToPinata = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const url = 'https://api.pinata.cloud/pinning/pinFileToIPFS';
    const response = await axios.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_KEY,
      },
    });
    return response.data.IpfsHash;
  };

  const handleUpload = async () => {
    try {
      setUploading(true);
      setStatus('Uploading to IPFS...');
      
      const ipfsHash = await uploadToPinata(file);
      setStatus('Uploading to blockchain...');
      
      const tx = await contract.uploadCompanyData(ipfsHash, metadata, encryptedKey, isUniversal);
      await tx.wait();
      
      setStatus('Upload successful!');
      setFile(null);
      setMetadata('');
      setEncryptedKey('');
      setIsUniversal(false);
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Upload Company Data</h3>
      <div className="space-y-4">
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Metadata"
          value={metadata}
          onChange={(e) => setMetadata(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Encrypted Key"
          value={encryptedKey}
          onChange={(e) => setEncryptedKey(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={isUniversal}
            onChange={(e) => setIsUniversal(e.target.checked)}
            className="mr-2"
          />
          <label>Universal Access</label>
        </div>
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
        {status && <p className="mt-2 text-sm text-gray-600">{status}</p>}
      </div>
    </div>
  );
};

// CompanyFiles Component
const CompanyFiles = ({ contract, account }) => {
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState('');

  useEffect(() => {
    fetchFiles();
  }, [account]);

  const fetchFiles = async () => {
    try {
      const data = await contract.getUserUploadedData(account);
      const [ipfsHashes, metadataList, isNFTList, isUniversalList] = data;
      const filesData = ipfsHashes.map((hash, index) => ({
        ipfsHash: hash,
        metadata: metadataList[index],
        isNFT: isNFTList[index],
        isUniversal: isUniversalList[index],
      }));
      setFiles(filesData);
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    }
  };

  const toggleUniversalAccess = async (ipfsHash, currentStatus) => {
    try {
      const tx = await contract.setUniversalAccess(ipfsHash, !currentStatus);
      await tx.wait();
      await fetchFiles();
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md mt-4">
      <h3 className="text-lg font-semibold mb-4">Company Files</h3>
      {status && <p className="mb-4 text-sm text-gray-600">{status}</p>}
      <div className="space-y-4">
        {files.map((file, index) => (
          <div key={index} className="p-4 border rounded">
            <p className="font-medium">IPFS Hash: {file.ipfsHash}</p>
            <p>Metadata: {file.metadata}</p>
            <p>Universal Access: {file.isUniversal ? 'Yes' : 'No'}</p>
            <a 
              href={`https://gateway.pinata.cloud/ipfs/${file.ipfsHash}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              View on IPFS
            </a>
            <button
              onClick={() => toggleUniversalAccess(file.ipfsHash, file.isUniversal)}
              className="ml-4 px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
            >
              Toggle Universal Access
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// CompanyAuthorization Component
const CompanyAuthorization = ({ companyInfo }) => {
  return (
    <div className="p-4 bg-white rounded-lg shadow-md mb-4">
      <h3 className="text-lg font-semibold mb-4">Company Status</h3>
      <div className="space-y-2">
        <p>Name: {companyInfo.name}</p>
        <p>Authorization Status: {companyInfo.isAuthorized ? 
          <span className="text-green-600">Authorized</span> : 
          <span className="text-red-600">Not Authorized</span>
        }</p>
      </div>
    </div>
  );
};

// AccessControl Component
const AccessControl = ({ contract }) => {
  const [recipient, setRecipient] = useState('');
  const [ipfsHash, setIpfsHash] = useState('');
  const [expiration, setExpiration] = useState('');
  const [status, setStatus] = useState('');

  const grantAccess = async () => {
    try {
      const expirationTimestamp = Math.floor(new Date(expiration).getTime() / 1000);
      const tx = await contract.grantAccess(ipfsHash, recipient, expirationTimestamp);
      await tx.wait();
      setStatus('Access granted successfully');
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    }
  };

  const revokeAccess = async () => {
    try {
      const tx = await contract.revokeAccess(ipfsHash, recipient);
      await tx.wait();
      setStatus('Access revoked successfully');
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md mt-4">
      <h3 className="text-lg font-semibold mb-4">Access Control</h3>
      <div className="space-y-4">
        <input
          type="text"
          placeholder="IPFS Hash"
          value={ipfsHash}
          onChange={(e) => setIpfsHash(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Recipient Address"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <input
          type="datetime-local"
          value={expiration}
          onChange={(e) => setExpiration(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <div className="flex space-x-4">
          <button
            onClick={grantAccess}
            className="flex-1 bg-green-500 text-white p-2 rounded hover:bg-green-600"
          >
            Grant Access
          </button>
          <button
            onClick={revokeAccess}
            className="flex-1 bg-red-500 text-white p-2 rounded hover:bg-red-600"
          >
            Revoke Access
          </button>
        </div>
        {status && <p className="mt-2 text-sm text-gray-600">{status}</p>}
      </div>
    </div>
  );
};

// Main CompanyDashboard Component
const CompanyDashboard = () => {
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState('');
  const [companyInfo, setCompanyInfo] = useState(null);

  useEffect(() => {
    initializeEthers();
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountChange);
    }
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountChange);
      }
    };
  }, []);

  const handleAccountChange = async (accounts) => {
    if (accounts.length > 0) {
      setAccount(accounts[0]);
      await initializeEthers();
    }
  };

  const initializeEthers = async () => {
    try {
      if (window.ethereum) {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);

        // Replace with your contract address and ABI
        const contractAddress = CONTRACT_ADDRESS;
        const contractABI = abi; // Your contract ABI here
        const contractInstance = new ethers.Contract(contractAddress, contractABI, signer);
        setContract(contractInstance);

        // Fetch company info
        const company = await contractInstance.companies(address);
        setCompanyInfo(company);
      }
    } catch (error) {
      console.error('Error initializing:', error);
    }
  };

  if (!contract || !account) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="text-center">Connecting to Ethereum...</div>
      </div>
    );
  }

  if (!companyInfo?.isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="text-center">Company not authorized. Please contact admin.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Company Dashboard</h1>
          <p className="text-gray-600">Connected Account: {account}</p>
        </div>
        
        <CompanyAuthorization companyInfo={companyInfo} />
        <CompanyUpload contract={contract} />
        <CompanyFiles contract={contract} account={account} />
        <AccessControl contract={contract} />
      </div>
    </div>
  );
};

export default CompanyDashboard;