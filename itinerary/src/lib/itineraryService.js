import { GoogleGenerativeAI } from "@google/generative-ai";

const MODELS_TO_TRY = [
  "gemini-1.5-flash",
  "gemini-1.5-flash-001",
  "gemini-1.5-pro",
  "gemini-1.5-pro-001",
  "gemini-pro"
];

// --- OPEN DATA SERVICE (Wikipedia + VIP List) ---
const KNOWN_CITIES = {
  "madurai": ["Meenakshi Amman Temple", "Thirumalai Nayakkar Mahal", "Gandhi Memorial Museum", "Alagar Koyil", "Vandiyur Mariamman Teppakulam", "Koodal Azhagar Temple", "Samanar Hills"],
  "chennai": ["Marina Beach", "Kapaleeshwarar Temple", "Guindy National Park", "San Thome Basilica", "Government Museum"],
  "london": ["British Museum", "Tower of London", "London Eye", "Buckingham Palace", "Hyde Park"],
  "paris": ["Eiffel Tower", "Louvre Museum", "Notre-Dame Cathedral", "Arc de Triomphe", "Sacre-Coeur"],
  "new york": ["Statue of Liberty", "Central Park", "Times Square", "Empire State Building", "Brooklyn Bridge"]
};

const fetchRealAttractions = async (destination) => {
  try {
    // 1. Check VIP List first (Instant & Perfect data)
    // 1. Check VIP List first
    const lowerDest = destination.toLowerCase().trim();
    if (KNOWN_CITIES[lowerDest]) {
      console.log("Using VIP Data for:", destination);
      return KNOWN_CITIES[lowerDest].map(name => ({ name, type: 'attraction' }));
    }

    // 2. Try GEO-SEARCH (Strict Locality)
    const coords = await getCoordinates(destination);

    if (coords) {
      // Fetch Wiki pages within 10km radius
      const geoUrl = `https://en.wikipedia.org/w/api.php?action=query&list=geosearch&gscoord=${coords.lat}|${coords.lon}&gsradius=10000&gslimit=50&format=json&origin=*`;
      const geoRes = await fetch(geoUrl);
      const geoData = await geoRes.json();

      if (geoData.query && geoData.query.geosearch) {
        return geoData.query.geosearch.map(item => ({
          name: item.title,
          type: 'attraction'
        }));
      }
    }

    // 3. Fallback to Keyword Search (if Geo fails)
    const queries = [
      destination,
      `${destination} temple`,
      `${destination} tourist attractions`,
      `places to visit in ${destination}`
    ];

    // ... (rest of fallback logic if needed, or just return empty to strictly avoid bad data)
    // For now, let's keep the fallback but make it strict
    const promises = queries.map(q =>
      fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(q)}&format=json&origin=*&srlimit=20`)
        .then(res => res.json())
        .catch(() => ({}))
    );

    const results = await Promise.all(promises);
    let allItems = [];
    results.forEach(data => {
      if (data.query && data.query.search) {
        allItems = [...allItems, ...data.query.search];
      }
    });

    const seen = new Set();
    return allItems.map(item => ({ name: item.title })).filter(place => {
      const name = place.name;
      if (seen.has(name)) return false;
      // Strict filters
      if (name.includes("Tourism in") || name.includes("List of")) return false;
      seen.add(name);
      return true;
    });

  } catch (err) {
    console.warn("Fetch Failed:", err);
    return [];
  }
};

// --- MOCK DATA GENERATORS (Fallback) ---
const generateMockItinerary = async (tripData) => {
  const { destination, days, tripType, budget } = tripData;
  const safeDays = parseInt(days) || 3;

  // FETCH REAL DATA
  const realPlaces = await fetchRealAttractions(destination);

  // Dynamic Activity Templates (Mixture of Real & Generic)
  let activityPool = [];

  // 1. Add Real Places
  realPlaces.forEach(place => {
    // Determine description based on name keywords
    let desc = `Explore this famous local landmark in ${destination}.`;
    const n = place.name.toLowerCase();

    if (n.includes('temple') || n.includes('church') || n.includes('mosque') || n.includes('cathedral') || n.includes('kovil')) {
      desc = `Experience the spiritual heritage at this famous site.`;
    } else if (n.includes('museum')) {
      desc = `Discover the rich history and collections here.`;
    } else if (n.includes('park') || n.includes('garden')) {
      desc = `Enjoy a relaxing time in nature.`;
    } else if (n.includes('market') || n.includes('bazaar')) {
      desc = `Shop for local goods and taste street food.`;
    } else if (n.includes('mahal') || n.includes('palace') || n.includes('fort')) {
      desc = `Admire the stunning architecture and royal history.`;
    }

    activityPool.push({ title: `Visit ${place.name}`, desc: desc });
  });

  // 3. Last Resort Fillers (Time-Specific Actions)
  const fillers = [
    { title: 'Morning Coffee & Breakfast', desc: 'Start the day with a fresh brew and local pastries.', category: 'morning' },
    { title: 'Sunrise Viewpoint', desc: 'Catch the early morning sun for the best vibes.', category: 'morning' },
    { title: 'Morning Yoga/Meditation', desc: 'Peaceful start to the day.', category: 'morning' },

    { title: 'Local Market Visit', desc: 'Explore the local shops and culture.', category: 'any' },
    { title: 'Souvenir Shopping', desc: 'Buy gifts and mementos.', category: 'any' },
    { title: 'Street Photography', desc: 'Capture the unique vibe of the city streets.', category: 'any' },
    { title: 'Relax at Hotel', desc: 'Take a short break to recharge.', category: 'afternoon' },

    { title: 'Sunset Views', desc: 'Find a nice spot to watch the sun go down.', category: 'evening' },
    { title: 'Evening Leisure Walk', desc: 'A pleasant walk through the lively streets.', category: 'evening' },
    { title: 'Street Food Walk', desc: 'Try the best local evening snacks.', category: 'evening' },

    { title: 'Night Market Visit', desc: 'Experience the buzzing night life and shopping.', category: 'night' },
    { title: 'Live Music Venue', desc: 'Enjoy some local live performances.', category: 'night' },
    { title: 'Dinner at Local Gem', desc: 'Enjoy a hearty meal at a rated restaurant.', category: 'night' }
  ];

  // 4. Combine & Shuffle
  // Mark real places as 'any' time so they can fit anywhere, but we can try to smart slot them.
  let fullPool = activityPool.map(a => ({ ...a, category: 'any' }));
  fullPool = [...fullPool, ...fillers]; // Add fillers to the pool

  // Shuffle logic
  fullPool = fullPool.sort(() => 0.5 - Math.random());

  const generatedDays = [];
  const timeSlots = ['09:00 AM', '11:00 AM', '02:00 PM', '05:00 PM', '08:00 PM'];
  const slotCategories = ['morning', 'morning', 'afternoon', 'evening', 'night'];

  const usedTitles = new Set(); // TRACK USED PLACES

  for (let i = 1; i <= safeDays; i++) {
    const dailyPlan = [];

    // LOGIC: Long Trip Pacing
    const isRelaxDay = safeDays >= 10 && i > 1 && i % 5 === 0;
    const isArrivalDay = i === 1;

    let slotsIndexes = [0, 1, 2, 3, 4]; // Default 5 slots
    if (isRelaxDay) slotsIndexes = [1, 3]; // Late start, relaxed evening
    if (isArrivalDay) slotsIndexes = [2, 3, 4]; // Start from afternoon

    let dayTheme = 'Exploration & Culture';
    if (isRelaxDay) dayTheme = 'Relaxation & Recharge';
    if (isArrivalDay) dayTheme = 'Arrival & Discovery';
    if (i === safeDays) dayTheme = 'Farewell & Souvenirs';

    // Attempt to fill slots
    for (const slotIdx of slotsIndexes) {
      const currentTime = timeSlots[slotIdx];
      const currentCategory = slotCategories[slotIdx];

      // 1. Filter: Find a unique activity that matches the TIME category
      let nextActivity = fullPool.find(a =>
        !usedTitles.has(a.title) &&
        (a.category === 'any' || a.category === currentCategory)
      );

      // 2. Fallback: If no strict match, find ANY unique 'any' or 'filler' activity
      if (!nextActivity) {
        nextActivity = fullPool.find(a => !usedTitles.has(a.title) && a.category === 'any');
      }

      if (nextActivity) {
        dailyPlan.push({ ...nextActivity, time: currentTime });
        usedTitles.add(nextActivity.title);
      } else {
        // 3. Absolute fallback (Rare) - Pick a filler that matches the time (even if used)
        const filler = fillers.find(f => f.category === currentCategory) || fillers[0];
        dailyPlan.push({ ...filler, time: currentTime, title: `${filler.title} (Revisited)` });
      }
    }

    generatedDays.push({
      day: i,
      theme: dayTheme,
      plan: dailyPlan
    });
  }

  return {
    destination,
    duration: `${safeDays} Days`,
    coverImage: `https://source.unsplash.com/800x600/?${destination},travel`,
    days: generatedDays
  };
};

const generateMockHotels = (destination, budget) => {
  // Dynamic Hotel Names based on Destination
  return {
    "Normal": {
      name: `${destination} Backpackers`,
      rating: 4.2,
      price: '$35/night',
      desc: `A social and budget-friendly stay in the heart of ${destination}.`,
      image: 'https://images.unsplash.com/photo-1555854743-e3c2f6a5fc6c?w=500'
    },
    "Good": {
      name: `Hotel ${destination} City`,
      rating: 4.6,
      price: '$120/night',
      desc: `Modern comfort with great views of ${destination}.`,
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500'
    },
    "Premium": {
      name: `The Grand ${destination} Resort`,
      rating: 4.9,
      price: '$450/night',
      desc: `Experience world-class luxury in ${destination}.`,
      image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=500'
    }
  };
};
// ----------------------------------------

async function generateWithFallback(apiKey, prompt) {
  const genAI = new GoogleGenerativeAI(apiKey);

  let errors = [];

  for (const modelName of MODELS_TO_TRY) {
    try {
      console.log(`Attempting generation with model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      console.log(`Success with ${modelName}`);
      return text;
    } catch (error) {
      console.warn(`Failed with ${modelName}:`, error.message);
      errors.push(`${modelName}: ${error.message}`);
      continue;
    }
  }

  throw new Error(`All models failed. Details:\n${errors.join('\n')}`);
}

export const generateItinerary = async (tripData, apiKey) => {
  const { destination, days, tripType, budget } = tripData;
  if (!apiKey) {
    console.log("No API Key. Using async Mock Data.");
    return await generateMockItinerary(tripData);
  }

  const prompt = `
    Generate a detailed travel itinerary for a ${days}-day trip to ${destination} for a ${tripType} trip with a ${budget} budget.
    
    Return the response in this strictly valid JSON format:
    {
      "destination": "${destination}",
      "duration": "${days} Days",
      "coverImage": "https://source.unsplash.com/800x600/?${destination},travel",
      "days": [
        {
          "day": 1,
          "theme": "Theme of the day",
          "plan": [
            {
              "time": "Time (e.g., 09:00 AM)",
              "title": "Activity Title",
              "desc": "Short description"
            }
          ]
        }
      ]
    }
    Ensure the itinerary is practical, covers famous and hidden gems, and fits the budget.
    Do NOT include any markdown code blocks (like \`\`\`json). Just return the raw JSON object.
  `;

  try {
    const text = await generateWithFallback(apiKey, prompt);
    console.log("Gemini Raw Response:", text); // Debug log

    // Clean up potential markdown formatting
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();

    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Gemini API Failed. Switching to Mock Data.", error);
    // FALLBACK
    return await generateMockItinerary(tripData);
  }
};

export const generateHotels = async (destination, budget, apiKey) => {
  if (!apiKey) {
    return generateMockHotels(destination, budget);
  }

  const prompt = ` 
    Suggest 3 hotels in or near ${destination} which is a remote or popular location.
    Provide 1 'Normal' (Budget-friendly), 1 'Good' (Mid-range), and 1 'Premium' (Luxury) option.
    Even if the place is remote, find the best available homestays or lodges.
    
    Return the response in this strictly valid JSON format:
    {
      "Normal": {
        "name": "Hotel Name",
        "rating": 4.0,
        "price": "$Price/night",
        "desc": "Short description",
        "image": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500" 
      },
      "Good": {
        "name": "Hotel Name",
        "rating": 4.5,
        "price": "$Price/night",
        "desc": "Short description",
        "image": "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=500"
      },
      "Premium": {
         "name": "Hotel Name",
         "rating": 4.9,
         "price": "$Price/night",
         "desc": "Short description",
         "image": "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=500"
      }
    }
    Do NOT include any markdown code blocks. Just valid JSON.
  `;

  try {
    const text = await generateWithFallback(apiKey, prompt);
    console.log("Hotel Raw Response:", text); // Debug log
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Gemini API Failed. Switching to Mock Data.", error);
    // FALLBACK
    return generateMockHotels(destination, budget);
  }
};
