import https from 'https';

const getCoords = (city) => {
    return new Promise((resolve) => {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`;
        https.get(url, { headers: { 'User-Agent': 'TravelApp/1.0' } }, (res) => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (json[0]) resolve({ lat: json[0].lat, lon: json[0].lon, name: json[0].display_name });
                    else resolve(null);
                } catch (e) { resolve(null); }
            });
        });
    });
};

const getNearbyWiki = (lat, lon) => {
    return new Promise((resolve) => {
        // Radius 10000m (10km)
        const url = `https://en.wikipedia.org/w/api.php?action=query&list=geosearch&gscoord=${lat}|${lon}&gsradius=10000&gslimit=50&format=json&origin=*`;
        console.log("Wiki Geo URL:", url);
        https.get(url, (res) => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    resolve(json.query ? json.query.geosearch : []);
                } catch (e) { resolve([]); }
            });
        });
    });
};

async function test() {
    const city = "Srisailam";
    console.log(`Getting Coords for ${city}...`);
    const coords = await getCoords(city);
    console.log("Coords:", coords);

    if (coords) {
        console.log("Fetching Nearby Articles...");
        const places = await getNearbyWiki(coords.lat, coords.lon);
        console.log(`Found ${places.length} places near ${city}:`);
        places.forEach(p => console.log(` - ${p.title} (${p.dist}m)`));
    }
}

test();
