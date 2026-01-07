import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrip } from '../context/TripContext';
import { Calendar, MapPin, Users, Wallet, Clock, Plane } from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();
  const { setTripData, tripData, setApiKey, apiKey } = useTrip();

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
    <div className="min-h-screen bg-slate-50 text-gray-900 font-sans pb-10">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Plane className="w-6 h-6 text-blue-600" />
            <span className="font-bold text-xl">AI Travel Planner</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
              AG
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 mt-10">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-extrabold text-gray-800 mb-3">Tell us your travel preferences ⛺️🌴</h2>
          <p className="text-gray-500 text-lg">Just provide some basic information, and our itinerary planner will generate a customized itinerary based on your preferences.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 space-y-8 border border-gray-100">
            
            {/* Destination */}
            <div className="space-y-2">
                <label className="text-lg font-semibold flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-orange-500" /> What is your destination of choice?
                </label>
                <input 
                    type="text" 
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 hover:shadow-md transition outline-none text-lg" 
                    placeholder="e.g. Paris, Tokyo, New York"
                    value={formData.destination}
                    onChange={(e) => handleInputChange('destination', e.target.value)}
                />
            </div>

            {/* Days & Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-lg font-semibold flex items-center gap-2">
                        <Clock className="w-5 h-5 text-blue-500" /> How many days?
                    </label>
                    <input 
                        type="number" 
                        min="1" max="30"
                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-lg" 
                        placeholder="Ex. 3"
                        value={formData.days}
                        onChange={(e) => handleInputChange('days', e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-lg font-semibold flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-purple-500" /> Preferred Dates
                    </label>
                    <input 
                        type="date"
                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-lg" 
                        value={formData.dates}
                        onChange={(e) => handleInputChange('dates', e.target.value)}
                    />
                </div>
            </div>

            {/* Budget */}
            <div className="space-y-2">
                <label className="text-lg font-semibold flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-green-600" /> What is Your Budget?
                </label>
                <div className="grid grid-cols-3 gap-4">
                    {budgetOptions.map(option => (
                        <div 
                            key={option}
                            onClick={() => handleInputChange('budget', option)}
                            className={`p-4 border rounded-xl cursor-pointer transition-all flex flex-col items-center justify-center gap-2 hover:shadow-lg
                                ${formData.budget === option ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-500' : 'border-gray-200 bg-white hover:border-blue-300'}
                            `}
                        >
                            <span className="text-2xl">
                                {option === 'Cheap' ? '💵' : option === 'Medium' ? '💰' : '💎'}
                            </span>
                            <span className="font-semibold text-gray-700">{option}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Travelers & Type */}
            <div className="space-y-2">
                <label className="text-lg font-semibold flex items-center gap-2">
                    <Users className="w-5 h-5 text-pink-500" /> Who do you plan on traveling with?
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                     {tripTypes.map(type => (
                        <div 
                            key={type}
                            onClick={() => handleInputChange('tripType', type)}
                            className={`p-4 border rounded-xl cursor-pointer transition-all flex flex-col items-center justify-center gap-1 hover:shadow-lg
                                ${formData.tripType === type ? 'border-purple-600 bg-purple-50 ring-2 ring-purple-500' : 'border-gray-200 bg-white hover:border-purple-300'}
                            `}
                        >
                             <span className="text-2xl">
                                {type === 'Solo' ? '✈️' : type === 'Couple' ? '🥂' : type === 'Family' ? '🏡' : '⛵️'}
                            </span>
                            <span className="font-medium text-gray-700">{type}</span>
                        </div>
                    ))}
                </div>
                 {/* Number of people input if not solo */}
                 {formData.tripType !== 'Solo' && (
                     <div className="mt-4 flex items-center gap-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <span className="text-gray-600 font-medium ml-2">Number of Travelers:</span>
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={() => handleInputChange('travelers', Math.max(1, formData.travelers - 1))}
                                className="w-8 h-8 rounded-full bg-white border shadow flex items-center justify-center hover:bg-gray-100"
                            >-</button>
                            <span className="font-bold text-lg w-6 text-center">{formData.travelers}</span>
                            <button 
                                onClick={() => handleInputChange('travelers', formData.travelers + 1)}
                                className="w-8 h-8 rounded-full bg-white border shadow flex items-center justify-center hover:bg-gray-100"
                            >+</button>
                        </div>
                     </div>
                 )}
            </div>

            {/* Generate Button */}
            <div className="pt-6">
                <button 
                    onClick={handleGenerate}
                    disabled={loading || !formData.destination || !formData.days}
                    className={`w-full py-4 text-white font-bold text-lg rounded-xl shadow-xl hover:shadow-2xl transition transform hover:-translate-y-1 bg-gradient-to-r from-blue-600 to-purple-600
                        ${(loading || !formData.destination) ? 'opacity-70 cursor-not-allowed' : 'opacity-100'}
                    `}
                >
                    {loading ? (
                        <span className="flex items-center justify-center gap-2">
                             Generating your trip... 🤖
                        </span>
                    ) : 'Generate Itinerary 🚀'}
                </button>
            </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
