import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import axios from 'axios';
import abi from '../abi.json';
import DataAnalysisDashBoard from '../components/AIAnalysisDashboard';
// Pinata configuration
import { BookCopyIcon, AArrowUpIcon, KeyIcon, LockOpenIcon, ChevronDownIcon, Book } from 'lucide-react';
import { Brain, Loader, XCircle } from 'lucide-react';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';

const CONTRACT_ADDRESS = '0x376Fb6EB51F0860d699EC73e49CB79AF7F9fE0f8';
const PINATA_API_KEY = '815cb6c5b936de120de6';
const PINATA_SECRET_KEY = '71b9f2139171591882a5b4cbb9d5ab4846b9b845911a5960111a2cd8ad4a9984';

// Request Component
const DataRequest = ({ username }) => {
  const [requestTo, setRequestTo] = useState('');
  const [fileName, setFileName] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const sendRequest = async () => {
    if (!requestTo || !fileName) {
      setStatus('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      // Check if request already exists
      const requestsRef = collection(db, 'requests');
      const q = query(
        requestsRef, 
        where('sentBy', '==', username),
        where('sentTo', '==', requestTo),
        where('fileName', '==', fileName)
      );
      
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        setStatus('Request already exists for this file and user');
        setLoading(false);
        return;
      }

      // Add new request
      await addDoc(collection(db, 'requests'), {
        sentBy: username,
        sentTo: requestTo,
        fileName: fileName,
        status: 'pending',
        timestamp: new Date().toISOString(),
        createdAt: new Date()
      });

      setStatus('Request sent successfully!');
      setRequestTo('');
      setFileName('');
    } catch (error) {
      setStatus(`Error: ${error.message}`);
      console.error('Error sending request:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md mt-4">
      <h3 className="text-lg font-semibold mb-4">Request Data Access</h3>
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Username to request from"
          value={requestTo}
          onChange={(e) => setRequestTo(e.target.value)}
          className="w-full p-2 border rounded"
          disabled={loading}
        />
        <input
          type="text"
          placeholder="File name"
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
          className="w-full p-2 border rounded"
          disabled={loading}
        />
        <button
          onClick={sendRequest}
          disabled={!requestTo || !fileName || loading}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? 'Sending Request...' : 'Send Request'}
        </button>
        {status && (
          <p className={`mt-2 text-sm ${
            status.includes('Error') ? 'text-red-600' : 
            status.includes('exists') ? 'text-yellow-600' : 
            'text-green-600'
          }`}>
            {status}
          </p>
        )}
      </div>
    </div>
  );
};

// CompanyUpload Component
const CompanyUpload = ({ contract }) => {
  const [file, setFile] = useState(null);
  const [metadata, setMetadata] = useState('');
  const [encryptedKey, setEncryptedKey] = useState('');
  const [isUniversal, setIsUniversal] = useState(false);
  const [status, setStatus] = useState('');
  const [uploading, setUploading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDragEnter = (e) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragActive(false);
    const droppedFile = e.dataTransfer.files[0];
    setFile(droppedFile);
  };



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
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <div className="flex items-center mb-4">
        <AArrowUpIcon className="w-6 h-6 text-indigo-600 mr-2" />
        <h3 className="text-xl font-bold text-gray-800">Upload Company Data</h3>
      </div>
      
      <div className="space-y-4">
        <div 
          onDragEnter={handleDragEnter}
          onDragOver={(e) => e.preventDefault()}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors
            ${isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400'}
            ${file ? 'bg-green-50 border-green-500' : ''}`}
        >
          {file ? (
            <div className="flex items-center justify-center space-x-2">
              <BookCopyIcon className="w-6 h-6 text-green-500" />
              <span className="text-green-600">{file.name}</span>
            </div>
          ) : (
            <div>
              <AArrowUpIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">Drag and drop your file here or</p>
              <label className="mt-2 inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg cursor-pointer hover:bg-indigo-700 transition-colors">
                Browse Files
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files[0])}
                />
              </label>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Metadata"
            value={metadata}
            onChange={(e) => setMetadata(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
          <input
            type="text"
            placeholder="Encrypted Key"
            value={encryptedKey}
            onChange={(e) => setEncryptedKey(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative inline-block w-10 mr-2 align-middle select-none">
            <input
              type="checkbox"
              checked={isUniversal}
              onChange={(e) => setIsUniversal(e.target.checked)}
              className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer transition-transform duration-200 ease-in-out checked:translate-x-full checked:border-indigo-600"
            />
            <label className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
          </div>
          <span className="text-gray-700">Universal Access</span>
        </div>

        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className={`w-full p-3 rounded-lg text-white font-medium transition-all transform hover:scale-[1.02]
            ${!file || uploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg'}`}
        >
          {uploading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
              Uploading...
            </div>
          ) : (
            'Upload File'
          )}
        </button>

        {status && (
          <div className={`p-3 rounded-lg ${status.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {status}
          </div>
        )}
      </div>
    </div>
  );
};

// CompanyFiles Component
const CompanyFiles = ({ contract, account }) => {
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState('');
  const [expandedFile, setExpandedFile] = useState(null);

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
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <div className="flex items-center mb-4">
        <BookCopyIcon className="w-6 h-6 text-indigo-600 mr-2" />
        <h3 className="text-xl font-bold text-gray-800">Company Files</h3>
      </div>

      {status && (
        <div className={`mb-4 p-3 rounded-lg ${status.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {status}
        </div>
      )}

      <div className="space-y-4">
        {files.map((file, index) => (
          <div key={index} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
            <div 
              className="p-4 bg-gray-50 cursor-pointer flex items-center justify-between"
              onClick={() => setExpandedFile(expandedFile === index ? null : index)}
            >
              <div className="flex items-center space-x-2">
                <BookCopyIcon className="w-5 h-5 text-indigo-600" />
                <span className="font-medium text-gray-800 truncate max-w-md">{file.metadata || file.ipfsHash}</span>
              </div>
              <ChevronDownIcon className={`w-5 h-5 text-gray-500 transition-transform ${expandedFile === index ? 'transform rotate-180' : ''}`} />
            </div>

            {expandedFile === index && (
              <div className="p-4 border-t border-gray-200">
                <div className="space-y-2">
                  <p className="text-sm"><span className="font-medium">IPFS Hash:</span> {file.ipfsHash}</p>
                  <p className="text-sm"><span className="font-medium">Metadata:</span> {file.metadata}</p>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center space-x-2">
                      <LockOpenIcon className={`w-5 h-5 ${file.isUniversal ? 'text-green-500' : 'text-gray-400'}`} />
                      <span className={`text-sm ${file.isUniversal ? 'text-green-600' : 'text-gray-600'}`}>
                        {file.isUniversal ? 'Universal Access Enabled' : 'Universal Access Disabled'}
                      </span>
                    </div>
                    <div className="space-x-2">
                      <a 
                        href={`https://gateway.pinata.cloud/ipfs/${file.ipfsHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors"
                      >
                        View on IPFS
                      </a>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleUniversalAccess(file.ipfsHash, file.isUniversal);
                        }}
                        className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Toggle Access
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center mb-4">
        <LockOpenIcon className="w-6 h-6 text-indigo-600 mr-2" />
        <h3 className="text-xl font-bold text-gray-800">Access Control</h3>
      </div>

      <div className="space-y-4">
        <input
          type="text"
          placeholder="IPFS Hash"
          value={ipfsHash}
          onChange={(e) => setIpfsHash(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
        />
        <input
          type="text"
          placeholder="Recipient Address"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
        />
        <input
          type="datetime-local"
          value={expiration}
          onChange={(e) => setExpiration(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
        />

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={grantAccess}
            className="p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors transform hover:scale-[1.02]"
          >
            Grant Access
          </button>
          <button
            onClick={revokeAccess}
            className="p-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors transform hover:scale-[1.02]"
          >
            Revoke Access
          </button>
        </div>

        {status && (
          <div className={`p-3 rounded-lg ${status.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {status}
          </div>
        )}
      </div>
    </div>
  );
};

const CompanyDashboard = () => {
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState('');
  const [companyInfo, setCompanyInfo] = useState(null);
  const [username, setUsername] = useState(''); // Add username state

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

        const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);
        setContract(contractInstance);

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
        <DataRequest username={username} />
        <AccessControl contract={contract} />
      </div>
    </div>
  );
};

export default CompanyDashboard;