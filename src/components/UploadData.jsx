import React, { useState } from "react";
import upload from "../assets/upload.png";
import axios from "axios";
import Tesseract from "tesseract.js";
import { ethers } from 'ethers';

const CurvedArrow = () => (
  <svg className="absolute right-0 top-0 w-32 h-64" viewBox="0 0 100 300">
    <path
      d="M90,0 Q100,150 50,300"
      stroke="#FFD700"
      strokeWidth="4"
      fill="none"
    />
    <polygon points="45,290 55,290 50,300" fill="#FFD700" />
  </svg>
);

const WavyLine = () => (
  <svg className="absolute left-0 bottom-0 w-32 h-64" viewBox="0 0 100 300">
    <path
      d="M10,0 Q30,75 10,150 Q-10,225 10,300"
      stroke="#FFD700"
      strokeWidth="4"
      fill="none"
    />
  </svg>
);

const SpiralVector = () => (
  <svg className="absolute right-1/2 bottom-20 w-32 h-32" viewBox="0 0 100 100">
    <path
      d="M90,0 Q60,25 90,50 Q120,75 70,100"
      stroke="#FFD700"
      strokeWidth="4"
      fill="none"
      strokeLinecap="round"
    />
  </svg>
);

const DottedCurveVector = () => (
  <svg className="absolute left-1/4 top-0 w-32 h-64" viewBox="0 0 100 300">
    <path
      d="M10,0 Q20,150 -30,300"
      stroke="#FFD700"
      strokeWidth="4"
      fill="none"
      strokeDasharray="8,8"
    />
  </svg>
);

const UploadData = ({ contractAddress, walletAddress }) => {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [file, setFile] = useState(null);
  const [metadata, setMetadata] = useState("");
  const [encryptionKey, setEncryptionKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [mintedTokenId, setMintedTokenId] = useState(null);
  const [extractedKeywords, setExtractedKeywords] = useState([]);
  const [showMintForm, setShowMintForm] = useState(false);
  const [processingFile, setProcessingFile] = useState(false);

  const PINATA_API_KEY = "815cb6c5b936de120de6";
  const PINATA_SECRET_KEY =
    "71b9f2139171591882a5b4cbb9d5ab4846b9b845911a5960111a2cd8ad4a9984";
  const CONTRACT = "0x376Fb6EB51F0860d699EC73e49CB79AF7F9fE0f8";
  const GEMINI_API_KEY = "AIzaSyBXvyQXa7LjTNqqDkm3uvubhhkQ1A5dWZs";
  contractAddress = CONTRACT;

  const abi = [
    {
      inputs: [
        {
          internalType: "string",
          name: "ipfsHash",
          type: "string",
        },
        {
          internalType: "string",
          name: "metadata",
          type: "string",
        },
        {
          internalType: "string",
          name: "encryptedKey",
          type: "string",
        },
      ],
      name: "mintNFT",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "string",
          name: "ipfsHash",
          type: "string",
        },
        {
          indexed: false,
          internalType: "address",
          name: "owner",
          type: "address",
        },
      ],
      name: "NFTMinted",
      type: "event",
    },
  ];
  // const [file, setFile] = useState(null);
  // const [metadata, setMetadata] = useState('');
  // const [encryptionKey, setEncryptionKey] = useState('');
  // const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const extractTextFromImage = async (file) => {
    try {
      const result = await Tesseract.recognize(file, "eng", {
        logger: (m) => console.log(m),
      });
      return result.data.text;
    } catch (error) {
      console.error("Error in OCR:", error);
      return "";
    }
  };

  // Function to get keywords using Gemini
  const getKeywordsFromText = async (text) => {
    try {
      const response = await axios.post(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
        {
          contents: [
            {
              parts: [
                {
                  text: `Extract important single-word keywords from this text: ${text}`,
                },
              ],
            },
          ],
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          params: {
            key: GEMINI_API_KEY,
          },
        }
      );

      const keywords = response.data.candidates[0].content.parts[0].text
        .split(/[\s,]+/)
        .filter((word) => word.length > 0)
        .map((word) => word.toLowerCase().trim());

      return [...new Set(keywords)]; // Remove duplicates
    } catch (error) {
      console.error("Error getting keywords:", error);
      return [];
    }
  };

  // Function to handle file processing
 
  const processFile = async (file) => {
    setProcessingFile(true);
    try {
      let text = "";
      if (file.type.startsWith("image/")) {
        text = await extractTextFromImage(file);
      } else if (file.type === "application/pdf") {
        text = "PDF processing placeholder";
      } else {
        // For other file types, use the filename as text
        text = file.name;
      }

      // Add console logs for debugging
      console.log("Extracted text:", text);
      
      const keywords = await getKeywordsFromText(text);
      console.log("Generated keywords:", keywords);
      
      setExtractedKeywords(keywords);
      setMetadata(keywords.join(", "));
      setShowMintForm(true);
    } catch (error) {
      console.error("Error processing file:", error);
      alert("Error processing file. Please try again.");
    } finally {
      setProcessingFile(false);
    }
  };


  const uploadToPinata = async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            pinata_api_key: PINATA_API_KEY,
            pinata_secret_api_key: PINATA_SECRET_KEY,
          },
        }
      );

      return response.data.IpfsHash;
    } catch (error) {
      console.log("Error uploading to Pinata:", error);
      return null;
    }
  };

  const handleMint = async (e) => {
    e.preventDefault();
    if (!file || !metadata || !encryptionKey) return;

    try {
      setLoading(true);
      const ipfsHash = await uploadToPinata(file);
      if (!ipfsHash) throw new Error("Failed to upload to Pinata");

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, abi, signer);

      const tx = await contract.mintNFT(ipfsHash, metadata, encryptionKey);
      const receipt = await tx.wait();
      const event = receipt.events.find((event) => event.event === "NFTMinted");

      if (event) {
        const [tokenId] = event.args;
        setMintedTokenId(tokenId.toString());
      }

      // Reset form
      setFile(null);
      setMetadata("");
      setEncryptionKey("");
      setShowMintForm(false);
      setExtractedKeywords([]);

      alert(`NFT minted successfully! Token ID: ${mintedTokenId}`);
    } catch (error) {
      console.log("Error:", error);
      alert("Failed to mint NFT. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Create preview URL
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      await processFile(selectedFile);
    }
  };

  // const handleFileChange = async (e) => {
  //   const selectedFile = e.target.files[0];
  //   if (selectedFile) {
  //     setFile(selectedFile);
  //     await processFile(selectedFile);
  //   }
  // };
  const handleUploadClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "*"; // You can specify accepted file types here, e.g., 'image/*'
    input.onchange = handleFileChange;
    input.click();
  };
  const addKeyword = (keyword) => {
    const currentKeywords = metadata.split(",").map((k) => k.trim());
    if (!currentKeywords.includes(keyword)) {
      setMetadata((prevMetadata) =>
        prevMetadata ? `${prevMetadata}, ${keyword}` : keyword
      );
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !metadata || !encryptionKey) return;

    try {
      setLoading(true);
      // Upload logic here
      setTimeout(() => {
        setLoading(false);
        setFile(null);
        setMetadata("");
        setEncryptionKey("");
        alert("File uploaded successfully!");
      }, 2000);
    } catch (error) {
      console.error("Error:", error);
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 p-11 font-sans relative overflow-hidden">
      <CurvedArrow />

      <SpiralVector />

      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Left side - Preview */}
          <div className="flex flex-col">
            <div className="bg-gray-200 rounded-3xl overflow-hidden p-8 h-96">
              <img
                src={upload}
                alt="Preview"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="text-center mt-12">
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-800 mb-2">
                Secure Data
              </h1>
              <h2 className="text-5xl lg:text-6xl font-bold text-gray-800 mb-4">
                Upload
              </h2>
              <div className="flex items-center justify-center gap-2">
                <span className="text-lg lg:text-xl text-gray-600">
                  100% Encrypted and
                </span>
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                  Decentralized
                </span>
              </div>
            </div>
          </div>

          {/* Right side - Upload area */}
          <div className={`bg-white rounded-3xl px-8 pt-8 min-h-[350px] h-auto shadow-xl mt-8 lg:mt-24 ${showMintForm ? 'lg:w-[120%]' : ''} transition-all duration-300`}>
            <div
              className={`border-2 border-dashed rounded-2xl p-12 text-center relative
                ${dragActive ? "border-blue-500 bg-blue-50" : "border-gray-200"}
                ${loading ? "opacity-50" : ""}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {previewUrl && (
                <div className="mb-6">
                  <img
                    src={previewUrl}
                    alt="File preview"
                    className="max-h-48 mx-auto object-contain"
                  />
                </div>
              )}
              
              <button
                className="bg-blue-500 text-white rounded-full px-8 py-3 text-lg font-medium mb-4 hover:bg-blue-600 transition-colors"
                onClick={handleUploadClick}
                onChange={handleFileChange}
                disabled={loading}
              >
                Upload File
              </button>
              <p className="text-gray-500 text-sm">
                or drop a file,
                <br />
                {file ? file.name : "Maximum file size: 50MB"}
              </p>
              {/* <input
                type="file"
                onChange={handleFileChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                disabled={processingFile}
              /> */}
              {extractedKeywords.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-2">
                    Extracted Keywords:
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {extractedKeywords.map((keyword, index) => (
                      <button
                        key={index}
                        onClick={() => addKeyword(keyword)}
                        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm"
                      >
                        {keyword}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {processingFile && (
                <p className="mt-2 text-sm text-gray-600">Processing file...</p>
              )}

              

              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-2xl">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-gray-600">
                      Uploading to Blockchain...
                    </p>
                  </div>
                </div>
              )}
            </div>

            {file && !loading && showMintForm && (
              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                  Metadata (Keywords)
                  </label>
                  <input
                    
                    value={metadata}
                    onChange={(e) => setMetadata(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="3"
              placeholder="Edit or add more keywords, separated by commas"
              required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Encryption Key
                  </label>
                  <input
                    type="text"
                    value={encryptionKey}
                    onChange={(e) => setEncryptionKey(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter encryption key"
                    required
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={handleUpload}
                    className="flex-1 bg-blue-500 text-white rounded-full py-3 hover:bg-blue-600 transition-colors"
                  >
                    Normal Upload
                  </button>
                  <button
                  type="submit"
                    onClick={handleMint}
                    disabled={loading}
                    // className="flex-1 bg-indigo-600 text-white rounded-full py-3 hover:bg-indigo-700 transition-colors"
                    className={`flex-1 bg-indigo-600 text-white rounded-full py-3 hover:bg-indigo-700 transition-colors ${
                      loading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {loading ? 'Minting...' : 'Proceed with Minting'}
                    
                  {/* >
                    Mint as NFT */}
                  </button>
                </div>
              </div>
            )}
     

      {mintedTokenId && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-700">
            NFT minted successfully! Token ID: {mintedTokenId}
          </p>
        </div>
      )}
            <p className="text-center text-sm text-gray-500 bottom-0 mt-28  ">
              By uploading, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadData;
