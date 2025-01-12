
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { auth, db } from '../pages/firebase';
import { AlertCircle, Check, User, Phone, Mail, Key, Calendar, Building, Edit2, X } from 'lucide-react';

const Profile = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // User data state
  const [userData, setUserData] = useState({
    name: '',
    phone: '',
    email: '',
    privateKey: '',
    gstNo: '', // Only for company accounts
    createdAt: ''
  });

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Edit form state
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          navigate('/login');
          return;
        }

        // Try to get user data from both collections
        const userDoc = await getDoc(doc(db, 'Users', user.uid));
        const companyDoc = await getDoc(doc(db, 'Companies', user.uid));
        
        let data;
        if (userDoc.exists()) {
          data = userDoc.data();
        } else if (companyDoc.exists()) {
          data = companyDoc.data();
        } else {
          // Set default values if no data exists
          data = {
            name: 'User',
            phone: 'Not set',
            email: user.email,
            privateKey: 'Not set',
            createdAt: new Date().toISOString()
          };
        }

        setUserData(data);
        setEditForm(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setMessage({ type: 'error', text: 'Error loading profile data' });
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const user = auth.currentUser;
      const collection = userData.gstNo ? 'Companies' : 'Users';
      
      await updateDoc(doc(db, collection, user.uid), {
        name: editForm.name,
        phone: editForm.phone,
        privateKey: editForm.privateKey,
        ...(userData.gstNo && { gstNo: editForm.gstNo })
      });

      setUserData(editForm);
      setIsEditing(false);
      setMessage({ type: 'success', text: 'Profile updated successfully' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Error updating profile' });
    }
    setIsLoading(false);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    setIsLoading(true);
    try {
      const user = auth.currentUser;
      const credential = EmailAuthProvider.credential(
        user.email,
        passwordData.currentPassword
      );
      
      // Re-authenticate user before password change
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, passwordData.newPassword);
      
      setShowPasswordChange(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setMessage({ type: 'success', text: 'Password updated successfully' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Error updating password. Please verify your current password.' });
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100/20 to-indigo-100/40 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {message.text && (
          <div className={`mb-6 p-4 rounded-xl shadow-lg flex items-center space-x-3 transform transition-all duration-500 ${
            message.type === 'error' ? 'bg-red-50 text-red-700 border-l-4 border-red-500' : 'bg-green-50 text-green-700 border-l-4 border-green-500'
          }`}>
            {message.type === 'error' ? 
              <AlertCircle className="h-6 w-6 flex-shrink-0" /> : 
              <Check className="h-6 w-6 flex-shrink-0" />
            }
            <span className="font-medium">{message.text}</span>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500/80 to-blue-500/90 px-6 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-white/20 backdrop-blur-md rounded-full p-4">
                  <User className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">{userData.name}</h3>
                  <p className="text-indigo-100">{userData.email}</p>
                </div>
              </div>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg backdrop-blur-md transition-all duration-200 border border-white/20"
                >
                  <Edit2 className="h-4 w-4" />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>
          </div>

          <div className="p-6">
            {isEditing ? (
              <form onSubmit={handleEditSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span>Name</span>
                    </label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>Phone</span>
                    </label>
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                      <Key className="h-4 w-4 text-gray-400" />
                      <span>Private Key</span>
                    </label>
                    <input
                      type="password"
                      value={editForm.privateKey}
                      onChange={(e) => setEditForm({ ...editForm, privateKey: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  {userData.gstNo && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                        <Building className="h-4 w-4 text-gray-400" />
                        <span>GST Number</span>
                      </label>
                      <input
                        type="text"
                        value={editForm.gstNo}
                        onChange={(e) => setEditForm({ ...editForm, gstNo: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                  )}
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-blue-500 text-white px-6 py-3 rounded-lg hover:from-indigo-700 hover:to-blue-600 transition-all duration-200 font-medium"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setEditForm(userData);
                    }}
                    className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InfoCard icon={<Phone />} label="Phone" value={userData.phone} />
                  <InfoCard icon={<Mail />} label="Email" value={userData.email} />
                  <InfoCard icon={<Key />} label="Private Key" value="••••••••" />
                  {userData.gstNo && (
                    <InfoCard icon={<Building />} label="GST Number" value={userData.gstNo} />
                  )}
                  <InfoCard 
                    icon={<Calendar />} 
                    label="Account Created" 
                    value={new Date(userData.createdAt).toLocaleDateString()} 
                  />
                </div>

                <button
                  onClick={() => setShowPasswordChange(!showPasswordChange)}
                  className="mt-6 text-indigo-600 hover:text-indigo-800 font-medium flex items-center space-x-2"
                >
                  <Key className="h-4 w-4" />
                  <span>Change Password</span>
                </button>
              </div>
            )}

            {showPasswordChange && !isEditing && (
              <div className="mt-8 border-t pt-6">
                <form onSubmit={handlePasswordChange} className="space-y-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Change Password</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Current Password</label>
                      <input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">New Password</label>
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Confirm New Password</label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex space-x-4 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-indigo-600 to-blue-500 text-white px-6 py-3 rounded-lg hover:from-indigo-700 hover:to-blue-600 transition-all duration-200 font-medium"
                    >
                      Update Password
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordChange(false);
                        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                      }}
                      className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Info Card Component for displaying user information
const InfoCard = ({ icon, label, value }) => (
  <div className="bg-gray-50 rounded-xl p-4 transition-all duration-200 hover:shadow-md">
    <div className="flex items-center space-x-3">
      <div className="text-gray-400">
        {React.cloneElement(icon, { size: 18 })}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="text-lg text-gray-900">{value}</p>
      </div>
    </div>
  </div>
);

export { Profile };