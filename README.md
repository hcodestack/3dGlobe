# 3D Globe Data Visualization

An interactive web application featuring synchronized 3D globe and 2D map views with real-time data visualization.

## Features

- **3D Interactive Globe**: Pan, zoom, and rotate with mouse controls
- **2D Synchronized Map**: Flat world map view that updates in sync with the 3D globe
- **Data Visualization**: Countries colored based on numeric values (0-100 scale)
- **Real-time Updates**: Adjust country values with sliders and see immediate updates
- **Dotted Pattern Overlay**: Visual effect on land masses for enhanced aesthetics
- **Responsive Design**: Works on desktop and mobile devices

## Technology Stack

- **Three.js**: 3D rendering and globe visualization
- **D3.js**: Geographic projections and GeoJSON handling
- **HTML5 Canvas**: Dynamic texture generation
- **Vanilla JavaScript**: Core application logic with Observer pattern

## Running the Application

1. Start the local server:
   ```bash
   python3 server.py
   ```

2. Open your browser and navigate to:
   ```
   http://localhost:8000
   ```

## Controls

### Mouse Controls
- **Left Click + Drag**: Rotate the globe
- **Scroll**: Zoom in/out
- **Right Click + Drag**: Pan the view

### Keyboard Shortcuts
- **Space**: Toggle auto-rotation
- **R**: Randomize all country values
- **C**: Clear all values (set to 0)

### UI Controls
- Use the sliders in the left panel to adjust individual country values
- Values range from 0 (no color) to 100 (darkest orange)

## Architecture

The application uses a **single data source, dual render target** architecture:

1. **Data Store**: Central state management with Observer pattern
2. **Texture Generator**: Creates separate canvases for 3D and 2D views
   - Offscreen canvas for 3D globe (equirectangular projection)
   - Visible canvas for 2D map (Mercator projection)
3. **Synchronization**: Both views update from the same data source

## Key Components

- `dataStore.js`: Centralized data management and color scaling
- `textureGenerator.js`: Canvas-based texture generation for both views
- `globe.js`: Three.js 3D globe implementation
- `map2d.js`: 2D map view implementation
- `controls.js`: User interface controls for data manipulation
- `main.js`: Application initialization and coordination

## Performance Optimizations

- Dynamic texture sizing based on device capabilities
- Pixel ratio capping for mobile devices
- Debounced updates for smooth interactions
- Efficient canvas rendering with composite operations

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Requires WebGL support for 3D rendering.