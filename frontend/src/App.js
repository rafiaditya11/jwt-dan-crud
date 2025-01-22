import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Dashboard from './components/dashboard';
import Login from './components/login';
import Navbar from './components/navbar';
import Register from './components/register';
import Update from './components/update';
import Create from './components/create';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<><Navbar /><Dashboard /></>} />
        <Route path="/dashboard/register" element={<><Navbar /><Register /></>} />
        <Route path="/dashboard/create" element={<><Navbar /><Create /></>} />
        <Route path="/edit-user/:id" element={<><Navbar /><Update /></>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;