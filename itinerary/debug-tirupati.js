import https from 'https';

function fetchWiki(query) {
    return new Promise((resolve, reject) => {
        const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*&srlimit=20`;
        console.log(`fetching: ${url}`);

        https.get(url, { headers: { 'User-Agent': 'ItineraryAppDetect/1.0' } }, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    resolve(json.query ? json.query.search : []);
                } catch (e) {
                    resolve([]);
                }
            });
        }).on('error', reject);
    });
}

async function test() {
    const destination = "Tirupati";
    console.log(`\n--- Testing Wiki for ${destination} ---\n`);

    // Test 1: Standard Queries we use
    const q1 = `${destination} temple`;
    const r1 = await fetchWiki(q1);
    console.log(`Query 1 ("${q1}") found ${r1.length} results.`);
    r1.forEach(i => console.log(` - ${i.title}`));

    // Test 2: Specific check for user's missing place
    const q2 = `Malayappa swami temple`;
    const r2 = await fetchWiki(q2);
    console.log(`\nQuery 2 ("${q2}") found ${r2.length} results.`);
    r2.forEach(i => console.log(` - ${i.title}`));

    const q3 = `Malayappa`;
    const r3 = await fetchWiki(q3);
    console.log(`\nQuery 3 ("${q3}") found ${r3.length} results.`);
    r3.forEach(i => console.log(` - ${i.title}`));
}

test();
