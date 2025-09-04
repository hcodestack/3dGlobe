// 2D Map view implementation
class Map2D {
    constructor(canvas, textureGenerator) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.textureGenerator = textureGenerator;
        
        this.init();
    }

    init() {
        // Set up the projection in texture generator
        this.textureGenerator.setupMap2DProjection();
        
        // Initial draw
        this.update();
        
        // Handle resize
        window.addEventListener('resize', () => this.onResize());
    }

    update() {
        // Delegate to texture generator which handles the actual drawing
        this.textureGenerator.update2DMap();
    }

    onResize() {
        // Reconfigure projection for new size
        this.textureGenerator.setupMap2DProjection();
        
        // Redraw
        this.update();
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}