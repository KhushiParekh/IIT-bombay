import React from 'react';

export const FileDetails = () => {
  const accessLog = [
    { company: 'Company A', date: '2024-01-08', action: 'Viewed' },
    { company: 'Company B', date: '2024-01-07', action: 'Downloaded' },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-sm p-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-bold">Personal Data.pdf</h1>
            <p className="text-gray-600">Uploaded on Jan 5, 2024</p>
          </div>
          <div className="flex space-x-2">
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              Share
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              Download
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8">
          <div>
            <h2 className="text-lg font-semibold mb-4">File Information</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-500">Size</label>
                <p>2.4 MB</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Type</label>
                <p>PDF Document</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Status</label>
                <p>Private</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Encryption</label>
                <p>Enabled</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">Access Log</h2>
            <div className="space-y-4">
              {accessLog.map((log, index) => (
                <div key={index} className="flex justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{log.company}</p>
                    <p className="text-sm text-gray-500">{log.date}</p>
                  </div>
                  <span className="text-indigo-600">{log.action}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Sharing Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Access Level
              </label>
              <select className="w-full px-4 py-2 border rounded-lg">
                <option>Private</option>
                <option>Public</option>
                <option>Selected Users</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expiration
              </label>
              <input 
                type="date" 
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};