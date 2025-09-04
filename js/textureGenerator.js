// Texture generation system for both 3D globe and 2D map
class TextureGenerator {
    constructor() {
        this.globeCanvas = document.createElement('canvas');
        this.globeCanvas.width = 2048;
        this.globeCanvas.height = 1024;
        this.globeCtx = this.globeCanvas.getContext('2d');
        
        this.mapCanvas = document.getElementById('map-canvas');
        this.mapCtx = this.mapCanvas.getContext('2d');
        
        this.geoData = null;
        this.countries = null;
        
        // Projections
        this.globeProjection = d3.geoEquirectangular()
            .scale(this.globeCanvas.width / (2 * Math.PI))
            .translate([this.globeCanvas.width / 2, this.globeCanvas.height / 2]);
            
        this.mapProjection = null; // Will be set based on canvas size
        
        this.globePath = d3.geoPath().projection(this.globeProjection);
        this.mapPath = null;
        
        // Dotted pattern settings
        this.dotSpacing = 4;
        this.dotSize = 2;
    }

    async loadGeoData() {
        try {
            // Load world topology data
            const world = await d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json');
            this.countries = topojson.feature(world, world.objects.countries);
            
            // Create country code mapping
            this.countryMapping = new Map();
            this.countries.features.forEach(feature => {
                // Map numeric IDs to ISO codes (simplified mapping)
                const id = feature.id;
                const isoCode = this.getISOCode(id);
                if (isoCode) {
                    this.countryMapping.set(isoCode, feature);
                }
            });
            
            return true;
        } catch (error) {
            console.error('Failed to load geo data:', error);
            return false;
        }
    }

    // Simplified ISO code mapping (you'd want a complete mapping in production)
    getISOCode(numericId) {
        const mapping = {
            '840': 'USA', '156': 'CHN', '356': 'IND', '076': 'BRA',
            '643': 'RUS', '392': 'JPN', '276': 'DEU', '826': 'GBR',
            '250': 'FRA', '380': 'ITA', '124': 'CAN', '036': 'AUS',
            '484': 'MEX', '360': 'IDN', '792': 'TUR', '682': 'SAU',
            '032': 'ARG', '818': 'EGY', '566': 'NGA', '710': 'ZAF'
        };
        return mapping[numericId];
    }

    setupMap2DProjection() {
        // Set canvas size
        const containerRect = this.mapCanvas.parentElement.getBoundingClientRect();
        this.mapCanvas.width = containerRect.width - 40;
        this.mapCanvas.height = containerRect.height - 100;
        
        // Use Mercator projection for 2D map
        this.mapProjection = d3.geoMercator()
            .scale(this.mapCanvas.width / 6)
            .translate([this.mapCanvas.width / 2, this.mapCanvas.height / 2]);
            
        this.mapPath = d3.geoPath().projection(this.mapProjection);
    }

    drawDottedPattern(ctx, width, height) {
        // Create temporary canvas for land mask
        const maskCanvas = document.createElement('canvas');
        maskCanvas.width = width;
        maskCanvas.height = height;
        const maskCtx = maskCanvas.getContext('2d');
        
        // Draw all land areas as white on black
        maskCtx.fillStyle = 'black';
        maskCtx.fillRect(0, 0, width, height);
        
        if (this.countries) {
            maskCtx.fillStyle = 'white';
            const path = ctx === this.globeCtx ? this.globePath : this.mapPath;
            
            this.countries.features.forEach(feature => {
                maskCtx.beginPath();
                path.context(maskCtx)(feature);
                maskCtx.fill();
            });
        }
        
        // Get mask image data
        const maskData = maskCtx.getImageData(0, 0, width, height);
        
        // Clear and prepare main context
        ctx.fillStyle = 'rgba(0, 0, 0, 0)';
        ctx.fillRect(0, 0, width, height);
        
        // Draw dots where land exists
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        for (let x = 0; x < width; x += this.dotSpacing) {
            for (let y = 0; y < height; y += this.dotSpacing) {
                const i = (y * width + x) * 4;
                if (maskData.data[i] > 128) { // If it's land (white in mask)
                    ctx.beginPath();
                    ctx.arc(x, y, this.dotSize / 2, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }
    }

    updateGlobeTexture() {
        const ctx = this.globeCtx;
        const width = this.globeCanvas.width;
        const height = this.globeCanvas.height;
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        // Draw ocean background
        ctx.fillStyle = 'rgba(10, 20, 40, 0.3)';
        ctx.fillRect(0, 0, width, height);
        
        // Draw dotted pattern for land
        this.drawDottedPattern(ctx, width, height);
        
        // First draw all countries in white (default color)
        if (this.countries) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.globalAlpha = 0.8;
            this.countries.features.forEach(feature => {
                ctx.beginPath();
                this.globePath.context(ctx)(feature);
                ctx.fill();
            });
        }
        
        // Then draw colored countries based on data (this will overlay the white)
        dataStore.getAllCountries().forEach(([code, value]) => {
            const feature = this.countryMapping.get(code);
            if (feature && value > 0) {
                const color = dataStore.getCountryColor(code);
                ctx.fillStyle = color.toString();
                ctx.globalAlpha = 0.8;
                ctx.beginPath();
                this.globePath.context(ctx)(feature);
                ctx.fill();
                
                // Add subtle border
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
                ctx.lineWidth = 0.5;
                ctx.stroke();
            }
        });
        
        ctx.globalAlpha = 1;
        
        return this.globeCanvas;
    }

    update2DMap() {
        const ctx = this.mapCtx;
        const width = this.mapCanvas.width;
        const height = this.mapCanvas.height;
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        // Draw ocean background
        ctx.fillStyle = 'rgba(10, 20, 40, 0.5)';
        ctx.fillRect(0, 0, width, height);
        
        // Draw dotted pattern for land
        this.drawDottedPattern(ctx, width, height);
        
        // Draw all countries with white base color
        if (this.countries) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.globalAlpha = 0.8;
            this.countries.features.forEach(feature => {
                ctx.beginPath();
                this.mapPath.context(ctx)(feature);
                ctx.fill();
            });
        }
        
        // Draw colored countries based on data (overlay on white)
        dataStore.getAllCountries().forEach(([code, value]) => {
            const feature = this.countryMapping.get(code);
            if (feature && value > 0) {
                const color = dataStore.getCountryColor(code);
                ctx.fillStyle = color.toString();
                ctx.globalAlpha = 0.8;
                ctx.beginPath();
                this.mapPath.context(ctx)(feature);
                ctx.fill();
                
                // Add subtle border
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        });
        
        ctx.globalAlpha = 1;
    }

    updateAll() {
        this.updateGlobeTexture();
        this.update2DMap();
    }
}