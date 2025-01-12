import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Bell } from 'lucide-react';
import { db, auth } from './firebase';
import { collection, query, where, onSnapshot, updateDoc, doc, orderBy, getDocs, addDoc } from 'firebase/firestore';
import UploadData from '../components/UploadData';
import MintNFT from '../components/MintNFT';
import AccessControl from '../components/AccessControl';
import ViewData from '../components/ViewData';
import UserNFTs from '../components/UserNFTs';
import ABI from '../abi.json';
import notificationSound from './notification.mp3';


const CONTRACT_ADDRESS = '0x376Fb6EB51F0860d699EC73e49CB79AF7F9fE0f8';

const UserDashboard = () => {
  const [account, setAccount] = useState('');
  const [contract, setContract] = useState(null);
  const [userFiles, setUserFiles] = useState([]);
  const [activeTab, setActiveTab] = useState('upload');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userName, setUserName] = useState('');
  const [senderNames, setSenderNames] = useState({});

  // Function to get company name from Companies collection
  const fetchCompanyName = async (uid) => {
    try {
      const companyQuery = query(collection(db, 'Companies'), where('uid', '==', uid));
      const companySnapshot = await getDocs(companyQuery);
      if (!companySnapshot.empty) {
        return companySnapshot.docs[0].data().companyName;
      }
      return uid;
    } catch (error) {
      console.error('Error fetching company name:', error);
      return uid;
    }
  };

  // Function to get user's full name
  const fetchUserData = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userQuery = query(collection(db, 'Users'), where('uid', '==', user.uid));
        const userSnapshot = await getDocs(userQuery);
        if (!userSnapshot.empty) {
          setUserName(userSnapshot.docs[0].data().fullName);
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  // Play notification sound
  const playNotificationSound = () => {
    const audio = new Audio(notificationSound);
    audio.play().catch(e => console.log('Audio play failed:', e));
  };

  // Set up real-time notifications listener
  useEffect(() => {
    if (!userName) return;

    const notificationsRef = collection(db, 'requests');
    const notificationsQuery = query(
      notificationsRef,
      where('sentTo', '==', userName)
    );

    const unsubscribe = onSnapshot(notificationsQuery, async (snapshot) => {
      const senderNamesMap = { ...senderNames };

      // Handle new notifications
      for (const change of snapshot.docChanges()) {
        if (change.type === 'added') {
          playNotificationSound();
          if (!senderNamesMap[change.doc.data().sentBy]) {
            senderNamesMap[change.doc.data().sentBy] = await fetchCompanyName(change.doc.data().sentBy);
          }
        }
      }

      // Update all notifications
      const notifs = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const data = doc.data();
          if (!senderNamesMap[data.sentBy]) {
            senderNamesMap[data.sentBy] = await fetchCompanyName(data.sentBy);
          }
          return {
            id: doc.id,
            ...data,
            senderName: senderNamesMap[data.sentBy],
            read: data.read || false
          };
        })
      );

      // Sort notifications by creation date
      notifs.sort((a, b) => b.createdAt?.toDate() - a.createdAt?.toDate());

      setSenderNames(senderNamesMap);
      setNotifications(notifs);
      setUnreadCount(notifs.filter(n => !n.read).length);
    });

    return () => unsubscribe();
  }, [userName]);

  // Initialize dashboard
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
          setContract(contractInstance);
          
          await fetchUserData();
        } catch (error) {
          console.error('Error initializing:', error);
        }
      }
    };
    init();
  }, []);

  const handleNotificationClick = async () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      // Mark notifications as read
      const updatePromises = notifications
        .filter(n => !n.read)
        .map(notification =>
          updateDoc(doc(db, 'requests', notification.id), { 
            read: true,
            readAt: new Date()
          })
        );
      
      await Promise.all(updatePromises);
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 24 * 60 * 60 * 1000) {
      const hours = Math.floor(diff / (60 * 60 * 1000));
      if (hours < 1) {
        const minutes = Math.floor(diff / (60 * 1000));
        return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
      }
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    }
    
    if (diff < 7 * 24 * 60 * 60 * 1000) {
      const days = Math.floor(diff / (24 * 60 * 60 * 1000));
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    }
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleAcceptRequest = async (notification) => {
    try {
      // Update the request status in Firebase
      await updateDoc(doc(db, 'requests', notification.id), {
        status: 'accepted',
        respondedAt: new Date(),
        read: true
      });

      // Add access record to a separate collection
      await addDoc(collection(db, 'fileAccess'), {
        fileName: notification.fileName,
        grantedTo: notification.sentBy,
        grantedBy: userName,
        grantedAt: new Date(),
        fileId: notification.fileId
      });

    } catch (error) {
      console.error('Error accepting request:', error);
      alert('Failed to accept request. Please try again.');
    }
  };

  const handleRejectRequest = async (notification) => {
    try {
      await updateDoc(doc(db, 'requests', notification.id), {
        status: 'rejected',
        respondedAt: new Date(),
        read: true
      });
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Failed to reject request. Please try again.');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
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
                  className="p-2 rounded-full hover:bg-gray-100 focus:outline-none relative"
                >
                  <Bell className="h-6 w-6 text-gray-600" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-700">Access Requests</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`px-4 py-3 ${!notification.read ? 'bg-blue-50' : ''} border-b border-gray-100`}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {notification.senderName}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Requested access to: {notification.fileName}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {formatTimestamp(notification.createdAt)}
                                </p>
                              </div>
                              <div>
                                {getStatusBadge(notification.status)}
                              </div>
                            </div>
                            
                            {notification.status === 'pending' && (
                              <div className="mt-2 flex space-x-2">
                                <button
                                  onClick={() => handleAcceptRequest(notification)}
                                  className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
                                >
                                  Accept
                                </button>
                                <button
                                  onClick={() => handleRejectRequest(notification)}
                                  className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
                                >
                                  Reject
                                </button>
                              </div>
                            )}
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
                {userName || account}
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
            <ViewData contractAddress={contract} />
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