# 🌍 Interactive 3D/2D Globe

An interactive globe visualization built with Three.js that allows you to toggle between 3D sphere and 2D flat map projections. Features real country boundaries from Natural Earth data.

## Features

- **3D Globe View**: Rotating sphere with wireframe overlay and starfield background
- **2D Map View**: Flat equirectangular projection of the world map
- **Toggle Controls**: Switch between 3D and 2D views with a button or keyboard shortcuts
- **Interactive Controls**: 
  - Drag to rotate (3D) or pan (2D)
  - Scroll to zoom in/out
  - Smooth orbit controls with damping
- **Country Boundaries**: Display individual country borders from Natural Earth GeoJSON data

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
- **Scroll Wheel**: Zoom in/out
- **Toggle Button**: Click the "Switch to 2D/3D" button in the top-right corner
- **Keyboard Shortcuts**: 
  - Press `Space`, `T`, or `t` to toggle between 3D and 2D views

## Project Structure

```
globe/
├── index.html              # Main HTML file
├── index.js                # Main application logic
├── src/
│   ├── getStarfield.js     # Star field generator
│   └── threeGeoJSON.js     # GeoJSON to Three.js converter
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
