import https from 'https';

const IGNORE_TERMS = [
    "tourism in", "list of", "geography of", "transport in", "district", "mandal", "municipality",
    "economy of", "history of", "politics of", "demographics", "climate", "education in",
    "culture of", "architecture of", "railway station", "airport", "bus stand"
];

const fetchWiki = (q) => {
    return new Promise((resolve) => {
        const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(q)}&format=json&origin=*&srlimit=50`;
        https.get(url, { headers: { 'User-Agent': 'DebugApp/1.0' } }, (res) => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
                try { resolve(JSON.parse(data).query.search); }
                catch (e) { resolve([]); }
            });
        });
    });
};

async function test(city) {
    console.log(`\nAnalyzing Filter for: ${city}`);

    // Mimic the "Aggressive" search
    const queries = [city, `${city} temple`, `${city} tourist attractions`, `places to visit in ${city}`];
    let allItems = [];

    for (const q of queries) {
        const res = await fetchWiki(q);
        allItems = [...allItems, ...res];
    }

    console.log(`Total Raw Items: ${allItems.length}`);

    const accepted = [];
    const rejected = [];
    const seen = new Set();

    allItems.forEach(item => {
        const name = item.title;
        const lower = name.toLowerCase();

        if (seen.has(lower)) return;
        seen.add(lower);

        if (lower === city.toLowerCase()) {
            rejected.push(`${name} [Exact Match]`);
            return;
        }

        const badTerm = IGNORE_TERMS.find(t => lower.includes(t));
        if (badTerm) {
            rejected.push(`${name} [Contains '${badTerm}']`);
            return;
        }

        accepted.push(name);
    });

    console.log(`\n--- REJECTED (${rejected.length}) ---`);
    console.log(rejected.slice(0, 15).join('\n'));

    console.log(`\n--- ACCEPTED (${accepted.length}) ---`);
    console.log(accepted.map(n => `✅ ${n}`).join('\n'));
}

test("Tirupati");
