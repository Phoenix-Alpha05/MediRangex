import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import { CommandCenter } from './pages/CommandCenter';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/command-center" element={<CommandCenter />} />
        <Route path="/dashboard/command-center" element={<CommandCenter />} />
      </Routes>
    </BrowserRouter>
  );
}
