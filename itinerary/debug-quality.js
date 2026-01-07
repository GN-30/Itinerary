import https from 'https';

const getCoordinates = (city) => {
    return new Promise((resolve) => {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`;
        https.get(url, { headers: { 'User-Agent': 'TravelAppDev/1.0' } }, (res) => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (json[0]) resolve({ lat: json[0].lat, lon: json[0].lon });
                    else resolve(null);
                } catch (e) { resolve(null); }
            });
        });
    });
};

const fetchWiki = (url) => {
    return new Promise((resolve) => {
        https.get(url, { headers: { 'User-Agent': 'TravelAppDev/1.0' } }, (res) => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    resolve(json);
                } catch (e) { resolve({}); }
            });
        });
    });
};

async function test(city) {
    console.log(`\n\n=== TESTING QUALITY FOR: ${city} ===`);
    const coords = await getCoordinates(city);
    console.log("Coords:", coords);

    let allItems = [];

    // 1. Geo Search
    if (coords) {
        const geoUrl = `https://en.wikipedia.org/w/api.php?action=query&list=geosearch&gscoord=${coords.lat}|${coords.lon}&gsradius=20000&gslimit=50&format=json&origin=*`;
        const data = await fetchWiki(geoUrl);
        if (data.query && data.query.geosearch) {
            allItems = [...allItems, ...data.query.geosearch];
        }
    }

    // 2. Keywords
    const queries = [city, `${city} tourist attractions`, `${city} temple`, `places to visit in ${city}`];
    for (const q of queries) {
        const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(q)}&format=json&origin=*&srlimit=20`;
        const data = await fetchWiki(url);
        if (data.query && data.query.search) {
            allItems = [...allItems, ...data.query.search];
        }
    }

    console.log(`[RAW] Total Items Fetched: ${allItems.length}`);

    // SMART FILTERING SIMULATION
    const IGNORE_TERMS = [
        "tourism in", "list of", "geography of", "transport in", "district", "mandal", "municipality",
        "economy of", "history of", "politics of", "demographics", "climate", "education in",
        "culture of", "architecture of", "railway station", "airport", "bus stand"
    ];

    const GOOD_KEYWORDS = [
        "temple", "park", "museum", "falls", "fort", "palace", "lake", "garden", "church", "mosque",
        "sanctuary", "beach", "dam", "hill", "viewpoint", "resort", "monument", "memorial", "zoo",
        "wildlife", "safari", "aquarium", "statue", "tower", "bridge", "island", "cave"
    ];

    const seen = new Set();
    const rejected = [];
    let uniqueList = allItems.map(item => ({ name: item.title })).filter(place => {
        const name = place.name.toLowerCase();

        if (seen.has(name)) return false;

        if (IGNORE_TERMS.some(term => name.includes(term))) {
            rejected.push(`${place.name} (Filter: ${IGNORE_TERMS.find(t => name.includes(t))})`);
            return false;
        }

        if (name === city.toLowerCase()) return false;

        seen.add(name);
        return true;
    });

    console.log(`[FILTERED] Surviving Items: ${uniqueList.length}`);
    console.log("REJECTED SAMPLES:", rejected.slice(0, 5));

    // SORTING
    uniqueList = uniqueList.sort((a, b) => {
        const aScore = GOOD_KEYWORDS.some(k => a.name.toLowerCase().includes(k)) ? 1 : 0;
        const bScore = GOOD_KEYWORDS.some(k => b.name.toLowerCase().includes(k)) ? 1 : 0;
        return bScore - aScore;
    });

    console.log(`\n--- FINAL TOP 20 ---`);
    console.log(uniqueList.slice(0, 20).map(i => i.name).join('\n'));
}

async function run() {
    await test("Coimbatore");
    await test("Ooty");
}

run();
