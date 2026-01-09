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
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  }); 
  const [apiKey, setApiKey] = useState(import.meta.env.VITE_GEMINI_API_KEY || ''); 
  const [chatApiKey, setChatApiKey] = useState(import.meta.env.VITE_GEMINI_CHAT_KEY || ''); // Separate Chat Key

  const login = (name) => {
    const userData = { name };
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <TripContext.Provider value={{
      tripData, setTripData,
      itinerary, setItinerary,
      hotels, setHotels,
      user, login, logout,
      apiKey, setApiKey,
      chatApiKey, setChatApiKey
    }}>
      {children}
    </TripContext.Provider>
  );
};

export const useTrip = () => useContext(TripContext);
