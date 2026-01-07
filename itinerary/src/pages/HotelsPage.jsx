import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrip } from '../context/TripContext';
import { generateHotels } from '../lib/itineraryService';
import { downloadItineraryPDF } from '../lib/pdfGenerator';
import { Star, Download, Home, ArrowRight } from 'lucide-react';

const HotelsPage = () => {
    const navigate = useNavigate();
    const { tripData, itinerary, hotels, setHotels, apiKey } = useTrip();
    const [loading, setLoading] = useState(!hotels);
    const [error, setError] = useState(null);
  
    useEffect(() => {
      // Redirect if no context
      if (!tripData?.destination || !itinerary) {
        navigate('/home');
        return;
      }
      
      if (!hotels) {
        generateHotels(tripData.destination, tripData.budget, apiKey)
            .then(data => {
                setHotels(data);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
      }
    }, [tripData, itinerary, hotels, navigate, setHotels, apiKey]);

    if(loading) {
        return (
            <div className="min-h-screen flex items-center justify-center flex-col gap-4 bg-slate-50">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-500 font-medium">Finding best places to stay...</p>
            </div>
          );
    }

    if (error) {
        return (
          <div className="min-h-screen flex items-center justify-center flex-col gap-4 bg-slate-50 p-10 text-center">
            <div className="text-red-500 text-6xl">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800">Failed to Find Hotels</h2>
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl max-w-2xl overflow-auto text-left">
                <pre className="text-sm whitespace-pre-wrap">{error}</pre>
            </div>
            <button 
                onClick={() => navigate('/itinerary')}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
                Back to Itinerary
            </button>
          </div>
        );
      }

    return (
        <div className="min-h-screen bg-slate-50 text-gray-900 pb-20 p-4 md:p-10">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Where to Stay</h2>
                    <p className="text-gray-500 text-lg">Curated hotel recommendations for every budget.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                     {['Normal', 'Good', 'Premium'].map((category) => {
                         const hotel = hotels[category];
                         if(!hotel) return null;

                         return (
                            <div key={category} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition hover:-translate-y-2 border border-gray-100 flex flex-col">
                                <div className="h-48 overflow-hidden relative">
                                    <img src={hotel.image} alt={hotel.name} className="w-full h-full object-cover transform hover:scale-110 transition duration-500" />
                                    <div className="absolute top-4 right-4 bg-white/90 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                                        {category}
                                    </div>
                                </div>
                                <div className="p-6 flex-1 flex flex-col">
                                    <h3 className="text-xl font-bold mb-2">{hotel.name}</h3>
                                    <div className="flex items-center gap-1 mb-2 text-yellow-500">
                                        <Star className="w-4 h-4 fill-current"/>
                                        <span className="font-medium text-gray-700">{hotel.rating}</span>
                                    </div>
                                    <p className="text-gray-500 text-sm mb-4 flex-1">{hotel.desc}</p>
                                    <div className="flex justify-between items-center pt-4 border-t border-gray-100 mt-auto gap-3">
                                        <div className="flex flex-col">
                                            <span className="text-xs text-gray-400">Approx.</span>
                                            <span className="text-lg font-bold text-blue-600">{hotel.price}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => window.open(`https://www.booking.com/searchresults.html?ss=${hotel.name} ${tripData.destination}`, '_blank')}
                                                className="px-3 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition"
                                            >
                                                Book Now
                                            </button>
                                            <button 
                                                onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${hotel.name} ${tripData.destination}`, '_blank')}
                                                className="px-3 py-2 bg-gray-100 text-gray-600 text-xs font-bold rounded-lg hover:bg-gray-200 transition"
                                            >
                                                Map
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                         );
                     })}
                </div>

                {/* Final Actions */}
                <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
                    <button 
                        onClick={() => downloadItineraryPDF(tripData, itinerary, hotels)}
                        className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2 transition transform hover:scale-105"
                    >
                        <Download className="w-5 h-5"/> Download Itinerary
                    </button>
                    
                    <button 
                        onClick={() => navigate('/home')}
                        className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-8 py-3 rounded-xl font-semibold shadow flex items-center gap-2 transition"
                    >
                        Plan New Trip <ArrowRight className="w-4 h-4"/>
                    </button>
                </div>

            </div>
        </div>
    );
};

export default HotelsPage;
