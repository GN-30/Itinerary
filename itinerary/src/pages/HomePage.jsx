import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrip } from '../context/TripContext';
import { Calendar, MapPin, Users, Wallet, Clock, Plane, LogOut, Heart, User, Sparkles, Tent, Leaf, Landmark, Mountain, Building2 } from 'lucide-react';
import confetti from 'canvas-confetti';

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

  // TRIGGER ANIMATIONS


  const fireConfettiExplosion = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min, max) => Math.random() * (max - min) + min;

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  };

  const fireSoloExplosion = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#3b82f6', '#1d4ed8', '#60a5fa', '#93c5fd'], // Shades of Blue
      shapes: ['star'],
      scalar: 1.2
    });
  };

  const fireHeartExplosion = () => {
    const defaults = {
      spread: 360,
      ticks: 100,
      gravity: 0,
      decay: 0.94,
      startVelocity: 30,
      colors: ['#FFC0CB', '#FF69B4', '#FF1493', '#C71585']
    };

    confetti({
      ...defaults,
      particleCount: 50,
      scalar: 2,
      shapes: ['circle'] // Fallback base
    });

    confetti({
      ...defaults,
      particleCount: 30,
      scalar: 3,
      shapes: ['star'], // Emulate sparkle
      colors: ['#FFE4E1', '#FF69B4'] 
    });
    
    // Explicit Heart Emoji Burst
    confetti({
        ...defaults,
        particleCount: 15,
        scalar: 4,
        shapes: ['text'],
        shapeOptions: {
            text: {
                value: ['❤️', '💖', '💕']
            }
        }
      });
  };

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

        <div className="glass-card rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-12 space-y-8 md:space-y-10 shadow-2xl ring-1 ring-white/60 relative overflow-hidden">
             
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
                    Who are you traveling with?
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { type: 'Solo', icon: User, count: 1 },
                        { type: 'Couple', icon: Heart, count: 2 },
                        { type: 'Family', icon: Users, count: 4 },
                        { type: 'Friends', icon: Tent, count: 3 }
                    ].map(({ type, icon: Icon, count }) => (
                        <div 
                            key={type}
                            onClick={() => {
                                handleInputChange('tripType', type);
                                if (type === 'Couple') {
                                    handleInputChange('travelers', 2);
                                    fireHeartExplosion();
                                }
                                if (type === 'Solo') {
                                    handleInputChange('travelers', 1);
                                    fireSoloExplosion();
                                }
                                if (type === 'Family') {
                                    handleInputChange('travelers', 4);
                                    fireConfettiExplosion();
                                }
                                if (type === 'Friends') {
                                    handleInputChange('travelers', 3);
                                    fireConfettiExplosion();
                                }
                            }}
                            className={`
                                cursor-pointer rounded-2xl p-4 border transition-all duration-300 flex flex-col items-center justify-center gap-3 text-center relative overflow-hidden group hover:shadow-lg hover:-translate-y-1
                                ${formData.tripType === type 
                                    ? 'border-pink-500 bg-pink-50 text-pink-700 shadow-lg shadow-pink-100 ring-1 ring-pink-500' 
                                    : 'border-slate-200 hover:border-pink-300 bg-white/50 text-slate-600'
                                }
                            `}
                        >
                            <div className={`p-3 rounded-full transition-colors duration-300 ${formData.tripType === type ? 'bg-pink-200/50 text-pink-600' : 'bg-slate-100 text-slate-400 group-hover:bg-pink-100 group-hover:text-pink-500'}`}>
                                <Icon className="w-8 h-8" />
                            </div>
                            <span className="relative z-10 font-bold text-lg">{type}</span>
                        </div>
                    ))}
                </div>

                 {/* Number of people input - ONLY for Family/Friends */}
                 {['Family', 'Friends'].includes(formData.tripType) && (
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

            {/* Interests Selection */}
            <div className="space-y-4 relative z-10 pt-4">
                 <label className="text-xl font-bold flex items-center gap-3 text-slate-800">
                    <div className="p-2 bg-teal-100 rounded-lg text-teal-600"><Sparkles className="w-6 h-6" /></div>
                    What are your interests? <span className="text-sm font-normal text-slate-400">(Select multiple)</span>
                </label>
                <div className="flex flex-wrap gap-3">
                    {[
                        { name: 'Nature', icon: Leaf },
                        { name: 'History', icon: Landmark },
                        { name: 'Spiritual', icon: Sparkles }, // or maybe Sun/Moon
                        { name: 'Adventure', icon: Mountain },
                        { name: 'City Life', icon: Building2 }
                    ].map(({ name, icon: Icon }) => (
                        <button
                            key={name}
                            onClick={() => {
                                const current = formData.interests || [];
                                const improved = current.includes(name) 
                                    ? current.filter(i => i !== name)
                                    : [...current, name];
                                handleInputChange('interests', improved);
                            }}
                            className={`
                                cursor-pointer px-6 py-3 rounded-xl font-bold border transition-all duration-300 transform active:scale-95 flex items-center gap-2 group hover:shadow-md hover:-translate-y-0.5
                                ${(formData.interests || []).includes(name)
                                    ? 'border-teal-500 bg-teal-500 text-white shadow-lg shadow-teal-500/30 ring-1 ring-teal-400'
                                    : 'border-slate-200 text-slate-600 hover:border-teal-300 hover:text-teal-600 bg-white/50 hover:bg-white'
                                }
                            `}
                        >
                            <Icon className={`w-5 h-5 transition-transform duration-300 ${(formData.interests || []).includes(name) ? 'scale-110' : 'group-hover:scale-110'}`} />
                            {name}
                        </button>
                    ))}
                </div>
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
                                <Plane className="mr-2 w-6 h-6 animate-bounce" />
                                Taking off...
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
