// DashboardLayout.js
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import axios from 'axios';
import UploadData from '../components/UploadData';
import MintNFT from '../components/MintNFT';
import AccessControl from '../components/AccessControl';
import ViewData from '../components/ViewData';
import UserNFTs from '../components/UserNFTs';
import ABI from '../abi.json';
const CONTRACT_ADDRESS = '0x376Fb6EB51F0860d699EC73e49CB79AF7F9fE0f8';
const PINATA_API_KEY = '815cb6c5b936de120de6';
const PINATA_SECRET_KEY = '71b9f2139171591882a5b4cbb9d5ab4846b9b845911a5960111a2cd8ad4a9984';

const UserDashboard = () => {
  const [account, setAccount] = useState('');
  const [contract, setContract] = useState(null);
  const [userFiles, setUserFiles] = useState([]);
  const [activeTab, setActiveTab] = useState('upload');

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({
            method: 'eth_requestAccounts',
          });
          setAccount(accounts[0]);
          
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();
          const contractInstance = new ethers.Contract(
            CONTRACT_ADDRESS,
            ABI,
            signer
          );
          setContract(contract);
          
          // Load user files
          const files = await contractInstance.getUserUploadedData(accounts[0]);
          setUserFiles(files);
        } catch (error) {
          console.error('Error initializing:', error);
        }
      }
    };
    init();
  }, []);

  const tabs = [
    { id: 'upload', label: 'Upload Data' },
    { id: 'mint', label: 'Mint NFT' },
    { id: 'access', label: 'Access Control' },
    { id: 'view', label: 'View Data' },
    { id: 'nfts', label: 'My NFTs' },
  ];

  return (
    <div className="min-h-screen  w-screen bg-gray-100">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold">Decentralized Data Sharing</h1>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-500 truncate">
                {account}
              </span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          {activeTab === 'upload' && (
            <UploadData contractAddress={contract} walletAddress={account} />
          )}
          {activeTab === 'mint' && (
            <MintNFT contractAddress={contract} walletAddress={account} />
          )}
          {activeTab === 'access' && (
            <AccessControl contractAddress={contract} walletAddress={account} />
          )}
          {activeTab === 'view' && (
            <ViewData contractAddress={contract}  />
          )}
          {activeTab === 'nfts' && (
            <UserNFTs contractAddress={contract} walletAddress={account} />
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;