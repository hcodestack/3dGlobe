// 3D Globe implementation with Three.js
class Globe {
    constructor(container, textureGenerator) {
        this.container = container;
        this.textureGenerator = textureGenerator;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.globe = null;
        this.controls = null;
        this.texture = null;
        this.animationId = null;
        
        this.init();
    }

    init() {
        // Setup scene
        this.scene = new THREE.Scene();
        this.scene.background = null; // Transparent to show CSS gradient
        
        // Setup camera
        const aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
        this.camera.position.set(0, 0, 15);
        
        // Setup renderer
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true 
        });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.container.appendChild(this.renderer.domElement);
        
        // Add lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 3, 5);
        this.scene.add(directionalLight);
        
        // Create globe
        this.createGlobe();
        
        // Setup controls
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.rotateSpeed = 0.5;
        this.controls.zoomSpeed = 0.8;
        this.controls.minDistance = 7;
        this.controls.maxDistance = 25;
        
        // Auto-rotate
        this.controls.autoRotate = true;
        this.controls.autoRotateSpeed = 0.5;
        
        // Handle resize
        window.addEventListener('resize', () => this.onWindowResize());
        
        // Start animation
        this.animate();
    }

    createGlobe() {
        // Create sphere geometry
        const geometry = new THREE.SphereGeometry(5, 64, 32);
        
        // Create texture from canvas
        this.texture = new THREE.CanvasTexture(this.textureGenerator.globeCanvas);
        this.texture.needsUpdate = true;
        
        // Create material
        const material = new THREE.MeshPhongMaterial({
            map: this.texture,
            transparent: true,
            side: THREE.DoubleSide,
            shininess: 10,
            opacity: 0.95
        });
        
        // Create mesh
        this.globe = new THREE.Mesh(geometry, material);
        this.scene.add(this.globe);
        
        // Add atmosphere glow
        this.addAtmosphere();
        
        // Add stars
        this.addStars();
    }

    addAtmosphere() {
        const atmosphereGeometry = new THREE.SphereGeometry(5.2, 64, 32);
        const atmosphereMaterial = new THREE.MeshPhongMaterial({
            color: 0x4488ff,
            transparent: true,
            opacity: 0.1,
            side: THREE.BackSide
        });
        const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
        this.scene.add(atmosphere);
    }

    addStars() {
        const starsGeometry = new THREE.BufferGeometry();
        const starsMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.7,
            transparent: true,
            opacity: 0.8
        });

        const starsVertices = [];
        for (let i = 0; i < 10000; i++) {
            const x = (Math.random() - 0.5) * 2000;
            const y = (Math.random() - 0.5) * 2000;
            const z = -Math.random() * 2000;
            starsVertices.push(x, y, z);
        }

        starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
        const stars = new THREE.Points(starsGeometry, starsMaterial);
        this.scene.add(stars);
    }

    updateTexture() {
        // Update the texture from the texture generator
        this.textureGenerator.updateGlobeTexture();
        this.texture.needsUpdate = true;
    }

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());
        
        // Update controls
        this.controls.update();
        
        // Render scene
        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        
        this.renderer.setSize(width, height);
    }

    dispose() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        if (this.renderer) {
            this.renderer.dispose();
        }
        
        if (this.controls) {
            this.controls.dispose();
        }
    }
}