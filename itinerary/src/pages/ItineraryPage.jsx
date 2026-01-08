import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrip } from '../context/TripContext';
import { generateItinerary } from '../lib/itineraryService';
import { MapPin, Calendar, Clock, ChevronDown, ChevronUp, Plane, Train } from 'lucide-react';
import confetti from 'canvas-confetti';

const ItineraryPage = () => {
  const navigate = useNavigate();
  const { tripData, itinerary, setItinerary, apiKey } = useTrip();
  const [loading, setLoading] = useState(!itinerary);
  const [error, setError] = useState(null);
  const [expandedDay, setExpandedDay] = useState(1);

  const fireSuccessConfetti = () => {
    const duration = 2 * 1000;
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

  useEffect(() => {
    if (!tripData?.destination) {
      navigate('/home');
      return;
    }
    
    // If itinerary is already present (e.g. from context), fire confetti immediately
    if (itinerary && !loading) {
        fireSuccessConfetti();
        return;
    }
    
    if (!itinerary) {
      generateItinerary(tripData, apiKey)
        .then(data => {
            setItinerary(data);
            setLoading(false);
            fireSuccessConfetti(); // Fire when fresh data loads
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
      <div className="min-h-screen flex items-center justify-center flex-col gap-8 bg-slate-50">
        <div className="relative w-48 h-48 flex items-center justify-center">
            {/* Cloud Background (Abstract) */}
            <div className="absolute top-1/4 left-1/4 w-16 h-8 bg-blue-100 rounded-full blur-md opacity-60 animate-pulse delay-75"></div>
            <div className="absolute bottom-1/3 right-1/4 w-20 h-10 bg-blue-50 rounded-full blur-md opacity-80 animate-pulse"></div>

            {/* Flying Plane */}
            <div className="z-10 animate-fly p-4 bg-white/80 backdrop-blur-sm rounded-full shadow-2xl border border-white/50 ring-1 ring-blue-100">
                <Plane className="w-16 h-16 text-blue-600 fill-blue-50" />
            </div>
            
            {/* Tracking Shadow */}
            <div className="absolute -bottom-8 w-20 h-4 bg-slate-200/50 rounded-full blur-sm animate-[pulse_2s_infinite]"></div>
        </div>
        
        {/* Running Train */}
        <div className="w-64 h-16 relative overflow-hidden flex items-end mb-[-6px] mask-linear-fade">
            <div className="absolute left-0 animate-train-run flex items-end gap-0.5">
                {/* Carriage 3 */}
                <div className="w-12 h-8 bg-indigo-50 border-2 border-indigo-600 rounded-lg flex items-center justify-around px-1 shadow-sm relative">
                    <div className="w-3 h-4 bg-indigo-200/50 border border-indigo-300 rounded-[2px]"></div>
                    <div className="w-3 h-4 bg-indigo-200/50 border border-indigo-300 rounded-[2px]"></div>
                    {/* Wheel */}
                    <div className="absolute -bottom-1.5 left-2 w-2.5 h-2.5 bg-slate-700 rounded-full"></div>
                    <div className="absolute -bottom-1.5 right-2 w-2.5 h-2.5 bg-slate-700 rounded-full"></div>
                </div>

                {/* Coupler */}
                <div className="w-2 h-1 bg-slate-400 self-end mb-3"></div>

                {/* Carriage 2 */}
                <div className="w-12 h-8 bg-indigo-50 border-2 border-indigo-600 rounded-lg flex items-center justify-around px-1 shadow-sm relative">
                    <div className="w-3 h-4 bg-indigo-200/50 border border-indigo-300 rounded-[2px]"></div>
                    <div className="w-3 h-4 bg-indigo-200/50 border border-indigo-300 rounded-[2px]"></div>
                    {/* Wheel */}
                    <div className="absolute -bottom-1.5 left-2 w-2.5 h-2.5 bg-slate-700 rounded-full"></div>
                    <div className="absolute -bottom-1.5 right-2 w-2.5 h-2.5 bg-slate-700 rounded-full"></div>
                </div>
                
                {/* Coupler */}
                 <div className="w-2 h-1 bg-slate-400 self-end mb-3"></div>

                {/* Carriage 1 */}
                <div className="w-12 h-8 bg-indigo-50 border-2 border-indigo-600 rounded-lg flex items-center justify-around px-1 shadow-sm relative">
                    <div className="w-3 h-4 bg-indigo-200/50 border border-indigo-300 rounded-[2px]"></div>
                    <div className="w-3 h-4 bg-indigo-200/50 border border-indigo-300 rounded-[2px]"></div>
                    {/* Wheel */}
                    <div className="absolute -bottom-1.5 left-2 w-2.5 h-2.5 bg-slate-700 rounded-full"></div>
                    <div className="absolute -bottom-1.5 right-2 w-2.5 h-2.5 bg-slate-700 rounded-full"></div>
                </div>

                {/* Coupler */}
                <div className="w-2 h-1 bg-slate-400 self-end mb-3"></div>

                {/* Engine */}
                <div className="flex flex-col items-center">
                     <div className="w-2 h-2 bg-slate-200 rounded-full animate-ping mb-1 ml-4"></div>
                     <Train className="w-10 h-10 text-indigo-700 drop-shadow-sm" />
                </div>

            </div>
        </div>

        <div className="flex flex-col items-center gap-2 animate-fade-in">
            <h3 className="text-xl font-bold text-slate-700">Planning your Journey...</h3>
            <p className="text-gray-500 font-medium">Flying to {tripData?.destination} ✈️</p>
        </div>
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
             e.target.src = 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200';
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
                                        <div className="glass-card glass-card-hover rounded-3xl p-5 md:p-8 transition-all duration-500 hover:border-blue-200/50 group-hover:shadow-2xl">
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
                                                            e.target.src = 'https://images.unsplash.com/photo-1528543606781-2f6e6857f318?w=800';
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
