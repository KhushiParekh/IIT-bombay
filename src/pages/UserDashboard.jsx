import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import axios from 'axios';
import { Bell } from 'lucide-react';
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
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

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

          // Load notifications (example - replace with your actual notification fetching logic)
          const mockNotifications = [
            {
              id: 1,
              message: "New access request for file XYZ",
              timestamp: new Date(Date.now() - 3600000).toISOString(),
              read: false
            },
            {
              id: 2,
              message: "Your NFT was successfully minted",
              timestamp: new Date(Date.now() - 7200000).toISOString(),
              read: false
            }
          ];
          setNotifications(mockNotifications);
          setUnreadCount(mockNotifications.filter(n => !n.read).length);
        } catch (error) {
          console.error('Error initializing:', error);
        }
      }
    };
    init();
  }, []);

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    if (showNotifications) {
      // Mark all as read when closing
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const tabs = [
    { id: 'upload', label: 'Upload Data' },
    { id: 'mint', label: 'Add Watermark' },
    { id: 'access', label: 'Access Control' },
    { id: 'view', label: 'View Data' },
    { id: 'nfts', label: 'My NFTs' },
  ];

  return (
    <div className="min-h-screen w-screen bg-gray-100">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold">Decentralized Data Sharing</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button
                  onClick={handleNotificationClick}
                  className="p-2 rounded-full hover:bg-gray-100 focus:outline-none"
                >
                  <div className="relative">
                    <Bell className="h-6 w-6 text-gray-600" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-200">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-700">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`px-4 py-3 hover:bg-gray-50 ${
                              !notification.read ? 'bg-blue-50' : ''
                            }`}
                          >
                            <p className="text-sm text-gray-800">{notification.message}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatTimestamp(notification.timestamp)}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-sm text-gray-500">
                          No notifications
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
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