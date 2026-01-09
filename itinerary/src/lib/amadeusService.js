const CLIENT_ID = import.meta.env.VITE_AMADEUS_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.VITE_AMADEUS_CLIENT_SECRET;

let accessToken = null;
let tokenExpiry = 0;

/**
 * Helper to fetch with timeout
 */
const fetchWithTimeout = async (resource, options = {}) => {
    const { timeout = 5000 } = options;

    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(resource, {
        ...options,
        signal: controller.signal
    });

    clearTimeout(id);
    return response;
};

/**
 * Gets a valid access token, refreshing if necessary.
 */
const getValidAccessToken = async () => {
    // Return cached token if valid
    if (accessToken && Date.now() < tokenExpiry) {
        return accessToken;
    }

    try {
        const response = await fetchWithTimeout('https://test.api.amadeus.com/v1/security/oauth2/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `grant_type=client_credentials&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`
        });

        if (!response.ok) {
            throw new Error(`Auth Failed: ${response.statusText}`);
        }

        const data = await response.json();
        accessToken = data.access_token;
        // Set expiry to 100 seconds less than actual to be safe
        tokenExpiry = Date.now() + (data.expires_in * 1000) - 100000;

        console.log("Amadeus Token Refreshed");
        return accessToken;
    } catch (error) {
        console.error("Amadeus Auth Error:", error);
        return null; // Handle gracefully
    }
};

/**
 * Fetches IATA City Code for formatted address
 * e.g. "Paris" -> "PAR"
 */
const getCityCode = async (cityName) => {
    const token = await getValidAccessToken();
    if (!token) return null;

    try {
        const url = `https://test.api.amadeus.com/v1/reference-data/locations?subType=CITY&keyword=${encodeURIComponent(cityName)}&page[limit]=1`;
        const res = await fetchWithTimeout(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();

        if (data.data && data.data.length > 0) {
            return data.data[0].iataCode;
        }
        return null;
    } catch (e) {
        console.warn("City Code Fetch Failed:", e);
        return null;
    }
};

/**
 * Fetches a list of hotels in a city
 */
const getHotelsByCity = async (cityCode) => {
    const token = await getValidAccessToken();
    if (!token) return [];

    try {
        // Fetch up to 20 hotels
        const url = `https://test.api.amadeus.com/v1/reference-data/locations/hotels/by-city?cityCode=${cityCode}&radius=20&radiusUnit=KM&hotelSource=ALL`;
        const res = await fetchWithTimeout(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        return data.data || [];
    } catch (e) {
        console.warn("Hotel List Fetch Failed:", e);
        return [];
    }
};

/**
 * Main public function: Get detailed hotel options
 */
export const fetchAmadeusHotels = async (destination) => {
    if (!CLIENT_ID || !CLIENT_SECRET) {
        console.warn("Amadeus Credentials missing");
        return null;
    }

    try {
        console.log(`Fetching Amadeus Hotels for ${destination}...`);

        // 1. Get City Code
        const cityCode = await getCityCode(destination);
        if (!cityCode) {
            console.warn(`Could not find city code for ${destination}`);
            return null;
        }
        console.log(`City Code: ${cityCode}`);

        // 2. Get Hotel List
        const hotelList = await getHotelsByCity(cityCode);
        if (!hotelList || hotelList.length === 0) {
            console.warn("No hotels found in Amadeus.");
            return null;
        }

        console.log(`Found ${hotelList.length} hotels. Returning raw list...`);

        // 3. Transform to our App Format
        // We no longer categorize. We just return the list.
        const formattedHotels = hotelList.map(hotel => ({
            name: hotel.name,
            rating: (3.0 + Math.random() * 2.0).toFixed(1), // Mock rating (Amadeus Ref Data lacks reliable ratings)
            price: "View Rates", // Needs deep link for real price
            desc: `Located in ${destination} (${hotel.iataCode}).`,
            image: null, // Placeholder to be filled by image service or fallback
            source: 'Amadeus',
            id: hotel.hotelId
        }));

        return formattedHotels;

    } catch (error) {
        console.error("Amadeus Flow Failed:", error);
        return null;
    }
};
