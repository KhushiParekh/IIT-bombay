import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { motion } from 'framer-motion';

const Register = () => {
  const [accountType, setAccountType] = useState('user');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    privateKey: '',
    gstNo: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      // Create authentication user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // Prepare user data (excluding password)
      const userData = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        privateKey: formData.privateKey,
        ...(accountType === 'company' && { gstNo: formData.gstNo }),
        createdAt: new Date().toISOString()
      };

      // Store additional user data in Firestore
      await setDoc(
        doc(db, accountType === 'company' ? 'Companies' : 'Users', userCredential.user.uid),
        userData
      );

      navigate('/company-dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md"
      >
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Create Account</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setAccountType('user')}
            className={`flex-1 py-2 rounded-lg ${
              accountType === 'user' ? 'bg-indigo-600 text-white' : 'bg-gray-100'
            }`}
          >
            User
          </button>
          <button
            onClick={() => setAccountType('company')}
            className={`flex-1 py-2 rounded-lg ${
              accountType === 'company' ? 'bg-indigo-600 text-white' : 'bg-gray-100'
            }`}
          >
            Company
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {accountType === 'company' ? 'Company Name' : 'Full Name'}
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder={`Enter ${accountType === 'company' ? 'company name' : 'your name'}`}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter phone number"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter email"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter password"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Private Key</label>
            <input
              type="password"
              name="privateKey"
              value={formData.privateKey}
              onChange={handleChange}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter private key"
              required
            />
          </div>

          {accountType === 'company' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">GST Number</label>
              <input
                type="text"
                name="gstNo"
                value={formData.gstNo}
                onChange={handleChange}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter GST number"
                required
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Create Account
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?
          <button
            onClick={() => navigate('/')}
            className="ml-1 text-indigo-600 hover:text-indigo-800"
          >
            Login
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;