# Moving Globe to Another Codespace / Project

This guide explains how to transfer the interactive globe to your news aggregator codespace.

## Prerequisites

Your news aggregator should have:
- Node.js installed
- A web server (Express, etc.)
- A place to mount the globe component

## Transfer Methods

### Method 1: Git Clone (Recommended)

In your news aggregator codespace:

```bash
# Clone the globe repository
git clone https://github.com/ttop-stack/globe.git

# Or if already cloned, pull latest changes
cd globe
git pull origin main

# Install dependencies
npm install

# Test it works
npm start
# Visit http://localhost:8080
```

### Method 2: Copy Files Directly

If you want to integrate directly into your news aggregator:

```bash
# In your news aggregator project root:
mkdir -p public/globe

# Copy essential files:
cp -r /path/to/globe/src public/globe/
cp -r /path/to/globe/geojson public/globe/
cp /path/to/globe/index.js public/globe/
cp /path/to/globe/index.html public/globe/
cp /path/to/globe/package.json public/globe/

# Install globe dependencies
cd public/globe
npm install
```

### Method 3: Separate Service

Keep globe as a separate service:

```bash
# In your codespace, create separate folder
mkdir news-globe
cd news-globe
git clone https://github.com/ttop-stack/globe.git
cd globe
npm install
npm start  # Runs on port 8080
```

Then embed via iframe in your news aggregator:
```html
<iframe src="http://localhost:8080" width="100%" height="600px"></iframe>
```

## Integration with Your News Aggregator

### Option A: Iframe Embedding (Easiest)

In your news aggregator's frontend:

```html
<!-- news-aggregator/views/index.html -->
<div class="globe-container">
  <iframe src="/globe" width="100%" height="600px" id="globeFrame"></iframe>
</div>

<div class="news-container" id="newsContainer">
  <!-- Your news content here -->
</div>

<script>
window.addEventListener('message', (event) => {
  if (event.data.type === 'countrySelected') {
    const { name, code } = event.data.country;
    
    // Call your news API
    fetch(`/api/news/country/${code}`)
      .then(res => res.json())
      .then(news => displayNews(news));
  }
});
</script>
```

### Option B: Direct Integration

If your news aggregator uses React/Vue/etc:

1. **Copy globe files** to your public/static folder
2. **Add globe container** to your page
3. **Import the globe script** as a module
4. **Listen for events**:

```jsx
// React example
useEffect(() => {
  const handleCountrySelect = (event) => {
    const { code, name } = event.detail;
    setSelectedCountry({ code, name });
    fetchNewsForCountry(code);
  };

  window.addEventListener('countrySelected', handleCountrySelect);
  
  return () => window.removeEventListener('countrySelected', handleCountrySelect);
}, []);
```

### Option C: API Proxy

Set up a proxy in your news aggregator backend:

```javascript
// news-aggregator/server.js (Express example)
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

app.use('/globe', createProxyMiddleware({ 
  target: 'http://localhost:8080',
  changeOrigin: true,
  pathRewrite: { '^/globe': '' }
}));
```

## Connecting to Your News API

Once country is selected, integrate with your existing backend:

```javascript
// Example API call structure
async function fetchNewsForCountry(countryCode) {
  try {
    // Replace with your actual news API endpoint
    const response = await fetch(`/api/news/country/${countryCode}`);
    const newsData = await response.json();
    
    // Update your UI with news data
    displayNews(newsData);
  } catch (error) {
    console.error('Error fetching news:', error);
  }
}
```

### Backend API Example (if you need to create it)

```javascript
// news-aggregator/routes/news.js
router.get('/api/news/country/:code', async (req, res) => {
  const { code } = req.params;
  
  try {
    // Query your database for news by country
    const news = await db.query(
      'SELECT * FROM articles WHERE country_code = ? ORDER BY date DESC LIMIT 20',
      [code]
    );
    
    res.json(news);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});
```

## File Structure After Integration

### If Using Iframe Method:
```
your-news-aggregator/
├── backend/
│   └── server.js
├── frontend/
│   ├── index.html (with iframe to globe)
│   └── scripts/
│       └── news-handler.js
└── globe/  (separate folder)
    ├── index.html
    ├── index.js
    ├── src/
    └── geojson/
```

### If Direct Integration:
```
your-news-aggregator/
├── backend/
│   └── server.js
├── frontend/
│   ├── index.html
│   ├── scripts/
│   │   ├── news-handler.js
│   │   └── globe/
│   │       ├── index.js
│   │       ├── getStarfield.js
│   │       └── threeGeoJSON.js
│   └── data/
│       └── geojson/
```

## Testing the Integration

1. **Start your news aggregator backend**
2. **Start the globe** (if separate): `npm start` in globe folder
3. **Open your news aggregator** in browser
4. **Click on a country** in the globe
5. **Verify**:
   - Console shows "Country selected: [country name]"
   - Your news API is called with the country code
   - News articles for that country are displayed

## Troubleshooting

### Globe not loading
- Check that the globe server is running (port 8080)
- Verify file paths are correct
- Check browser console for import errors

### Country clicks not working
- Open browser console and look for JavaScript errors
- Verify the `countrySelected` event listener is added
- Check that raycasting is working (you should see logs when clicking)

### News not updating
- Verify your news API endpoint is correct
- Check network tab in browser dev tools
- Ensure your backend is receiving the country code

### CORS issues (if iframe)
- Add CORS headers to your globe server
- Or use a proxy as shown in Option C above

## Country Code Reference

The globe uses ISO A3 country codes:
- USA (United States)
- CAN (Canada)
- GBR (United Kingdom)
- FRA (France)
- DEU (Germany)
- etc.

Make sure your news database uses the same ISO A3 codes, or create a mapping:

```javascript
const codeMapping = {
  'USA': 'US',  // if your DB uses ISO A2
  'GBR': 'UK',
  // etc.
};
```

## Next Steps

1. ✅ Copy the globe code to your new codespace
2. ✅ Test the globe standalone
3. ✅ Integrate with your news aggregator frontend
4. ✅ Connect to your news API
5. ✅ Test country selection and news display
6. ✅ Customize colors/styling to match your site
7. ✅ Deploy both services

## Need Help?

Check these files:
- `INTEGRATION_GUIDE.md` - Detailed integration examples
- `example-integration.html` - Working example with mock news
- Browser console logs when clicking countries

The globe emits detailed console logs to help debug integration issues.
