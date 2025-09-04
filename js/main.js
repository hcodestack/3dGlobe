// Main application initialization
let globe = null;
let map2d = null;
let controls = null;
let textureGenerator = null;

async function init() {
    // Hide loading indicator
    const loadingElement = document.getElementById('loading');
    
    console.log('Starting initialization...');
    console.log('Three.js:', typeof THREE !== 'undefined');
    console.log('D3:', typeof d3 !== 'undefined');
    console.log('OrbitControls:', typeof THREE !== 'undefined' && THREE.OrbitControls);
    
    try {
        // Initialize texture generator
        textureGenerator = new TextureGenerator();
        
        // Load geographic data
        const geoLoaded = await textureGenerator.loadGeoData();
        if (!geoLoaded) {
            throw new Error('Failed to load geographic data');
        }
        
        // Initialize sample data
        dataStore.initializeSampleData();
        
        // Initialize 3D globe
        const globeContainer = document.getElementById('globe-container');
        globe = new Globe(globeContainer, textureGenerator);
        
        // Initialize 2D map
        const mapCanvas = document.getElementById('map-canvas');
        map2d = new Map2D(mapCanvas, textureGenerator);
        
        // Initialize controls
        const controlsContainer = document.getElementById('country-controls');
        controls = new Controls(controlsContainer);
        
        // Subscribe to data changes
        dataStore.subscribe((countryCode, value) => {
            // Update both visualizations
            if (globe) {
                globe.updateTexture();
            }
            if (map2d) {
                map2d.update();
            }
        });
        
        // Initial render
        textureGenerator.updateGlobeTexture();
        textureGenerator.update2DMap();
        globe.updateTexture();
        
        // Hide loading and show app
        loadingElement.style.display = 'none';
        
        // Add keyboard shortcuts
        setupKeyboardShortcuts();
        
    } catch (error) {
        console.error('Initialization error:', error);
        console.error('Error stack:', error.stack);
        loadingElement.textContent = 'Failed to load application: ' + error.message;
    }
}

function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Press 'R' to randomize values
        if (e.key === 'r' || e.key === 'R') {
            randomizeValues();
        }
        // Press 'C' to clear all values
        else if (e.key === 'c' || e.key === 'C') {
            clearAllValues();
        }
        // Press 'Space' to toggle auto-rotate
        else if (e.key === ' ') {
            e.preventDefault();
            if (globe && globe.controls) {
                globe.controls.autoRotate = !globe.controls.autoRotate;
            }
        }
    });
}

function randomizeValues() {
    const countries = ['USA', 'CHN', 'IND', 'BRA', 'RUS', 'JPN', 'DEU', 'GBR', 
                      'FRA', 'ITA', 'CAN', 'AUS', 'MEX', 'IDN', 'TUR', 'SAU', 
                      'ARG', 'EGY', 'NGA', 'ZAF'];
    
    countries.forEach(code => {
        const value = Math.floor(Math.random() * 101);
        dataStore.setCountryValue(code, value);
        controls.updateValue(code, value);
    });
}

function clearAllValues() {
    const countries = dataStore.getAllCountries();
    countries.forEach(([code]) => {
        dataStore.setCountryValue(code, 0);
        controls.updateValue(code, 0);
    });
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (globe) {
        globe.dispose();
    }
});

// Start the application
document.addEventListener('DOMContentLoaded', init);