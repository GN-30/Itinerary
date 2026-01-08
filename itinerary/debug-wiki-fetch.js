
const fetch = globalThis.fetch;

const BAD_TERMS = [
    "tourism in", "list of", "geography of", "economy of", "history of",
    "politics of", "demographics", "climate", "education in", "culture of",
    "transport in", "bibliography", "discography", "filmography",
    "school", "college", "university", "hospital", "clinic", "police station",
    "post office", "bank", "atm", "government", "office", "headquarters",
    "bus stop", "railway", "airport", "metro", "station", "stop", "terminal"
];

const SOFT_BAD_TERMS = [
    "district", "mandal", "municipality", "railway station", "airport", "bus stand",
    "road", "highway", "corporation", "division"
];

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

const fetchRealAttractions = async (destination) => {
    console.log(`FETCHING FOR: ${destination}`);
    const coords = await getCoordinates(destination);
    const apiCalls = [];

    // Geo Search
    if (coords) {
        console.log(`Coords found: ${coords.lat}, ${coords.lon}`);
        const geoUrl = `https://en.wikipedia.org/w/api.php?action=query&list=geosearch&gscoord=${coords.lat}|${coords.lon}&gsradius=20000&gslimit=50&format=json&origin=*`;
        apiCalls.push(fetch(geoUrl).then(r => r.json()).catch(e => ({ error: e })));
    } else {
        console.log("No coords found.");
    }

    const queries = [
        destination,
        `${destination} tourist attractions`,
        `places to visit in ${destination}`
    ];

    queries.forEach(q => {
        apiCalls.push(
            fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(q)}&format=json&origin=*&srlimit=50`)
                .then(r => r.json())
                .catch(e => ({ error: e }))
        );
    });

    const results = await Promise.all(apiCalls);
    let allItems = [];

    results.forEach((data, i) => {
        if (data.query && data.query.geosearch) {
            console.log(`Geo results came back with ${data.query.geosearch.length} items`);
            allItems = [...allItems, ...data.query.geosearch];
        }
        if (data.query && data.query.search) {
            console.log(`Query "${queries[i - 1] || 'Geo'}" came back with ${data.query.search.length} items`);
            allItems = [...allItems, ...data.query.search];
        }
    });

    console.log(`Total raw items: ${allItems.length}`);

    // Filter
    let strictList = allItems.filter(item => {
        const name = item.title.toLowerCase();
        if (name === destination.toLowerCase()) return false;
        if (BAD_TERMS.some(t => name.includes(t))) return false;
        if (SOFT_BAD_TERMS.some(t => name.includes(t))) return false;
        return true;
    });

    console.log(`Strict filtered count: ${strictList.length}`);
    if (strictList.length < 50) {
        strictList.forEach(i => console.log(" - " + i.title));
    }

    // Image test
    if (strictList.length > 0) {
        const topPlace = strictList[0];
        console.log(`Fetching image for: ${topPlace.title}`);
        const imgUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(topPlace.title)}&prop=pageimages&format=json&pithumbsize=500&origin=*`;
        const res = await fetch(imgUrl);
        const data = await res.json();
        console.log(JSON.stringify(data, null, 2));
    }
};

fetchRealAttractions("Madurai");
