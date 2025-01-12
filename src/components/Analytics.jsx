import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const Analytics = () => {
  const data = [
    { month: 'Jan', requests: 65, approvals: 45 },
    { month: 'Feb', requests: 80, approvals: 60 },
    { month: 'Mar', requests: 70, approvals: 55 },
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-2 bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-6">Data Access Trends</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="requests" stroke="#4F46E5" />
                <Line type="monotone" dataKey="approvals" stroke="#10B981" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Summary</h2>
            <div className="space-y-4">
              <div className="p-4 bg-indigo-50 rounded-lg">
                <p className="text-2xl font-bold text-indigo-600">75%</p>
                <p className="text-sm text-gray-600">Approval Rate</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">24</p>
                <p className="text-sm text-gray-600">Active Shares</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">1.2GB</p>
                <p className="text-sm text-gray-600">Data Shared</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Top Requesters</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span>Company A</span>
                <span className="text-indigo-600">45 requests</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Company B</span>
                <span className="text-indigo-600">32 requests</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Company C</span>
                <span className="text-indigo-600">28 requests</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
