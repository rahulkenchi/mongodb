import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './component/Login';
import Signup from './component/Signup'
import Dashboard from './component/Dashboard'
import Settings from './component/Settings'
import Invoice from './component/Invoice'
import NavigationBar from './component/NavigationBar'
import Invo from './component/Invo'
function App() {
  return (
    <BrowserRouter>
      <NavigationBar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/invoice" element={<Invoice />} />
        <Route path="/invo" element={<Invo />} />
        <Route element={<Signup />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
