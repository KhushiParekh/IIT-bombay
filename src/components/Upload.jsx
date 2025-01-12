import React, { useState } from 'react';
import { motion } from 'framer-motion';

export const Upload = () => {
  const [dragActive, setDragActive] = useState(false);
  const [dataValue, setDataValue] = useState('low');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [metadata, setMetadata] = useState({});

  const handleUpload = () => {
    setUploadStatus('processing');
    const storageType = dataValue === 'high' ? 'NFT' : 'IPFS';
    
    // Simulated metadata generation
    setMetadata({
      storageType,
      timestamp: new Date().toISOString(),
      hash: `0x${Math.random().toString(16).slice(2, 10)}`,
      owner: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
    });
    
    setTimeout(() => {
      setUploadStatus('complete');
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm p-8"
      >
        <h1 className="text-2xl font-bold mb-6">Upload Data</h1>
        
        <div 
          className={`border-2 border-dashed rounded-lg p-12 text-center ${
            dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'
          }`}
          onDragEnter={() => setDragActive(true)}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            setSelectedFile(e.dataTransfer.files[0]);
          }}
          onDragOver={(e) => e.preventDefault()}
        >
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-indigo-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div>
              <p className="text-lg">
                {selectedFile ? selectedFile.name : 'Drag and drop your files here'}
              </p>
              <p className="text-sm text-gray-500">or</p>
              <button 
                className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                onClick={() => document.getElementById('fileInput').click()}
              >
                Browse Files
              </button>
              <input 
                id="fileInput" 
                type="file" 
                className="hidden" 
                onChange={(e) => setSelectedFile(e.target.files[0])}
              />
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Data Value Classification</h2>
          <div className="space-y-4">
            <div className="flex space-x-4">
              <button
                className={`px-6 py-3 rounded-lg flex-1 ${
                  dataValue === 'low' 
                    ? 'bg-blue-600 text-white' 
                    : 'border border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => setDataValue('low')}
              >
                Low Value (IPFS Storage)
              </button>
              <button
                className={`px-6 py-3 rounded-lg flex-1 ${
                  dataValue === 'high' 
                    ? 'bg-indigo-600 text-white' 
                    : 'border border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => setDataValue('high')}
              >
                High Value (NFT Minting)
              </button>
            </div>
            
            {dataValue === 'high' && (
              <div className="p-4 bg-indigo-50 rounded-lg">
                <p className="text-sm text-indigo-800">
                  Your data will be minted as an NFT, providing proof of ownership 
                  and enabling secure tracking on the blockchain.
                </p>
              </div>
            )}
            
            {dataValue === 'low' && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  Your data will be stored on IPFS with encryption, 
                  ensuring decentralized and secure storage.
                </p>
              </div>
            )}
          </div>
        </div>

        {uploadStatus === 'complete' && metadata && (
          <div className="mt-8 p-4 bg-green-50 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">Upload Complete</h3>
            <div className="space-y-2 text-sm text-green-800">
              <p>Storage Type: {metadata.storageType}</p>
              <p>Timestamp: {metadata.timestamp}</p>
              <p>Hash: {metadata.hash}</p>
              <p>Owner: {metadata.owner}</p>
            </div>
          </div>
        )}

        <div className="mt-8 flex justify-end">
          <button 
            className={`px-6 py-2 rounded-lg ${
              uploadStatus === 'processing'
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
            onClick={handleUpload}
            disabled={uploadStatus === 'processing' || !selectedFile}
          >
            {uploadStatus === 'processing' ? 'Processing...' : 'Upload File'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};