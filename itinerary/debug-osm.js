import https from 'https';

function fetchNominatim(query) {
    return new Promise((resolve, reject) => {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`;
        console.log(`fetching: ${url}`);

        https.get(url, { headers: { 'User-Agent': 'ItineraryAppDetect/1.0' } }, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    resolve(json);
                } catch (e) {
                    resolve([]);
                }
            });
        }).on('error', reject);
    });
}

async function test() {
    const city = "Madurai";
    console.log(`\n--- Testing Queries for ${city} ---\n`);

    const q1 = `tourist attraction in ${city}`;
    const r1 = await fetchNominatim(q1);
    console.log(`Query: "${q1}" found ${r1.length} results.`);
    if (r1.length > 0) r1.forEach(i => console.log(`   - ${i.display_name.split(',')[0]}`));

    const q2 = `temple in ${city}`;
    const r2 = await fetchNominatim(q2);
    console.log(`Query: "${q2}" found ${r2.length} results.`);
    if (r2.length > 0) r2.forEach(i => console.log(`   - ${i.display_name.split(',')[0]}`));

    const q3 = `Meenakshi Amman Temple ${city}`;
    const r3 = await fetchNominatim(q3);
    console.log(`Query: "${q3}" found ${r3.length} results.`);

    // Test simpler query format
    const q4 = `${city} tourist attraction`;
    const r4 = await fetchNominatim(q4);
    console.log(`Query: "${q4}" found ${r4.length} results.`);
    if (r4.length > 0) r4.forEach(i => console.log(`   - ${i.display_name.split(',')[0]}`));
}

test();
