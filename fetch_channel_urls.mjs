const ids = [
  '3MPbTCqIkuM', '0V2Y8AIUugI', 'x6ICllwCMxE', 'qRACZeHacpA', '6nByRvRMuaY', 'j8RgqewE2C0', '8VrmqrSrONA', 'bTWnm02sObk',
  'kRTh53juVOU', 'uIS_oika5w4', 'w-BvFOMkb40', 'yPeWoZevNcU', 'p5vFjq_rQtw', 'cRSAqhqPWG4', 'vpfwGneh4W4', 'OuAtfP3-pk8',
  'w9AQ5a6-acU', '_EgMcR2a0-4', 'aUjo01G1O2U', 'DKzxO7ujP58', 'JHikaTQAJVQ', 'YWDC6z5DFkM', 'cOa2dNx28xg', 'CkRE2ZoXNOc',
  'j_qqHQtUOzw', 'r5rNHrJg-7I', '_Beflvl8PAs', 'F0ctfIuXKHQ'
];

const results = {};
for (const id of ids) {
  const url = `https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${id}`)}&format=json`;
  try {
    const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!response.ok) {
      results[id] = { error: `${response.status} ${response.statusText}` };
      continue;
    }
    const data = await response.json();
    results[id] = {
      author_name: data.author_name,
      author_url: data.author_url,
      title: data.title,
    };
  } catch (error) {
    results[id] = { error: String(error) };
  }
}
console.log(JSON.stringify(results, null, 2));
