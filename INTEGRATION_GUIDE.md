# Globe Integration Guide

This guide explains how to integrate the interactive globe into your existing news aggregator website.

## Overview

The globe component emits a `countrySelected` event whenever a user clicks on a country. Your news aggregator can listen to this event and display relevant news.

## Integration Methods

### Method 1: Embed as iframe (Simplest)

```html
<!-- In your news aggregator page -->
<iframe 
  src="http://your-globe-url/index.html" 
  width="100%" 
  height="600px"
  id="globeFrame"
></iframe>

<script>
// Listen for country selection
window.addEventListener('message', (event) => {
  if (event.data.type === 'countrySelected') {
    const country = event.data.country;
    console.log('Country selected:', country.name, country.code);
    
    // Fetch and display news for this country
    fetchNewsForCountry(country.code);
  }
});
</script>
```

Then modify the globe's `index.js` to post messages:

```javascript
// Add this to the selectCountry function in index.js
window.parent.postMessage({
  type: 'countrySelected',
  country: {
    name: countryData.name,
    code: countryData.code,
    properties: countryData.properties
  }
}, '*');
```

### Method 2: Same Page Integration

1. **Copy the globe files** to your project:
   ```
   your-project/
   ├── public/
   │   ├── globe/
   │   │   ├── index.js
   │   │   ├── src/
   │   │   │   ├── getStarfield.js
   │   │   │   └── threeGeoJSON.js
   │   │   └── geojson/
   │   │       └── ne_110m_admin_0_countries.json
   ```

2. **Create a container in your HTML**:
   ```html
   <div id="globe-container" style="width: 100%; height: 600px;"></div>
   ```

3. **Initialize the globe** (modify index.js to not use document.body):
   ```javascript
   const container = document.getElementById('globe-container');
   container.appendChild(renderer.domElement);
   ```

4. **Listen for country selection events**:
   ```javascript
   window.addEventListener('countrySelected', (event) => {
     const { name, code, properties } = event.detail;
     console.log('Country selected:', name, code);
     
     // Your logic here - fetch news, update UI, etc.
     displayNewsForCountry(code);
   });
   ```

## Event Data Structure

When a country is clicked, the `countrySelected` event contains:

```javascript
{
  detail: {
    name: "United States of America",  // Full country name
    code: "USA",                        // ISO A3 country code
    properties: {                       // All GeoJSON properties
      NAME: "United States of America",
      ISO_A3: "USA",
      POP_EST: 331002651,
      // ... more properties from the GeoJSON
    }
  }
}
```

## API Integration Examples

### Example 1: Fetch News by Country Code

```javascript
window.addEventListener('countrySelected', async (event) => {
  const { code, name } = event.detail;
  
  // Call your news API
  const response = await fetch(`/api/news/country/${code}`);
  const news = await response.json();
  
  // Update your UI
  document.getElementById('news-title').textContent = `News from ${name}`;
  displayNews(news);
});
```

### Example 2: Filter Existing News

```javascript
let allNews = []; // Your existing news data

window.addEventListener('countrySelected', (event) => {
  const { code } = event.detail;
  
  // Filter news by country
  const countryNews = allNews.filter(article => 
    article.countryCode === code
  );
  
  displayFilteredNews(countryNews);
});
```

### Example 3: React Integration

```jsx
import { useEffect } from 'react';

function NewsAggregator() {
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [news, setNews] = useState([]);

  useEffect(() => {
    const handleCountrySelect = (event) => {
      const { name, code } = event.detail;
      setSelectedCountry({ name, code });
      
      // Fetch news
      fetch(`/api/news/country/${code}`)
        .then(res => res.json())
        .then(data => setNews(data));
    };

    window.addEventListener('countrySelected', handleCountrySelect);
    
    return () => {
      window.removeEventListener('countrySelected', handleCountrySelect);
    };
  }, []);

  return (
    <div>
      <div id="globe-container"></div>
      {selectedCountry && (
        <div>
          <h2>News from {selectedCountry.name}</h2>
          <NewsList news={news} />
        </div>
      )}
    </div>
  );
}
```

## Customization

### Change Colors

```javascript
// In index.js, modify the materialOptions:
materialOptions: {
  color: 0xFF5733,  // Different color
}

// For highlight color, modify selectCountry function:
child.material.color.setHex(0xFF0000); // Red highlight
```

### Disable 2D/3D Toggle

```javascript
// Comment out or remove the toggle button creation
// document.body.appendChild(toggleBtn);
```

### Start in 2D Mode

```javascript
// Change initial state
let is3D = false;
globeGroup.visible = false;
flatGroup.visible = true;
```

## Moving to Another Codespace

1. **Commit all changes**:
   ```bash
   git add .
   git commit -m "Add interactive globe with country selection"
   git push
   ```

2. **In new codespace, clone and install**:
   ```bash
   git clone https://github.com/ttop-stack/globe.git
   cd globe
   npm install
   npm start
   ```

3. **Or copy files directly**:
   - Copy the entire `globe/` folder to your new project
   - Run `npm install` in the globe directory
   - Integrate using one of the methods above

## Dependencies

Required npm packages:
```json
{
  "dependencies": {
    "three": "^0.180.0"
  },
  "devDependencies": {
    "http-server": "^14.1.1"
  }
}
```

## Troubleshooting

### Countries not clickable
- Ensure `interactive: true` is set in `drawThreeGeo()`
- Check browser console for errors
- Make sure the GeoJSON loaded successfully

### Events not firing
- Check that the event listener is added after the page loads
- Verify the event name is exactly `'countrySelected'`
- Open browser console to see the logs when clicking

### Import errors
- Make sure `"type": "module"` is in package.json
- Use the correct import map in index.html
- Ensure all paths are correct relative to your project structure

## Questions?

Check the console logs when clicking countries - it will show:
- Selected country data
- The custom event being dispatched
- Any errors that occur

The info panel at the bottom left also confirms when a country is selected.
