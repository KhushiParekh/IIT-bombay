import { useState } from 'react';
import { ethers } from 'ethers';
import axios from 'axios';
import Tesseract from 'tesseract.js';
import WatermarkModal from './invisibleWatermark';
const MintNFT = ({ contractAddress, walletAddress }) => {
  const [file, setFile] = useState(null);
  const [metadata, setMetadata] = useState('');
  const [encryptionKey, setEncryptionKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [mintedTokenId, setMintedTokenId] = useState(null);
  const [extractedKeywords, setExtractedKeywords] = useState([]);
  const [showMintForm, setShowMintForm] = useState(false);
  const [processingFile, setProcessingFile] = useState(false);
  
  const PINATA_API_KEY = '815cb6c5b936de120de6';
  const PINATA_SECRET_KEY = '71b9f2139171591882a5b4cbb9d5ab4846b9b845911a5960111a2cd8ad4a9984';
  const CONTRACT = '0x376Fb6EB51F0860d699EC73e49CB79AF7F9fE0f8';
  const GEMINI_API_KEY = 'AIzaSyBXvyQXa7LjTNqqDkm3uvubhhkQ1A5dWZs';
  
  contractAddress = CONTRACT;

  const abi = [{
    "inputs": [
      {
        "internalType": "string",
        "name": "ipfsHash",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "metadata",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "encryptedKey",
        "type": "string"
      }
    ],
    "name": "mintNFT",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "ipfsHash",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "NFTMinted",
    "type": "event"
  }];

  // Function to extract text using Tesseract
  const extractTextFromImage = async (file) => {
    try {
      const result = await Tesseract.recognize(
        file,
        'eng',
        { logger: m => console.log(m) }
      );
      return result.data.text;
    } catch (error) {
      console.error('Error in OCR:', error);
      return '';
    }
  };

  // Function to get keywords using Gemini
  const getKeywordsFromText = async (text) => {
    try {
      const response = await axios.post(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
        {
          contents: [
            { parts: [{ text: `Extract important single-word keywords from this text: ${text}` }] }
          ],
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          params: {
            key: GEMINI_API_KEY
          }
        }
      );

      const keywords = response.data.candidates[0].content.parts[0].text
        .split(/[\s,]+/)
        .filter(word => word.length > 0)
        .map(word => word.toLowerCase().trim());

      return [...new Set(keywords)]; // Remove duplicates
    } catch (error) {
      console.error('Error getting keywords:', error);
      return [];
    }
  };

  // Function to handle file processing
  const processFile = async (file) => {
    setProcessingFile(true);
    try {
      let text = '';
      if (file.type.startsWith('image/')) {
        text = await extractTextFromImage(file);
      } else if (file.type === 'application/pdf') {
        // Add PDF processing if needed
        text = 'PDF processing placeholder';
      }

      const keywords = await getKeywordsFromText(text);
      setExtractedKeywords(keywords);
      setMetadata(keywords.join(', '));
      setShowMintForm(true);
    } catch (error) {
      console.error('Error processing file:', error);
      alert('Error processing file. Please try again.');
    } finally {
      setProcessingFile(false);
    }
  };

  const uploadToPinata = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(
        'https://api.pinata.cloud/pinning/pinFileToIPFS',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            pinata_api_key: PINATA_API_KEY,
            pinata_secret_api_key: PINATA_SECRET_KEY,
          },
        }
      );

      return response.data.IpfsHash;
    } catch (error) {
      console.log('Error uploading to Pinata:', error);
      return null;
    }
  };

  const handleMint = async (e) => {
    e.preventDefault();
    if (!file || !metadata || !encryptionKey) return;

    try {
      setLoading(true);
      const ipfsHash = await uploadToPinata(file);
      if (!ipfsHash) throw new Error('Failed to upload to Pinata');

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, abi, signer);

      const tx = await contract.mintNFT(ipfsHash, metadata, encryptionKey);
      const receipt = await tx.wait();
      const event = receipt.events.find(event => event.event === 'NFTMinted');
      
      if (event) {
        const [tokenId] = event.args;
        setMintedTokenId(tokenId.toString());
      }

      // Reset form
      setFile(null);
      setMetadata('');
      setEncryptionKey('');
      setShowMintForm(false);
      setExtractedKeywords([]);
      
      alert(`NFT minted successfully! Token ID: ${mintedTokenId}`);
    } catch (error) {
      console.log('Error:', error);
      alert('Failed to mint NFT. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      await processFile(selectedFile);
    }
  };

  const addKeyword = (keyword) => {
    const currentKeywords = metadata.split(',').map(k => k.trim());
    if (!currentKeywords.includes(keyword)) {
      setMetadata(prevMetadata => 
        prevMetadata ? `${prevMetadata}, ${keyword}` : keyword
      );
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Add Invisible Watermark</h2>
      
      <WatermarkModal/>
    </div>
  );
};

export default MintNFT;