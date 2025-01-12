import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import  Login from './pages/Login';
import UserDashboard  from './pages/UserDashboard';
import  CompanyDashboard  from './pages/CompanyDashboard';
import { Profile } from './components/Profile';
import { Upload } from './components/Upload';
import { FileDetails } from './components/FileDetails';
import DataRequests from './components/DataRequests';
import Settings from './components/Settings';
import { Analytics } from './components/Analytics';
import { MetadataTracker } from './components/MetaDataTracker';
import FloatingChatButton from './components/FloatingChatButton';
import GTranslate from './components/GTranslate';
import Register from './pages/Register';

export const App = () => (
  <BrowserRouter>
  <GTranslate/>

    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/user-dashboard" element={<UserDashboard />} />
      <Route path="/company-dashboard" element={<CompanyDashboard />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/upload" element={<Upload />} />
      <Route path="/file/:id" element={<FileDetails />} />
      <Route path="/requests" element={<DataRequests />} />
      <Route path="/metadata-tracker" element={<MetadataTracker />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/analytics" element={<Analytics />} />
    </Routes>
    <FloatingChatButton/>
  </BrowserRouter>
);

export default App;