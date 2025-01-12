import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const DataAnalysisDashboard = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const [riskScore, setRiskScore] = useState(0);
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');
  
  const CONTRACT_ADDRESS = '0x376Fb6EB51F0860d699EC73e49CB79AF7F9fE0f8';
  const GEMINI_API_KEY = 'AIzaSyCTqdOJSJ1QhPR1q2cey_ItEGrOIc_X8II';
  
  const CONTRACT_ABI = [
    "function getUserUploadedData(address user) public view returns (string[] memory, string[] memory, bool[] memory, bool[] memory)"
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const fetchUserData = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      
      const accounts = await provider.listAccounts();
      if (accounts.length === 0) {
        throw new Error("No account connected");
      }

      const data = await contract.getUserUploadedData(accounts[0]);
      
      // Transform data for visualization
      const processedData = {
        files: data[0],
        metadata: data[1],
        isNFT: data[2],
        isUniversal: data[3]
      };

      // Calculate statistics
      const stats = {
        totalFiles: data[0].length,
        nftCount: data[2].filter(Boolean).length,
        universalCount: data[3].filter(Boolean).length,
        privateCount: data[3].filter(x => !x).length
      };

      setUserData({ raw: processedData, stats });
      
      // Calculate risk score
      const score = calculateRiskScore(processedData);
      setRiskScore(score);

      // Get AI recommendations
      await getAIRecommendations(processedData);

    } catch (error) {
      console.error('Error fetching data:', error);
      setRecommendations(['Error analyzing data. Please try again.']);
    } finally {
      setLoading(false);
    }
  };

  const calculateRiskScore = (data) => {
    if (!data.files.length) return 0;
    
    const universalRatio = data.isUniversal.filter(Boolean).length / data.files.length;
    const nftRatio = data.isNFT.filter(Boolean).length / data.files.length;
    
    return Math.min(100, (universalRatio * 50) + (nftRatio * 30) + (data.files.length / 10));
  };

  const getAIRecommendations = async (data) => {
    try {
      const prompt = `Analyze this blockchain file storage data and provide 3-5 specific security and management recommendations:
        Total Files: ${data.files.length}
        NFT Files: ${data.isNFT.filter(Boolean).length}
        Universal Access Files: ${data.isUniversal.filter(Boolean).length}
        Private Files: ${data.isUniversal.filter(x => !x).length}`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1024,
            }
          })
        }
      );

      if (!response.ok) throw new Error('API request failed');
      
      const result = await response.json();
      const recommendations = result.candidates[0].content.parts[0].text
        .split('\n')
        .filter(rec => rec.trim())
        .slice(0, 5);
      
      setRecommendations(recommendations);

    } catch (error) {
      console.error('Error getting AI recommendations:', error);
      setRecommendations(['Failed to generate recommendations. Please try again.']);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [selectedTimeframe]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const pieChartData = userData ? [
    { name: 'NFTs', value: userData.stats.nftCount },
    { name: 'Universal', value: userData.stats.universalCount },
    { name: 'Private', value: userData.stats.privateCount }
  ] : [];

  return (
    <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Data Analysis Dashboard</h2>
      </div>

      {/* Risk Score */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Risk Score</h3>
          <div className={`text-2xl font-bold ${
            riskScore > 70 ? 'text-red-500' : 
            riskScore > 40 ? 'text-yellow-500' : 'text-green-500'
          }`}>
            {riskScore.toFixed(1)}%
          </div>
        </div>
        <div className="mt-2 h-2 bg-gray-200 rounded-full">
          <div 
            className={`h-full rounded-full ${
              riskScore > 70 ? 'bg-red-500' : 
              riskScore > 40 ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${riskScore}%` }}
          ></div>
        </div>
      </div>

      {/* File Distribution Chart */}
      <div className="mb-8 h-64">
        <h3 className="text-lg font-semibold mb-4">File Distribution</h3>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieChartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {pieChartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* AI Recommendations */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">AI Recommendations</h3>
        <div className="space-y-4">
          {recommendations.map((rec, index) => (
            <div key={index} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {rec.toLowerCase().includes('error') ? (
                    <span className="text-red-500">⚠️</span>
                  ) : rec.toLowerCase().includes('risk') ? (
                    <span className="text-yellow-500">⚠️</span>
                  ) : (
                    <span className="text-green-500">✓</span>
                  )}
                </div>
                <p className="ml-3 text-sm text-gray-700">{rec}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Time Frame Selector */}
      <div className="flex justify-end space-x-2">
        {['week', 'month', 'year'].map((timeframe) => (
          <button
            key={timeframe}
            onClick={() => setSelectedTimeframe(timeframe)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              selectedTimeframe === timeframe
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default DataAnalysisDashboard;