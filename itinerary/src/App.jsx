import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { TripProvider } from './context/TripContext';
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import ItineraryPage from './pages/ItineraryPage';
import HotelsPage from './pages/HotelsPage';

function App() {
  return (
    <TripProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/itinerary" element={<ItineraryPage />} />
          <Route path="/hotels" element={<HotelsPage />} />
        </Routes>
      </Router>
    </TripProvider>
  );
}

export default App;
