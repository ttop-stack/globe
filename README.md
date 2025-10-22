# 🌍 Interactive 3D/2D Globe

An interactive globe visualization built with Three.js that allows you to toggle between 3D sphere and 2D flat map projections. Features real country boundaries from Natural Earth data with **clickable countries** that emit events for integration with news aggregators or other applications.

## Features

- **3D Globe View**: Rotating sphere with wireframe overlay and starfield background
- **2D Map View**: Flat equirectangular projection of the world map
- **Toggle Controls**: Switch between 3D and 2D views with a button or keyboard shortcuts
- **Interactive Country Selection**: Click on any country to select it
  - Visual highlight on selected country (turns yellow)
  - Emits `countrySelected` event with country data
  - Displays country info panel
  - Posts messages for iframe integration
- **Interactive Controls**: 
  - Drag to rotate (3D) or pan (2D)
  - Scroll to zoom in/out
  - Smooth orbit controls with damping
- **Country Boundaries**: Display individual country borders from Natural Earth GeoJSON data
- **Easy Integration**: Works standalone or embedded in existing websites

## Installation

1. Clone the repository:
```bash
git clone https://github.com/ttop-stack/globe.git
cd globe
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open your browser and navigate to:
```
http://localhost:8080
```

## Controls

- **Mouse**: Click and drag to rotate (3D) or pan (2D)
- **Click**: Click on any country to select it
- **Scroll Wheel**: Zoom in/out
- **Toggle Button**: Click the "Switch to 2D/3D" button in the top-right corner
- **Keyboard Shortcuts**: 
  - Press `Space`, `T`, or `t` to toggle between 3D and 2D views

## Quick Start Examples

### Standalone Usage
```bash
npm start
```
Open http://localhost:8080 and click on countries to see the selection in action.

### Integration Example
Open `example-integration.html` to see how the globe can be embedded in a news aggregator or other website.

```bash
npm start
# Then open http://localhost:8080/example-integration.html
```

## Integration with Your News Aggregator

See [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) for detailed instructions on:
- Embedding the globe in your existing website
- Listening to country selection events
- Connecting to your news API
- React, iframe, and direct integration examples

### Quick Integration Example

```javascript
// Listen for country clicks
window.addEventListener('countrySelected', (event) => {
  const { name, code } = event.detail;
  console.log('User clicked:', name, code);
  
  // Fetch and display news for this country
  fetch(`/api/news/country/${code}`)
    .then(res => res.json())
    .then(news => displayNews(news));
});
```

## Project Structure

```
globe/
├── index.html                  # Main HTML file
├── index.js                    # Main application logic with country selection
├── example-integration.html    # Example of embedding globe in a news site
├── INTEGRATION_GUIDE.md        # Detailed integration documentation
├── src/
│   ├── getStarfield.js         # Star field generator
│   └── threeGeoJSON.js         # GeoJSON to Three.js converter with interactivity
├── geojson/
│   └── ne_110m_admin_0_countries.json  # Country boundaries data
├── package.json
└── README.md
```

## Technologies Used

- **Three.js**: 3D graphics library
- **Natural Earth**: Free vector and raster map data
- **http-server**: Simple HTTP server for development

## Data Sources

Country boundary data from [Natural Earth](https://www.naturalearthdata.com/):
- Current: 110m scale (low resolution, smaller file size)
- Available: 50m and 10m scales for higher detail

GeoJSON files from [martynafford/natural-earth-geojson](https://github.com/martynafford/natural-earth-geojson)

## Customization

You can modify the following in `index.js`:

- **Colors**: Change `color: 0x80FF80` in the materialOptions
- **Globe size**: Adjust the `radius: 2` parameter
- **Star count**: Modify `numStars: 1000` in getStarfield
- **Data resolution**: Switch to higher resolution GeoJSON files (50m or 10m)

## License

ISC
