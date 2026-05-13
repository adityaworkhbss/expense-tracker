import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Emis from './pages/Emis';
import More from './pages/More';
import Categories from './pages/Categories';
import Accounts from './pages/Accounts';
import Analysis from './pages/Analysis';
import BottomNav from './components/BottomNav';

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/emis" element={<Emis />} />
          <Route path="/more" element={<More />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/accounts" element={<Accounts />} />
          <Route path="/analysis" element={<Analysis />} />
        </Routes>
        <BottomNav />
      </div>
    </BrowserRouter>
  );
}

export default App;
