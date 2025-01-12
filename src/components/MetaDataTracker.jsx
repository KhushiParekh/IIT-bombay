export const MetadataTracker = () => {
    const fileMetadata = [
      {
        name: 'document.pdf',
        type: 'NFT',
        hash: '0x7d35Cc66',
        timestamp: '2024-01-09T10:30:00Z',
        accessCount: 5,
        lastAccessed: '2024-01-09T15:45:00Z'
      },
      {
        name: 'data.json',
        type: 'IPFS',
        hash: 'QmW2WQi7j6c7UgJLXXX',
        timestamp: '2024-01-08T14:20:00Z',
        accessCount: 3,
        lastAccessed: '2024-01-09T12:30:00Z'
      }
    ];
  
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h1 className="text-2xl font-bold mb-6">Data Metadata Tracker</h1>
          
          <div className="space-y-4">
            {fileMetadata.map((file, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{file.name}</h3>
                    <p className="text-sm text-gray-500">
                      Stored as: {file.type}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    file.type === 'NFT' 
                      ? 'bg-indigo-100 text-indigo-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {file.type}
                  </span>
                </div>
                
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Hash</p>
                    <p className="font-mono">{file.hash}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Uploaded</p>
                    <p>{new Date(file.timestamp).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Access Count</p>
                    <p>{file.accessCount}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Last Accessed</p>
                    <p>{new Date(file.lastAccessed).toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="mt-4 flex justify-end space-x-2">
                  <button className="px-3 py-1 border rounded-lg hover:bg-gray-50">
                    View History
                  </button>
                  <button className="px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                    Manage Access
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };