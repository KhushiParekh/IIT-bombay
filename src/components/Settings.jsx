import React from 'react'

const Settings = () => {
    return (
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h1 className="text-2xl font-bold mb-8">Settings</h1>
            
            <div className="space-y-8">
              <section>
                <h2 className="text-lg font-semibold mb-4">Notification Preferences</h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Email notifications</span>
                    <input type="checkbox" defaultChecked className="toggle" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Data access alerts</span>
                    <input type="checkbox" defaultChecked className="toggle" />
                  </div>
                </div>
              </section>
    
              <section>
                <h2 className="text-lg font-semibold mb-4">Default Data Settings</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm mb-2">Default Privacy Level</label>
                    <select className="w-full px-4 py-2 border rounded-lg">
                      <option>Private</option>
                      <option>Public</option>
                      <option>Selected Users</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm mb-2">Auto-encryption</label>
                    <select className="w-full px-4 py-2 border rounded-lg">
                      <option>Always encrypt</option>
                      <option>Ask each time</option>
                      <option>Never encrypt</option>
                    </select>
                  </div>
                </div>
              </section>
    
              <section>
                <h2 className="text-lg font-semibold mb-4">Security</h2>
                <div className="space-y-4">
                  <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                    Change Password
                  </button>
                  <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                    Enable 2FA
                  </button>
                </div>
              </section>
            </div>
          </div>
        </div>
      );
}

export default Settings
