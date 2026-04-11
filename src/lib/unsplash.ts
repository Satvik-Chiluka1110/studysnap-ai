const UNSPLASH_ACCESS_KEY = "jJfho7-lQDKT6gWQpFu-2WnILaoVRCL2c1mwnb6NYUE";

export async function fetchUnsplashImages(keywords: string[]): Promise<string[]> {
  const urls: string[] = [];

  for (const keyword of keywords.slice(0, 8)) {
    try {
      const res = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(keyword)}&per_page=1&orientation=landscape`,
        { headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` } }
      );
      if (res.ok) {
        const data = await res.json();
        if (data.results?.[0]?.urls?.regular) {
          urls.push(data.results[0].urls.regular);
        }
      }
    } catch {
      // skip failed fetches
    }
  }

  // Fallback if no images found
  if (urls.length === 0) {
    urls.push("https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800");
  }

  return urls;
}
