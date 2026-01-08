import { GoogleGenerativeAI } from "@google/generative-ai";


const MODELS_TO_TRY = [
  "gemini-1.5-flash",
  "gemini-1.5-flash-latest",
  "gemini-1.5-pro-latest",
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


const getCoordinates = async (destination) => {
  try {
    const url = `https://en.wikipedia.org/w/api.php?action=query&prop=coordinates&titles=${encodeURIComponent(destination)}&format=json&origin=*`;
    const response = await fetch(url);
    const data = await response.json();
    const pages = data.query.pages;
    const pageId = Object.keys(pages)[0];
    if (pages[pageId].coordinates) {
      return pages[pageId].coordinates[0];
    }
    return null;
  } catch (error) {
    console.warn("Failed to get coordinates:", error);
    return null;
  }
};

const fetchDestinationImage = async (destination) => {
  try {
    const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(destination)}&prop=pageimages&format=json&pithumbsize=1000&origin=*`;
    const response = await fetch(url);
    const data = await response.json();
    const pages = data.query.pages;
    const pageId = Object.keys(pages)[0];
    return pages[pageId]?.thumbnail?.source || null;
  } catch (error) {
    console.warn("Failed to get cover image:", error);
    return null;
  }
};

const fetchRealAttractions = async (destination) => {
  try {
    // 1. Check VIP List first (Instant & Perfect data)
    // 1. Check VIP List first
    // 1. Check VIP List first (Instant & Perfect data) - DISABLED to allow full search
    const lowerDest = destination.toLowerCase().trim();
    /*
    if (KNOWN_CITIES[lowerDest]) {
      console.log("Using VIP Data for:", destination);
      return KNOWN_CITIES[lowerDest].map(name => ({ name, type: 'attraction' }));
    }
    */

    // 2. Parallel Search Strategy (Hybrid: Geo + Keywords)
    // We combine both because:
    // - Geo: Finds small local spots (Strictly accurate)
    // - Keywords: Finds famous places that might be slightly outside the radius (e.g. Tirumala is 20km from Tirupati)

    const coords = await getCoordinates(destination);

    // Prepare Promises
    const apiCalls = [];

    // A. Geo Search (Radius increased to 50km)
    if (coords) {
      // 50km radius for Geosearch (approx 31 miles)
      const geoUrl = `https://en.wikipedia.org/w/api.php?action=query&list=geosearch&gscoord=${coords.lat}|${coords.lon}&gsradius=50000&gslimit=50&format=json&origin=*`;
      apiCalls.push(fetch(geoUrl).then(r => r.json()).catch(() => ({})));
    }

    // B. Keyword Searches (Aggressive Expansion)
    // We run many specific queries to "force" the API to give us Temples, Parks, etc.
    const queries = [
      destination,
      `${destination} tourist attractions`,
      `places to visit in ${destination}`,
      `${destination} temple`,
      `${destination} waterfalls`,
      `${destination} falls`,
      `${destination} dam`,
      `${destination} landmark`,
      `${destination} park`,
      `${destination} museum`,
      `sightseeing in ${destination}`
    ];

    // Split queries to avoid rate limits? No, modern browser handles parallel requests fine.
    queries.forEach(q => {
      apiCalls.push(
        fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(q)}&format=json&origin=*&srlimit=50`)
          .then(r => r.json())
          .catch(() => ({}))
      );
    });

    // Execute All
    const results = await Promise.all(apiCalls);
    let allItems = [];

    // Process Results

    // --- DISTANCE VALIDATION HELPER ---
    const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
      const R = 6371; // Radius of the earth in km
      const dLat = (lat2 - lat1) * (Math.PI / 180);
      const dLon = (lon2 - lon1) * (Math.PI / 180);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c; // Distance in km
    };

    // 1. DEDUPLICATE & CLEAN
    const seen = new Set();
    const candidates = [];

    // Merge all raw results
    results.forEach(data => {
      const list = data.query?.geosearch || data.query?.search || [];
      list.forEach(item => {
        if (!seen.has(item.title)) {
          seen.add(item.title);
          candidates.push(item);
        }
      });
    });

    console.log(`Total Candidates before Validation: ${candidates.length}`);

    // 2. FETCH COORDINATES FOR VALIDATION
    // We must check if these "Keyword Found" places are actually NEAR the destination.
    // Batch fetch coordinates (Wiki allows 50 titles per call)

    const validPlaces = [];
    const CHUNK_SIZE = 50;

    for (let i = 0; i < candidates.length; i += CHUNK_SIZE) {
      const chunk = candidates.slice(i, i + CHUNK_SIZE);
      const titles = chunk.map(c => c.title).join('|');

      try {
        const coordUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=coordinates|pageimages&titles=${encodeURIComponent(titles)}&format=json&pithumbsize=500&origin=*`;
        const resp = await fetch(coordUrl);
        const data = await resp.json();
        const pages = data.query?.pages || {};

        Object.values(pages).forEach(page => {
          let isValid = false;

          // CRITERIA 1: It has coordinates and is within 50km
          if (coords && page.coordinates) {
            const dist = getDistanceFromLatLonInKm(
              coords.lat, coords.lon,
              page.coordinates[0].lat, page.coordinates[0].lon
            );
            // Ranchi waterfalls/dams can be 40-80km away. 
            // 50km was too strict. 100km is safe for a "Day Trip".
            if (dist < 100) isValid = true;
            // else console.log(`Skipping ${page.title} - Too far (${dist.toFixed(1)}km)`);
          }
          // CRITERIA 2: If we didn't find coords for the Destination, we trust the Keyword match (fallback)
          // OR if the page itself has no coords, we might skip it or keep it risky. 
          // Ideally, real attractions DO have coords.
          else if (!coords) {
            isValid = true; // Cannot validate distance, trust search
          }

          if (isValid) {
            validPlaces.push({
              name: page.title,
              image: page.thumbnail?.source || null
            });
          }
        });
      } catch (e) {
        console.warn("Validation Batch Failed", e);
      }
    }

    console.log(`Valid Places within 100km: ${validPlaces.length}`);

    // 3. FILTER BAD TERMS (Strict Aggressive)
    const BAD_TERMS = [
      "tourism in", "list of", "geography of", "economy of", "history of",
      "politics of", "demographics", "climate", "education in", "culture of",
      "transport in", "bibliography", "discography", "filmography",
      "school", "college", "university", "hospital", "clinic", "police station",
      "post office", "bank", "atm", "government", "office", "headquarters",
      "bus stop", "railway", "airport", "metro", "station", "stop", "terminal"
    ];

    const RESIDENTIAL_TERMS = [
      "nagar", "colony", "street", "road", "block", "sector", "phase", "enclave", "apartment", "residency",
      "tower", "building", "complex", "plaza", "mall", "market", "store", "shop", "cinema", "multiplex",
      "hospital", "clinic", "school", "college", "university", "campus", "hostel", "mess", "canteen",
      "bus stand", "bus stop", "railway station", "airport", "metro station", "district", "mandal", "taluk",
      "layout", "extension", "junction", "circle", "square", "gate", "bridge", "flyover", "highway", "toll"
    ];

    const TOURIST_KEYWORDS = [
      "temple", "park", "museum", "falls", "fort", "palace", "lake", "garden", "church", "mosque", "gurudwara",
      "sanctuary", "beach", "dam", "hill", "viewpoint", "resort", "monument", "memorial", "zoo",
      "wildlife", "safari", "aquarium", "statue", "tower", "island", "cave", "shrine", "ashram",
      "pilgrimage", "trek", "forest", "jungle", "river", "mountain", "peak", "valley", "glacier",
      "heritage", "ruins", "tomb", "mausoleum", "minaret", "observatory", "planetarium", "gallery",
      "theatre", "stadium", "arena", "convention", "expo", "fair", "festival", "carnival", "parade",
      "casino", "club", "bar", "pub", "brewery", "winery", "vineyard", "distillery", "factory",
      "studio", "workshop", "center", "centre"
    ];

    let uniqueList = validPlaces.filter(place => {
      const name = place.name.toLowerCase();

      // 1. Must NOT be the destination name itself
      if (name === destination.toLowerCase()) return false;

      // 2. Must NOT contain obvious Bad Terms
      if (BAD_TERMS.some(t => name.includes(t))) return false;

      // 3. Must NOT contain Residential/Commercial/Infra terms
      if (RESIDENTIAL_TERMS.some(t => name.includes(t))) {
        // console.log(`Rejecting (Residential): ${name}`);
        return false;
      }

      // 4. MUST have a Tourist Keyword
      const hasTouristKeyword = TOURIST_KEYWORDS.some(k => name.includes(k));

      if (!hasTouristKeyword && !place.image) {
        console.log(`Rejecting (No Keyword+No Image): ${name}`);
        return false;
      }

      return true;
    });

    // --- DEBUG: RANCHI SPECIFIC ---
    // If we have very few results, let's see why.
    if (uniqueList.length < 5) {
      console.warn("Low results! Checking filtered candidates...");
      // console.log("Valid Places (Distance OK) were:", validPlaces.map(p => p.name));
    }

    // 4. SORT BY RELEVANCE & IMAGE PRESENCE
    uniqueList.sort((a, b) => {
      // Priority 1: Has Image?
      if (a.image && !b.image) return -1;
      if (!a.image && b.image) return 1;

      // Priority 2: Nature/Landmark Boost (Falls, Dam, Forts, Museums > Generic Temples)
      const getPriorityScore = (name) => {
        name = name.toLowerCase();
        if (name.includes('falls') || name.includes('waterfall')) return 20;
        if (name.includes('dam') || name.includes('lake')) return 15;
        if (name.includes('fort') || name.includes('palace') || name.includes('museum')) return 12;
        if (name.includes('temple') || name.includes('park')) return 10; // Generic
        return 5;
      };

      const aScore = getPriorityScore(a.name);
      const bScore = getPriorityScore(b.name);

      return bScore - aScore;
    });

    // 5. FINAL LIST LOGIC (Fail-safe)
    console.log(`Strict Tourist Filter Result: ${uniqueList.length}`);

    // If strict filter killed too many good places (e.g. valid places had 14, now we have 0 or 1), 
    // we should settle for the "Valid Distance" list instead of showing nothing.
    if (uniqueList.length < 5 && validPlaces.length > 0) {
      console.log("Strict filter too aggressive. Reverting to distance-validated list.");
      uniqueList = validPlaces.filter(p => p.name.toLowerCase() !== destination.toLowerCase());

      // Still sort it
      uniqueList.sort((a, b) => {
        if (a.image && !b.image) return -1;
        return 0;
      });
    }

    console.log("Final Returned Places:", uniqueList.length);
    return uniqueList.slice(0, 15);

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
  let realPlaces = [];
  try {
    realPlaces = await fetchRealAttractions(destination);
    console.log(`generateMockItinerary received ${realPlaces.length} real places.`);
  } catch (e) { console.warn("Fetch failed", e); }

  // Retry if empty
  if (realPlaces.length === 0) {
    console.log("Retrying fetch...");
    realPlaces = await fetchRealAttractions(destination);
  }

  // 3. Fallback Fillers (generic)
  // 3. DISTRIBUTE REAL PLACES
  // We want to use ALL real places found (up to a reasonable limit per day).
  // If we have 15 places and 3 days -> 5 per day.
  // If we have 3 places and 3 days -> 1 per day.

  const totalPlaces = realPlaces.length;
  // If no places found, fallback to a single generic placeholder per day (Rare)
  if (totalPlaces === 0) {
    realPlaces.push({ name: `Explore ${destination} City Center`, image: null });
  }

  const generatedDays = [];
  let placeIndex = 0;

  // Calculate items per day (at least 2, at most 3 to fit M/A/E)
  let itemsPerDay = Math.ceil(totalPlaces / safeDays);
  if (itemsPerDay < 2) itemsPerDay = 2;
  if (itemsPerDay > 3) itemsPerDay = 3; // Cap at 3 for Morning/Afternoon/Evening

  const timeLabels = ['Morning', 'Afternoon', 'Evening'];

  for (let i = 1; i <= safeDays; i++) {
    const dailyPlan = [];

    // Fill this day
    for (let j = 0; j < itemsPerDay; j++) {
      let activity = null;
      let timeLabel = timeLabels[j] || 'Anytime';

      // Use Real Place
      if (placeIndex < realPlaces.length) {
        const place = realPlaces[placeIndex];
        placeIndex++;

        let desc = `Visit this popular attraction.`;
        const lowerName = place.name.toLowerCase();

        // Simple dynamic description
        if (lowerName.includes('temple')) desc = "Spiritual visit to this famous temple.";
        else if (lowerName.includes('park') || lowerName.includes('garden')) desc = "Relax in the greenery here.";
        else if (lowerName.includes('museum')) desc = "Explore the history and culture.";
        else if (lowerName.includes('falls')) desc = "Enjoy the scenic waterfalls.";
        else if (lowerName.includes('lake')) desc = "Peaceful time by the water.";
        else if (lowerName.includes('market')) desc = "Shop and explore local vibes.";

        activity = {
          title: place.name,
          desc: desc,
          image: place.image,
          time: timeLabel
        };
      }
      // If we ran out of real places, stop adding for this day (unless day is empty)
      else {
        if (dailyPlan.length === 0) {
          activity = {
            title: `Explore Local Streets`,
            desc: `Take a walk around the city.`,
            image: null
          };
        } else {
          break; // Stop adding filler
        }
      }

      if (activity) dailyPlan.push(activity);
    }

    generatedDays.push({
      day: i,
      theme: `Exploring ${destination}`,
      plan: dailyPlan
    });
  }

  // Fetch Cover Image
  let coverImage = `https://source.unsplash.com/800x600/?${destination},travel`;
  try {
    const realCover = await fetchDestinationImage(destination);
    if (realCover) coverImage = realCover;
  } catch (e) { }

  return {
    destination,
    duration: `${safeDays} Days`,
    coverImage: coverImage,
    days: generatedDays
  };
};

// --- REAL HOTELS GENERATOR (Wikipedia Based) ---
const fetchRealHotels = async (destination, budgetStr = 'Medium') => {
  try {
    // 1. Search for Hotels/Resorts
    const queries = [
      `Hotels in ${destination}`,
      `Resorts in ${destination}`,
      `Luxury stay ${destination}`,
      `Best hotels ${destination}`,
      `${destination} accommodation`
    ];

    let hotelCandidates = [];
    const apiCalls = queries.map(q =>
      fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(q)}&format=json&origin=*&srlimit=10`)
        .then(r => r.json())
        .catch(() => ({}))
    );

    const results = await Promise.all(apiCalls);

    results.forEach(res => {
      if (res.query?.search) {
        res.query.search.forEach(item => {
          // Filter: Must have "Hotel", "Resort", "Palace", "Inn", "Lodge", "Stay"
          const name = item.title;
          if (/(Hotel|Resort|Palace|Inn|Lodge|Stay|Villas|Cottage|Guest House)/i.test(name)) {
            hotelCandidates.push(name);
          }
        });
      }
    });

    // Dedup
    hotelCandidates = [...new Set(hotelCandidates)];
    console.log(`Found ${hotelCandidates.length} hotel candidates for ${destination}`);

    // If none found, fallback to generic
    if (hotelCandidates.length === 0) {
      return generateMockHotels(destination);
    }

    // 2. Fetch Images for top candidates
    // We need at least 3 distinct hotels (Low, Mid, High)
    // Let's try to categorize them by name keywords

    // Helper to guess category
    const categorize = (name) => {
      name = name.toLowerCase();
      if (name.includes('palace') || name.includes('grand') || name.includes('resort') || name.includes('luxury') || name.includes('5 star')) return 'Premium';
      if (name.includes('inn') || name.includes('lodge') || name.includes('guest') || name.includes('backpacker') || name.includes('hostel')) return 'Normal';
      return 'Good'; // Default
    };

    let categorized = { 'Normal': [], 'Good': [], 'Premium': [] };

    hotelCandidates.forEach(name => {
      const cat = categorize(name);
      categorized[cat].push(name);
    });

    // Ensure we have at least one for each, if not, fill from others
    const all = [...hotelCandidates];
    if (categorized['Normal'].length === 0) categorized['Normal'].push(all[0] || `${destination} Budget Inn`);
    if (categorized['Good'].length === 0) categorized['Good'].push(all[1] || `Hotel ${destination} City`);
    if (categorized['Premium'].length === 0) categorized['Premium'].push(all[2] || `Grand ${destination} Resort`);

    // 3. Select final 3 and fetch images
    const finalSelection = {
      "Normal": categorized['Normal'][0],
      "Good": categorized['Good'][0],
      "Premium": categorized['Premium'][0]
    };

    const finalHotels = {};

    for (const [key, name] of Object.entries(finalSelection)) {
      let image = null;
      try {
        // Fetch image
        const imgUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(name)}&prop=pageimages&format=json&pithumbsize=500&origin=*`;
        const r = await fetch(imgUrl);
        const d = await r.json();
        const pages = d.query?.pages || {};
        const pid = Object.keys(pages)[0];
        image = pages[pid]?.thumbnail?.source;
      } catch (e) { }

      // Fallback Image
      if (!image) {
        if (key === 'Normal') image = 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=500'; // Luxury/Cozy Resort feel (Safe Fallback)
        if (key === 'Good') image = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500';
        if (key === 'Premium') image = 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=500';
      }

      // Pricing Math
      let price = '';
      if (key === 'Normal') price = '$30 - $60';
      if (key === 'Good') price = '$80 - $150';
      if (key === 'Premium') price = '$250 - $500';

      finalHotels[key] = {
        name: name,
        rating: (4 + Math.random()).toFixed(1), // Random 4.0 - 5.0
        price: price,
        desc: `Stay at the ${name}. A top choice for ${key.toLowerCase()} travellers.`,
        image: image
      };
    }

    return finalHotels;

  } catch (e) {
    console.error("Real Hotel Fetch Failed", e);
    return generateMockHotels(destination);
  }
};

const generateMockHotels = (destination) => {
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

  // --- FETCH REAL PLACES FROM WIKIPEDIA (Native) ---
  let realPlacesContext = "";
  try {
    console.log("Fetching real places from Wikipedia for AI Context...");
    const places = await fetchRealAttractions(destination);
    if (places && places.length > 0) {
      realPlacesContext = "REAL KNOWN PLACES (Prioritize these): \n";
      places.slice(0, 25).forEach(p => {
        realPlacesContext += `- ${p.name}\n`;
      });
    }
  } catch (e) {
    console.warn("Wiki Context failed", e);
  }
  // --------------------------------------------

  const prompt = `
    Generate a detailed travel itinerary for a ${days}-day trip to ${destination} for a ${tripType} trip with a ${budget} budget.
    
    ${realPlacesContext}
    
    IMPORTANT:
    1. STRICTLY use the "REAL CONFIRMED PLACES" provided above in the itinerary. Do NOT invent new places if real ones are provided.
    2. If the provided list is short, you may supplement it with other famous, non-hallucinated landmarks known to you, but PRIORITIZE the provided list.
    3. Ensure the itinerary is practical, covers famous and hidden gems, and fits the budget.

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
