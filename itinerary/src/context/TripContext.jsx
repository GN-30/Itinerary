import { createContext, useState, useContext } from 'react';

const TripContext = createContext();

export const TripProvider = ({ children }) => {
  const [tripData, setTripData] = useState({
    destination: '',
    budget: '',
    travelers: 1,
    tripType: '',
    dates: '',
    // ...other fields
  });
  const [itinerary, setItinerary] = useState(null);
  const [hotels, setHotels] = useState(null);
  const [user, setUser] = useState(null); // Mock auth user
  const [apiKey, setApiKey] = useState(import.meta.env.VITE_GEMINI_API_KEY || ''); // Load from Env or empty

  const login = (name) => setUser({ name });
  const logout = () => setUser(null);

  return (
    <TripContext.Provider value={{
      tripData, setTripData,
      itinerary, setItinerary,
      hotels, setHotels,
      user, login, logout,
      apiKey, setApiKey
    }}>
      {children}
    </TripContext.Provider>
  );
};

export const useTrip = () => useContext(TripContext);
