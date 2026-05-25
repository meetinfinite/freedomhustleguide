// Resolves each venue name to a Google place_id via the Places API
// (uses the same endpoint as lib/places.ts). Prints a JSON mapping you
// can paste into MDX as ?place_id=… URLs.

const KEY = process.env.GOOGLE_PLACES_API_KEY;
if (!KEY) {
  console.error("GOOGLE_PLACES_API_KEY not set");
  process.exit(1);
}

// Rough Bangkok centre for location bias — boosts relevance, doesn't
// hard-restrict the search.
const BANGKOK = { lat: 13.7563, lng: 100.5018 };

const venues = [
  // Restaurants
  "Jay Fai Bangkok",
  "Wattana Panich Ekkamai Bangkok",
  "Polo Fried Chicken Lumphini Bangkok",
  "Soul Food Mahanakorn Thonglor Bangkok",
  "Krua Apsorn Bangkok",
  "Baan Tepa Bangkok",
  "Issaya Siamese Club Bangkok",
  "Saawaan Restaurant Bangkok",
  "80/20 Restaurant Bang Rak Bangkok",
  "Gaggan Anand Restaurant Bangkok",
  "Appia Restaurant Bangkok Sukhumvit 31",

  // Nightlife
  "Sky Bar Lebua Bangkok",
  "Octave Rooftop Bar Marriott Thonglor Bangkok",
  "Vertigo Moon Bar Banyan Tree Bangkok",
  "Tropic City Bar Charoenkrung Bangkok",
  "Tep Bar Chinatown Bangkok",
  "Q&A Bar Sukhumvit Bangkok",
  "Wong's Place Bar Silom Bangkok",
  "Teens of Thailand Chinatown Bangkok",
  "Sing Sing Theater Bangkok",
  "Mikkeller Bangkok Ekkamai",
  "JJ Green Market Chatuchak Bangkok",
  "Talad Rot Fai Ratchada Bangkok",
  "Asiatique Riverfront Bangkok"
];

async function findPlaceId(query) {
  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": KEY,
      "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress"
    },
    body: JSON.stringify({
      textQuery: query,
      locationBias: {
        circle: {
          center: { latitude: BANGKOK.lat, longitude: BANGKOK.lng },
          radius: 25000 // 25km — covers all of Bangkok
        }
      }
    })
  });
  if (!res.ok) {
    return { query, error: `${res.status} ${await res.text()}` };
  }
  const data = await res.json();
  const top = data.places?.[0];
  if (!top) return { query, error: "no result" };
  return {
    query,
    id: top.id,
    name: top.displayName?.text,
    address: top.formattedAddress
  };
}

const results = [];
for (const q of venues) {
  const r = await findPlaceId(q);
  console.log(
    r.error
      ? `✗ ${q.padEnd(50)} ${r.error}`
      : `✓ ${q.padEnd(50)} ${r.id}  (${r.name})`
  );
  results.push(r);
  await new Promise((res) => setTimeout(res, 100)); // gentle rate limit
}

console.log("\n--- JSON ---");
console.log(JSON.stringify(results, null, 2));
