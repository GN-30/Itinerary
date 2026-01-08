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
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 animate-fade-in transition-colors duration-500">
      {/* Hero Section */}
      <div className="relative h-[60vh] w-full overflow-hidden animate-fade-in">
        <img 
          src={itinerary.coverImage} 
          alt={itinerary.destination} 
          className="w-full h-full object-cover"
          onError={(e) => {
             e.target.onerror = null;
             e.target.src = `https://source.unsplash.com/1600x900/?${encodeURIComponent(itinerary.destination)},travel`;
          }}
        />
        {/* Modern Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent flex flex-col justify-end p-6 md:p-16">
          <div className="max-w-4xl mx-auto w-full">
             <span className="inline-block px-3 py-1 bg-blue-600/90 text-white text-xs font-bold rounded-full mb-4 uppercase tracking-wider backdrop-blur-sm shadow-lg">
              Your Trip Plan
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight drop-shadow-md">
              {itinerary.destination}
            </h1>
            
            <div className="flex flex-wrap gap-4 text-white/90">
               <span className="glass-card px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium text-slate-900 bg-white/60 backdrop-blur-md border border-white/20">
                  <Calendar className="w-4 h-4 text-blue-600" /> {itinerary.duration}
               </span>
               <span className="glass-card px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium text-slate-900 bg-white/60 backdrop-blur-md border border-white/20">
                  <MapPin className="w-4 h-4 text-blue-600" /> {tripData.tripType}
               </span>
               <span className="glass-card px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium text-slate-900 bg-white/60 backdrop-blur-md border border-white/20">
                  💰 {tripData.budget}
               </span>
            </div>
          </div>
        </div>
      </div>

      {/* Itinerary Timeline */}
      <div className="max-w-4xl mx-auto px-4 mt-8">
        <h2 className="text-2xl font-bold mb-6 text-slate-800">Your Itinerary Recommendation</h2>
        
        <div className="space-y-4">
                  {itinerary.days.map((day, dayIdx) => (
                   <div 
                      key={day.day} 
                      className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mb-8 transition-all duration-300 hover:shadow-lg animate-fade-in"
                      style={{ animationDelay: `${dayIdx * 100}ms` }}
                   >
                    <button 
                        onClick={() => toggleDay(day.day)}
                        className="w-full flex items-center justify-between p-8 bg-white hover:bg-slate-50/50 transition"
                    >
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-2xl shadow-inner border border-transparent">
                                {day.day}
                            </div>
                            <div className="text-left">
                                <h3 className="text-2xl font-bold text-slate-800">Day {day.day}</h3>
                                <p className="text-base text-slate-500 font-medium mt-1 flex items-center gap-2">
                                  <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                                  {day.theme}
                                </p>
                            </div>
                        </div>
                        <div className={`p-3 rounded-full bg-slate-100 transition-transform duration-300 ${expandedDay === day.day ? 'rotate-180 bg-blue-100 text-blue-600' : 'text-slate-400'}`}>
                            <ChevronDown className="w-6 h-6" />
                        </div>
                    </button>

                    {expandedDay === day.day && (
                        <div className="p-8 pt-0 bg-slate-50/30">
                            <div className="space-y-6 mt-4 relative pl-8 border-l-2 border-dashed border-slate-200 ml-8">
                                {day.plan.map((activity, index) => (
                                    <div key={index} className="relative group">
                                        
                                        {/* Connector Dot */}
                                        <div className="absolute -left-[41px] top-6 w-5 h-5 rounded-full border-4 border-white bg-blue-500 shadow-md z-10"></div>
                                        
                                        {/* Activity Card */}
                                        <div className="glass-card glass-card-hover rounded-2xl p-5 md:p-6 transition-all duration-300">
                                            <div className="flex flex-col md:flex-row gap-6">
                                                
                                                {/* Text Content */}
                                                <div className="flex-1 order-2 md:order-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <span className="px-3 py-1 text-xs font-bold text-blue-700 bg-blue-100/50 rounded-full uppercase tracking-wide">
                                                            {activity.time}
                                                        </span>
                                                    </div>

                                                    <h4 className="text-xl font-bold text-slate-800 mb-2 leading-tight">
                                                        {activity.title}
                                                    </h4>
                                                    
                                                    <p className="text-slate-600 leading-relaxed mb-4">
                                                        {activity.desc}
                                                    </p>

                                                    <a 
                                                        href={`https://www.google.com/search?q=${activity.title} ${itinerary.destination}`} 
                                                        target="_blank" 
                                                        rel="noreferrer"
                                                        className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition"
                                                    >
                                                        View on Map ↗
                                                    </a>
                                                </div>

                                                {/* Image */}
                                                <div className="w-full md:w-48 h-48 md:h-32 rounded-xl overflow-hidden shadow-sm shrink-0 order-1 md:order-2 bg-slate-100 relative group-hover:scale-[1.02] transition-transform duration-500">
                                                     {activity.image ? (
                                                       <img 
                                                          src={activity.image} 
                                                          alt={activity.title}
                                                          className="w-full h-full object-cover transform scale-100 group-hover:scale-110 transition duration-700"
                                                          onError={(e) => {
                                                            e.target.onerror = null; 
                                                            e.target.src = `https://source.unsplash.com/400x300/?${encodeURIComponent(activity.title)},travel`;
                                                            // If that fails too, hide it
                                                            e.target.style.display = 'block'; 
                                                          }} 
                                                       />
                                                     ) : (
                                                       // Fallback Pattern
                                                       <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-300">
                                                          <MapPin className="w-10 h-10 opacity-50" />
                                                       </div>
                                                     )}
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
