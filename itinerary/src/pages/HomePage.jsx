import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrip } from '../context/TripContext';
import { Calendar, MapPin, Users, Wallet, Clock, Plane, LogOut } from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();
  const { setTripData, tripData, setApiKey, apiKey, user, logout } = useTrip();

  // Get Initials from user name or default to 'TR' (Traveler)
  const getInitials = () => {
      if (user && user.name) {
          return user.name.slice(0, 2).toUpperCase();
      }
      return 'TR';
  };
  
  const handleLogout = () => {
      logout();
      navigate('/');
  };
  
  const [formData, setFormData] = useState({
    destination: tripData?.destination || '',
    days: tripData?.days || 3,
    budget: tripData?.budget || 'Medium',
    travelers: tripData?.travelers || 1,
    tripType: tripData?.tripType || 'Solo',
    dates: tripData?.dates || '',
  });

  const [loading, setLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerate = () => {
    if (!apiKey) {
      alert("API Key is missing! Please set VITE_GEMINI_API_KEY in .env file.");
      return;
    }
    setLoading(true);
    setTripData(formData);
    // Navigate immediately, let the ItineraryPage handle the loading/fetching
    // This prevents the "Generating..." state from getting stuck if we waited here.
    // The ItineraryPage creates the effect hook to fetch data.
    navigate('/itinerary');
  };

  const budgetOptions = ['Cheap', 'Medium', 'Luxury'];
  const tripTypes = ['Solo', 'Couple', 'Family', 'Friends'];

  return (
    <div className="min-h-screen premium-bg text-gray-900 font-sans pb-20">
      {/* Header */}
      <header className="bg-white/70 backdrop-blur-md shadow-sm sticky top-0 z-40 border-b border-white/20">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-lg">
                <Plane className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-purple-700">AI Travel Planner</span>
          </div>
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold border border-white shadow-lg ring-2 ring-purple-100 cursor-default">
               {getInitials()}
             </div>
             <button 
                onClick={handleLogout}
                className="p-2 rounded-full hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                title="Logout"
             >
                <LogOut className="w-5 h-5" />
             </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 mt-12 animate-fade-in">
        <div className="text-center mb-12 space-y-4">
          <h2 className="text-5xl md:text-6xl font-black text-slate-800 tracking-tight leading-tight">
             Plan your next <br/> 
             <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">Adventure</span> ⛺️
          </h2>
          <p className="text-slate-500 text-xl font-medium max-w-2xl mx-auto">Fill in your preferences and let our AI craft the perfect itinerary for you in seconds.</p>
        </div>

        <div className="glass-card rounded-[2.5rem] p-8 md:p-12 space-y-10 shadow-2xl ring-1 ring-white/60 relative overflow-hidden">
             
             {/* Decorative blob */}
             <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl rounded-bl-[10rem]"></div>

            {/* Destination */}
            <div className="space-y-4 relative z-10">
                <label className="text-xl font-bold flex items-center gap-3 text-slate-800">
                    <div className="p-2 bg-orange-100 rounded-lg text-orange-600"><MapPin className="w-6 h-6" /></div>
                    What is your destination of choice?
                </label>
                <input 
                    type="text" 
                    className="w-full p-5 bg-white/50 border border-gray-200/60 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 hover:border-blue-300 transition-all outline-none text-xl font-medium placeholder:text-gray-400 backdrop-blur-sm" 
                    placeholder="e.g. Paris, Tokyo, New York"
                    value={formData.destination}
                    onChange={(e) => handleInputChange('destination', e.target.value)}
                />
            </div>

            {/* Days & Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                 <div className="space-y-4">
                    <label className="text-xl font-bold flex items-center gap-3 text-slate-800">
                        <div className="p-2 bg-blue-100 rounded-lg text-blue-600"><Clock className="w-6 h-6" /></div>
                        How many days?
                    </label>
                    <input 
                        type="number" 
                        min="1" max="30"
                        className="w-full p-5 bg-white/50 border border-gray-200/60 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none text-xl font-medium backdrop-blur-sm" 
                        placeholder="Ex. 3"
                        value={formData.days}
                        onChange={(e) => handleInputChange('days', e.target.value)}
                    />
                </div>
                <div className="space-y-4">
                    <label className="text-xl font-bold flex items-center gap-3 text-slate-800">
                         <div className="p-2 bg-purple-100 rounded-lg text-purple-600"><Calendar className="w-6 h-6" /></div>
                         Preferred Dates
                    </label>
                    <input 
                        type="date"
                        className="w-full p-5 bg-white/50 border border-gray-200/60 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none text-xl font-medium text-gray-600 backdrop-blur-sm" 
                        value={formData.dates}
                        onChange={(e) => handleInputChange('dates', e.target.value)}
                    />
                </div>
            </div>

            {/* Budget */}
            <div className="space-y-4 relative z-10">
                <label className="text-xl font-bold flex items-center gap-3 text-slate-800">
                    <div className="p-2 bg-green-100 rounded-lg text-green-600"><Wallet className="w-6 h-6" /></div>
                    What is Your Budget?
                </label>
                <div className="grid grid-cols-3 gap-6">
                    {budgetOptions.map(option => (
                        <div 
                            key={option}
                            onClick={() => handleInputChange('budget', option)}
                            className={`p-6 border rounded-2xl cursor-pointer transition-all duration-300 flex flex-col items-center justify-center gap-3 hover:shadow-xl hover:-translate-y-1
                                ${formData.budget === option 
                                    ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-blue-200 ring-2 ring-blue-500' 
                                    : 'border-gray-200 bg-white/60 hover:border-blue-300'}
                            `}
                        >
                            <span className="text-4xl filter drop-shadow-sm">
                                {option === 'Cheap' ? '💵' : option === 'Medium' ? '💰' : '💎'}
                            </span>
                            <span className={`font-bold text-lg ${formData.budget === option ? 'text-blue-700' : 'text-gray-600'}`}>{option}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Travelers & Type */}
            <div className="space-y-4 relative z-10">
                <label className="text-xl font-bold flex items-center gap-3 text-slate-800">
                    <div className="p-2 bg-pink-100 rounded-lg text-pink-600"><Users className="w-6 h-6" /></div>
                    Who do you plan on traveling with?
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                     {tripTypes.map(type => (
                        <div 
                            key={type}
                            onClick={() => handleInputChange('tripType', type)}
                            className={`p-4 border rounded-2xl cursor-pointer transition-all duration-300 flex flex-col items-center justify-center gap-2 hover:shadow-xl hover:-translate-y-1
                                ${formData.tripType === type 
                                    ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 shadow-purple-200 ring-2 ring-purple-500' 
                                    : 'border-gray-200 bg-white/60 hover:border-purple-300'}
                            `}
                        >
                             <span className="text-3xl filter drop-shadow-sm">
                                {type === 'Solo' ? '✈️' : type === 'Couple' ? '🥂' : type === 'Family' ? '🏡' : '⛵️'}
                            </span>
                            <span className={`font-bold ${formData.tripType === type ? 'text-purple-700' : 'text-gray-600'}`}>{type}</span>
                        </div>
                    ))}
                </div>
                 {/* Number of people input if not solo */}
                 {formData.tripType !== 'Solo' && (
                     <div className="mt-6 flex items-center gap-6 bg-white/60 p-4 rounded-2xl border border-gray-200 animate-fade-in shadow-inner">
                        <span className="text-gray-700 font-bold ml-2 text-lg">Number of Travelers:</span>
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={() => handleInputChange('travelers', Math.max(1, formData.travelers - 1))}
                                className="w-10 h-10 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center hover:bg-gray-50 text-xl font-bold text-gray-600 active:scale-95 transition"
                            >-</button>
                            <span className="font-black text-2xl w-8 text-center text-slate-800">{formData.travelers}</span>
                            <button 
                                onClick={() => handleInputChange('travelers', formData.travelers + 1)}
                                className="w-10 h-10 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center hover:bg-gray-50 text-xl font-bold text-gray-600 active:scale-95 transition"
                            >+</button>
                        </div>
                     </div>
                 )}
            </div>

            {/* Generate Button */}
            <div className="pt-8 pb-4">
                <button 
                    onClick={handleGenerate}
                    disabled={loading || !formData.destination || !formData.days}
                    className={`group relative w-full py-5 rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-violet-500/50 active:scale-95
                        ${(loading || !formData.destination) ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}
                    `}
                >
                    {/* Animated Gradient Background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 animate-gradient-xy opacity-90 group-hover:opacity-100 transition-opacity" />
                    
                    {/* Glass Shine Effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-gradient-to-r from-transparent via-white to-transparent -skew-x-12 translate-x-[-100%] group-hover:animate-shine transition-all" />

                    <span className="relative flex items-center justify-center gap-3 text-white font-bold text-xl tracking-wide">
                        {loading ? (
                             <>
                                <span className="animate-spin text-2xl">✨</span> 
                                Crafting your journey...
                             </>
                        ) : (
                            <>
                                Generate Dream Itinerary 
                                <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                                    <Plane className="w-5 h-5 -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                                </div>
                            </>
                        )}
                    </span>
                </button>
            </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
