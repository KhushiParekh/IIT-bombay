import React from 'react'

const DataRequests = () => {
    const requests = [
        {
          id: 1,
          company: 'Tech Corp',
          file: 'medical_records.pdf',
          status: 'pending',
          date: '2024-01-09',
          purpose: 'Research analysis',
          duration: '3 months'
        },
        {
          id: 2,
          company: 'Data Analytics Ltd',
          file: 'financial_data.csv',
          status: 'approved',
          date: '2024-01-08',
          purpose: 'Market research',
          duration: '1 month'
        },
        {
          id: 3,
          company: 'AI Solutions',
          file: 'personal_info.json',
          status: 'rejected',
          date: '2024-01-07',
          purpose: 'ML training',
          duration: '6 months'
        }
      ];
    
      const getStatusStyle = (status) => {
        switch(status) {
          case 'pending': return 'bg-yellow-100 text-yellow-800';
          case 'approved': return 'bg-green-100 text-green-800';
          case 'rejected': return 'bg-red-100 text-red-800';
          default: return 'bg-gray-100';
        }
      };
    
      return (
        <div className="max-w-5xl mx-auto p-6">
          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold">Data Access Requests</h1>
              <div className="flex space-x-2">
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                  Review All
                </button>
              </div>
            </div>
    
            <div className="space-y-4">
              {requests.map((request) => (
                <div key={request.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{request.company}</h3>
                      <p className="text-sm text-gray-500">File: {request.file}</p>
                      <p className="text-sm text-gray-500">Purpose: {request.purpose}</p>
                      <p className="text-sm text-gray-500">Duration: {request.duration}</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={`px-3 py-1 rounded-full text-sm ${getStatusStyle(request.status)}`}>
                        {request.status}
                      </span>
                      <span className="text-sm text-gray-500 mt-2">{request.date}</span>
                    </div>
                  </div>
                  
                  {request.status === 'pending' && (
                    <div className="mt-4 flex space-x-2 justify-end">
                      <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                        Approve
                      </button>
                      <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      );
}

export default DataRequests
