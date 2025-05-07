/**
 * A more robust confetti animation for web celebrations
 */
const ConfettiCelebration = {
    canvas: null,
    context: null,
    particles: [],
    colors: [
        '#f44336', '#e91e63', '#9c27b0', '#673ab7', 
        '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', 
        '#009688', '#4CAF50', '#8BC34A', '#CDDC39', 
        '#FFEB3B', '#FFC107', '#FF9800', '#FF5722'
    ],
    animationId: null,
    
    init: function() {
        // Create canvas element if it doesn't exist
        if (!this.canvas) {
            this.canvas = document.createElement('canvas');
            this.canvas.id = 'confetti-canvas';
            this.canvas.style.position = 'fixed';
            this.canvas.style.top = '0';
            this.canvas.style.left = '0';
            this.canvas.style.width = '100%';
            this.canvas.style.height = '100%';
            this.canvas.style.pointerEvents = 'none';
            this.canvas.style.zIndex = '9999';
            document.body.appendChild(this.canvas);
            
            this.context = this.canvas.getContext('2d');
            
            // Set canvas size
            this.resizeCanvas();
            window.addEventListener('resize', () => this.resizeCanvas());
        }
    },
    
    resizeCanvas: function() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    },
    
    createParticles: function(count = 150) {
        this.particles = [];
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * -this.canvas.height,
                size: Math.random() * 10 + 5,
                color: this.colors[Math.floor(Math.random() * this.colors.length)],
                speed: Math.random() * 3 + 2,
                angle: Math.random() * Math.PI * 2,
                rotation: Math.random() * 0.2 - 0.1,
                rotationSpeed: Math.random() * 0.01 - 0.005
            });
        }
    },
    
    start: function() {
        console.log('Starting confetti celebration!');
        this.init();
        this.createParticles();
        this.canvas.style.display = 'block';
        this.animate();
    },
    
    animate: function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            
            // Update position
            p.x += Math.sin(p.angle) * 0.5;
            p.y += p.speed;
            p.rotation += p.rotationSpeed;
            
            // Draw particle
            this.context.save();
            this.context.translate(p.x, p.y);
            this.context.rotate(p.rotation);
            this.context.fillStyle = p.color;
            this.context.beginPath();
            
            // Randomly choose between rectangle and circle
            if (Math.random() > 0.5) {
                this.context.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
            } else {
                this.context.arc(0, 0, p.size / 2, 0, Math.PI * 2);
                this.context.fill();
            }
            
            this.context.restore();
            
            // Reset particle if it's off screen
            if (p.y > this.canvas.height) {
                p.y = Math.random() * -100;
                p.x = Math.random() * this.canvas.width;
            }
        }
        
        this.animationId = requestAnimationFrame(() => this.animate());
    },
    
    stop: function() {
        console.log('Stopping confetti celebration');
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        if (this.canvas) {
            this.canvas.style.display = 'none';
        }
    }
};

// Make it globally available
window.ConfettiCelebration = ConfettiCelebration;
