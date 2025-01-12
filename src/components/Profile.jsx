import React from 'react';

export const Profile = () => (
  <div className="max-w-4xl mx-auto p-6">
    <div className="bg-white rounded-xl shadow-sm p-8">
      <div className="flex items-center space-x-6 mb-8">
        <div className="w-24 h-24 bg-gray-200 rounded-full"></div>
        <div>
          <h1 className="text-2xl font-bold">John Doe</h1>
          <p className="text-gray-600">john.doe@example.com</p>
        </div>
      </div>
      
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-3">Personal Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <input
              className="px-4 py-2 border rounded-lg"
              placeholder="First Name"
              defaultValue="John"
            />
            <input
              className="px-4 py-2 border rounded-lg"
              placeholder="Last Name"
              defaultValue="Doe"
            />
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3">Security</h2>
          <div className="space-y-4">
            <input
              type="password"
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="Current Password"
            />
            <input
              type="password"
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="New Password"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  </div>
);