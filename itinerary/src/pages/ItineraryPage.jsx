import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrip } from '../context/TripContext';
import { generateItinerary } from '../lib/itineraryService';
import { MapPin, Calendar, Clock, ChevronDown, ChevronUp } from 'lucide-react';

const ItineraryPage = () => {
  const navigate = useNavigate();
  const { tripData, itinerary, setItinerary, apiKey } = useTrip();
  const [loading, setLoading] = useState(!itinerary);
  const [error, setError] = useState(null);
  const [expandedDay, setExpandedDay] = useState(1);

  useEffect(() => {
    if (!tripData?.destination) {
      navigate('/home');
      return;
    }
    
    if (!itinerary) {
      generateItinerary(tripData, apiKey)
        .then(data => {
            setItinerary(data);
            setLoading(false);
        })
        .catch(err => {
            console.log(err);
            setError(err.message);
            setLoading(false);
        });
    }
  }, [tripData, itinerary, navigate, setItinerary, apiKey]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4 bg-slate-50">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium">Crafting your perfect trip to {tripData?.destination}...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4 bg-slate-50 p-10 text-center">
        <div className="text-red-500 text-6xl">⚠️</div>
        <h2 className="text-2xl font-bold text-gray-800">Generation Failed</h2>
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl max-w-2xl overflow-auto text-left">
            <pre className="text-sm whitespace-pre-wrap">{error}</pre>
        </div>
        <button 
            onClick={() => navigate('/home')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
            Go Back & Check Settings
        </button>
      </div>
    );
  }

  const toggleDay = (day) => {
    setExpandedDay(expandedDay === day ? null : day);
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 pb-20">
      {/* Hero Section */}
      <div className="relative h-64 md:h-80 w-full overflow-hidden">
        <img 
          src={itinerary.coverImage} 
          alt={itinerary.destination} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-6 md:p-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{itinerary.destination}</h1>
          <div className="flex flex-wrap gap-4 text-white/90">
             <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1 text-sm">
                <Calendar className="w-4 h-4" /> {itinerary.duration}
             </span>
             <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1 text-sm">
                <MapPin className="w-4 h-4" /> {tripData.tripType} Trip
             </span>
             <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1 text-sm">
                💰 {tripData.budget} Budget
             </span>
          </div>
        </div>
      </div>

      {/* Itinerary Timeline */}
      <div className="max-w-4xl mx-auto px-4 mt-8">
        <h2 className="text-2xl font-bold mb-6">Your Itinerary Recommendation</h2>
        
        <div className="space-y-4">
          {itinerary.days.map((day) => (
                   <div key={day.day} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                    <button 
                        onClick={() => toggleDay(day.day)}
                        className="w-full flex items-center justify-between p-6 bg-white hover:bg-gray-50 transition"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">
                                {day.day}
                            </div>
                            <div className="text-left">
                                <h3 className="text-xl font-bold text-gray-800">Day {day.day}</h3>
                                <p className="text-sm text-gray-500 font-medium">{day.theme}</p>
                            </div>
                        </div>
                        <div className={`p-2 rounded-full transition-transform duration-300 ${expandedDay === day.day ? 'rotate-180 bg-blue-50' : ''}`}>
                            <ChevronDown className={`w-6 h-6 ${expandedDay === day.day ? 'text-blue-600' : 'text-gray-400'}`} />
                        </div>
                    </button>

                    {expandedDay === day.day && (
                        <div className="p-6 pt-0 border-t border-gray-100 bg-slate-50/50">
                            <div className="space-y-8 mt-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                                {day.plan.map((activity, index) => (
                                    <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                        
                                        {/* Icon Dot */}
                                        <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-blue-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                                            <Calendar className="w-4 h-4 text-white" />
                                        </div>
                                        
                                        {/* Content Card */}
                                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex justify-between items-start">
                                                    <span className="inline-block px-2 py-1 text-xs font-semibold text-blue-600 bg-blue-50 rounded-md">
                                                        {activity.time}
                                                    </span>
                                                    <a 
                                                        href={`https://www.google.com/search?q=${activity.title} ${itinerary.destination}`} 
                                                        target="_blank" 
                                                        rel="noreferrer"
                                                        className="text-xs text-gray-400 hover:text-blue-600 flex items-center gap-1"
                                                    >
                                                        Map ↗
                                                    </a>
                                                </div>
                                                
                                                <h4 className="font-bold text-gray-800 text-lg leading-tight">
                                                    {activity.title}
                                                </h4>
                                                
                                                <p className="text-sm text-gray-600">
                                                    {activity.desc}
                                                </p>

                                                {/* Visual Pop: Image */}
                                                <div className="mt-3 w-full h-32 rounded-lg overflow-hidden bg-gray-100">
                                                     <img 
                                                        src={`https://source.unsplash.com/400x300/?${encodeURIComponent(activity.title)},travel`} 
                                                        alt={activity.title}
                                                        className="w-full h-full object-cover hover:scale-105 transition duration-500"
                                                        onError={(e) => e.target.style.display = 'none'} 
                                                     />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
          ))}
        </div>

        {/* Action Button */}
        <div className="mt-10 mb-10 flex justify-end">
             <button 
                onClick={() => navigate('/hotels')}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-full font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition flex items-center gap-2"
             >
                Suggest Hotels <MapPin className="w-5 h-5"/>
             </button>
        </div>
      </div>
    </div>
  );
};

export default ItineraryPage;
