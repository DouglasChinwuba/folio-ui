import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import './App.css'
import LoginPage from './features/auth/LoginPage'
import Dashboard from './features/dashboard/DashBoard'
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
          />
      </Routes>
    </Router>
  )
}

export default App;
