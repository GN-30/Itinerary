import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrip } from '../context/TripContext';
import { generateHotels } from '../lib/itineraryService'; 
import { downloadItineraryPDF } from '../lib/pdfGenerator';
import { Star, Download, ArrowRight, ExternalLink, MapPin } from 'lucide-react';

const HotelsPage = () => {
    const navigate = useNavigate();
    const { tripData, itinerary, hotels, setHotels, apiKey } = useTrip(); // Added apiKey
    const [loading, setLoading] = useState(!hotels);
    const [error, setError] = useState(null);
  
    useEffect(() => {
      // Redirect if no context
      if (!tripData?.destination) {
        navigate('/home');
        return;
      }
      
      if (!hotels) {
        // Pass apiKey to service
        generateHotels(tripData.destination, tripData.budget, apiKey)
            .then(data => {
                setHotels(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setError(err.message);
                setLoading(false);
            });
      }
    }, [tripData, hotels, navigate, setHotels, apiKey]);

    if(loading) {
        return (
            <div className="min-h-screen premium-bg flex items-center justify-center flex-col gap-6">
              <div className="relative">
                 <div className="w-20 h-20 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                 <div className="absolute inset-0 flex items-center justify-center text-2xl">🏨</div>
              </div>
              <p className="text-white font-bold text-xl tracking-wide animate-pulse">Scanning for luxury stays...</p>
            </div>
          );
    }

    if (error) {
        return (
          <div className="min-h-screen premium-bg flex items-center justify-center p-10">
            <div className="glass-card p-10 rounded-3xl text-center max-w-lg">
                <div className="text-6xl mb-4">😢</div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">We couldn't find hotels</h2>
                <p className="text-slate-500 mb-6">Something went wrong while fetching accommodation options.</p>
                <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm mb-6 font-mono text-left overflow-auto max-h-32">
                    {error}
                </div>
                <button onClick={() => navigate('/itinerary')} className="px-6 py-2 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700">Back</button>
            </div>
          </div>
        );
      }

    return (
        <div className="min-h-screen premium-bg text-gray-900 pb-20 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="relative mb-16 animate-fade-in space-y-4 text-center">
                    <button 
                        onClick={() => navigate('/itinerary')}
                        className="absolute left-0 top-1/2 -translate-y-1/2 p-3 md:p-4 bg-white/10 backdrop-blur-md rounded-2xl hover:bg-white/20 transition-all text-white border border-white/20 group flex z-10"
                        title="Back to Itinerary"
                    >
                        <ArrowRight className="w-5 h-5 md:w-6 md:h-6 rotate-180 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight">
                        Suggested <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">Stays</span>
                    </h2>
                    <p className="text-slate-600 text-xl font-medium max-w-2xl mx-auto backdrop-blur-sm py-2 rounded-xl">
                        Handpicked accommodations in {tripData.destination}.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16 px-2">
                     {hotels && Array.isArray(hotels) && hotels.map((hotel, index) => {
                         // Alternate themes for visual variety
                         const themes = [
                            'from-blue-500 to-indigo-600',
                            'from-purple-500 to-pink-600',
                            'from-emerald-500 to-teal-600', 
                            'from-orange-500 to-red-600'
                         ];
                         const theme = themes[index % themes.length];

                         return (
                            <div key={index} 
                                 className="glass-card rounded-[2rem] overflow-hidden hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-500 transform hover:-translate-y-3 group flex flex-col"
                                 style={{ animationDelay: `${index * 100}ms` }}
                            >
                                {/* Image Area */}
                                <div className="h-64 overflow-hidden relative">
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"/>
                                    <img 
                                        src={hotel.image} 
                                        alt={hotel.name} 
                                        className="w-full h-full object-cover transform group-hover:scale-110 transition duration-700"
                                        onError={(e) => {
                                            e.target.onerror = null; 
                                            e.target.src = "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500"; 
                                        }}
                                    />
                                    
                                    <div className={`absolute top-4 right-4 px-4 py-1.5 rounded-full text-xs font-bold text-white shadow-lg bg-gradient-to-r ${theme} z-20`}>
                                        Recommended
                                    </div>
                                    <div className="absolute bottom-4 left-4 z-20 text-white">
                                        <div className="flex items-center gap-1 text-yellow-400 text-sm font-bold mb-1">
                                            <Star className="w-4 h-4 fill-current"/> {hotel.rating} / 5.0
                                        </div>
                                        <h3 className="text-2xl font-bold leading-tight shadow-black drop-shadow-lg">{hotel.name}</h3>
                                    </div>
                                </div>

                                {/* Content Area */}
                                <div className="p-8 flex-1 flex flex-col bg-white/40 backdrop-blur-md">
                                    <p className="text-slate-600 leading-relaxed mb-6 flex-1 font-medium text-sm">
                                        {hotel.desc}
                                    </p>
                                    
                                    <div className="pt-6 border-t border-slate-200/60 mt-auto flex items-center justify-between gap-4">
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Est. Price</p>
                                            <p className={`text-xl font-black bg-clip-text text-transparent bg-gradient-to-r ${theme}`}>
                                                {hotel.price}
                                            </p>
                                        </div>
                                        
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${hotel.name} ${tripData.destination}`, '_blank')}
                                                className="p-3 bg-white text-slate-600 rounded-xl hover:bg-slate-50 border border-slate-200 shadow-sm transition"
                                                title="View on Map"
                                            >
                                                <MapPin className="w-5 h-5"/>
                                            </button>
                                            <button 
                                                onClick={() => window.open(`https://www.booking.com/searchresults.html?ss=${encodeURIComponent(hotel.name + ' ' + tripData.destination)}`, '_blank')}
                                                className={`px-6 py-3 rounded-xl text-white font-bold shadow-lg shadow-blue-500/30 flex items-center gap-2 hover:opacity-90 transition bg-gradient-to-r ${theme}`}
                                            >
                                                Book <ExternalLink className="w-4 h-4"/>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                         );
                     })}
                </div>

                {/* Final Actions */}
                <div className="flex flex-col md:flex-row gap-6 justify-center items-center pb-12">
                    <button 
                        onClick={() => downloadItineraryPDF(tripData, itinerary, hotels)}
                        className="group relative px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-2xl hover:bg-slate-800 transition overflow-hidden"
                    >
                        <span className="relative z-10 flex items-center gap-3">
                            <Download className="w-5 h-5 group-hover:animate-bounce"/> Download Full Plan
                        </span>
                        <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"/>
                    </button>
                    
                    <button 
                        onClick={() => navigate('/home')}
                        className="px-8 py-4 bg-white/80 backdrop-blur text-slate-700 rounded-2xl font-bold shadow-xl border border-white hover:bg-white transition flex items-center gap-3 group"
                    >
                        Plan Another Trip <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform"/>
                    </button>
                </div>

            </div>
        </div>
    );
};

export default HotelsPage;
