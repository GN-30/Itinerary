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
    <div className="min-h-screen premium-bg text-slate-900 pb-20 animate-fade-in transition-colors duration-500 font-sans">
      {/* Hero Section */}
      <div className="relative h-[60vh] mx-4 mt-4 md:mx-6 md:mt-6 overflow-hidden animate-fade-in shadow-2xl rounded-[2.5rem] ring-1 ring-black/5">
        <img 
          src={itinerary.coverImage} 
          alt={itinerary.destination} 
          className="w-full h-full object-cover"
          onError={(e) => {
             e.target.onerror = null;
             e.target.src = `https://source.unsplash.com/1600x900/?${encodeURIComponent(itinerary.destination)},travel`;
          }}
        />
        {/* Superior Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent flex flex-col justify-end p-6 md:p-16">
          <div className="max-w-5xl mx-auto w-full">
             
            <h1 className="text-6xl md:text-8xl font-black text-white mb-8 tracking-tighter drop-shadow-2xl">
              {itinerary.destination}
            </h1>
            
            <div className="flex flex-wrap gap-4 text-white/95">
               <span className="glass-card px-5 py-2.5 rounded-full flex items-center gap-2.5 text-sm font-bold text-slate-800 bg-white/80 backdrop-blur-xl border border-white/40 shadow-lg">
                  <Calendar className="w-4 h-4 text-blue-600" /> {itinerary.duration}
               </span>
               <span className="glass-card px-5 py-2.5 rounded-full flex items-center gap-2.5 text-sm font-bold text-slate-800 bg-white/80 backdrop-blur-xl border border-white/40 shadow-lg">
                  <MapPin className="w-4 h-4 text-blue-600" /> {tripData.tripType}
               </span>
               <span className="glass-card px-5 py-2.5 rounded-full flex items-center gap-2.5 text-sm font-bold text-slate-800 bg-white/80 backdrop-blur-xl border border-white/40 shadow-lg">
                  💰 {tripData.budget}
               </span>
            </div>
          </div>
        </div>
      </div>

      {/* Itinerary Timeline */}
      <div className="max-w-4xl mx-auto px-6 mt-16 relative">
        <h2 className="text-3xl font-extrabold mb-10 text-slate-800 tracking-tight flex items-center gap-3">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600">Your Journey</span>
        </h2>
        
        <div className="space-y-8">
                  {itinerary.days.map((day, dayIdx) => (
                   <div 
                      key={day.day} 
                      className="bg-white/80 backdrop-blur-sm rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden transition-all duration-300 hover:shadow-2xl animate-fade-in group/day"
                      style={{ animationDelay: `${dayIdx * 100}ms` }}
                   >
                    <button 
                        onClick={() => toggleDay(day.day)}
                        className="w-full flex items-center justify-between p-8 hover:bg-white/50 transition duration-300"
                    >
                        <div className="flex items-center gap-8">
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center text-blue-600 font-black text-3xl shadow-inner border border-white/50 group-hover/day:scale-110 transition-transform duration-500">
                                {day.day}
                            </div>
                            <div className="text-left">
                                <h3 className="text-2xl font-bold text-slate-800 group-hover/day:text-blue-600 transition-colors">Day {day.day}</h3>
                                <p className="text-slate-500 font-medium mt-1 flex items-center gap-2">
                                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                                  {day.theme}
                                </p>
                            </div>
                        </div>
                        <div className={`p-4 rounded-full bg-slate-50 border border-slate-100 transition-all duration-300 ${expandedDay === day.day ? 'rotate-180 bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-blue-600'}`}>
                            <ChevronDown className="w-6 h-6" />
                        </div>
                    </button>

                    {expandedDay === day.day && (
                        <div className="p-8 pt-2 pb-10 bg-slate-50/10">
                            {/* Premium Gradient Timeline Line */}
                            <div className="space-y-10 mt-2 relative pl-10 border-l-[3px] border-gradient-to-b from-blue-500/30 to-purple-500/30 ml-9 border-transparent"
                                 style={{ borderImage: 'linear-gradient(to bottom, #3b82f640, #8b5cf640) 1' }}
                            >
                                {day.plan.map((activity, index) => (
                                    <div key={index} className="relative group">
                                        
                                        {/* Stylish Connector Node */}
                                        <div className="absolute -left-[50px] top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white border-4 border-blue-500 shadow-lg z-10 group-hover:scale-125 group-hover:border-purple-500 transition-all duration-300"></div>
                                        
                                        {/* Enhanced Glass Activity Card */}
                                        <div className="glass-card glass-card-hover rounded-3xl p-6 md:p-8 transition-all duration-500 hover:border-blue-200/50 group-hover:shadow-2xl">
                                            <div className="flex flex-col md:flex-row gap-8 items-center">
                                                
                                                {/* Text Content */}
                                                <div className="flex-1 order-2 md:order-1 w-full text-center md:text-left">
                                                    <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-widest border border-blue-100">
                                                        <Clock className="w-3 h-3" />
                                                        {activity.time}
                                                    </div>

                                                    <h4 className="text-2xl font-bold text-slate-800 mb-3 leading-snug group-hover:text-blue-700 transition-colors">
                                                        {activity.title}
                                                    </h4>
                                                    
                                                    <p className="text-slate-600 leading-relaxed mb-6 font-medium">
                                                        {activity.desc}
                                                    </p>

                                                    <a 
                                                        href={`https://www.google.com/search?q=${activity.title} ${itinerary.destination}`} 
                                                        target="_blank" 
                                                        rel="noreferrer"
                                                        className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-purple-600 transition-colors group/link"
                                                    >
                                                        Find on Map <span className="group-hover/link:translate-x-1 transition-transform">→</span>
                                                    </a>
                                                </div>

                                                {/* Cinematic Image */}
                                                <div className="w-full md:w-64 aspect-video rounded-2xl overflow-hidden shadow-lg shrink-0 order-1 md:order-2 bg-slate-200 relative group-hover:scale-105 transition-transform duration-700 ring-1 ring-black/5">
                                                     {activity.image ? (
                                                       <img 
                                                          src={activity.image} 
                                                          alt={activity.title}
                                                          className="w-full h-full object-cover transform scale-100 group-hover:scale-110 transition duration-1000"
                                                          onError={(e) => {
                                                            e.target.onerror = null; 
                                                            e.target.src = `https://source.unsplash.com/400x300/?${encodeURIComponent(activity.title)},travel`;
                                                            e.target.style.display = 'block'; 
                                                          }} 
                                                       />
                                                     ) : (
                                                       <div className="w-full h-full bg-gradient-to-br from-blue-50 to-violet-50 flex items-center justify-center text-blue-300">
                                                          <MapPin className="w-12 h-12 opacity-40 mix-blend-multiply" />
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

        {/* Floating Action Button */}
        <div className="mt-16 mb-20 flex justify-center">
             <button 
                onClick={() => navigate('/hotels')}
                className="bg-slate-900 text-white px-10 py-5 rounded-full font-bold text-lg shadow-2xl hover:shadow-blue-500/30 hover:bg-blue-600 hover:-translate-y-1 transition-all duration-300 flex items-center gap-3 active:scale-95"
             >
                Find Best Hotels <span className="bg-white/20 p-1 rounded-full"><ChevronDown className="w-5 h-5 -rotate-90"/></span>
             </button>
        </div>
      </div>
    </div>
  );
};

export default ItineraryPage;
