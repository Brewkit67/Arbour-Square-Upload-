import { useEffect, useRef } from 'react';

const BackgroundNodeEffect = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let particles: Particle[] = [];
        let animationFrameId: number;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initParticles();
        };

        class Particle {
            x: number;
            y: number;
            z: number;
            vx: number;
            vy: number;
            vz: number;
            baseSize: number;

            constructor() {
                this.x = (Math.random() - 0.5) * canvas!.width * 2;
                this.y = (Math.random() - 0.5) * canvas!.height * 2;
                this.z = Math.random() * 1000;

                this.vx = (Math.random() - 0.5) * 0.2;
                this.vy = (Math.random() - 0.5) * 0.2;
                this.vz = Math.random() * 0.5 + 0.1; // Move towards camera

                this.baseSize = 2;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;
                this.z -= this.vz; // Move closer

                // Reset if too close or out of bounds
                if (this.z < 1 || Math.abs(this.x) > canvas!.width || Math.abs(this.y) > canvas!.height) {
                    this.z = 1000;
                    this.x = (Math.random() - 0.5) * canvas!.width * 2;
                    this.y = (Math.random() - 0.5) * canvas!.height * 2;
                }
            }

            draw() {
                if (!ctx || !canvas) return;

                // Perspective projection
                const fov = 600;
                const scale = fov / (fov + this.z);

                const x2d = canvas.width / 2 + this.x * scale;
                const y2d = canvas.height / 2 + this.y * scale;

                const size = this.baseSize * scale;
                const opacity = Math.min(1, scale * scale * 0.5); // Fade out in distance

                ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
                ctx.beginPath();
                ctx.arc(x2d, y2d, size, 0, Math.PI * 2);
                ctx.fill();

                return { x: x2d, y: y2d, z: this.z, opacity };
            }
        }

        const initParticles = () => {
            particles = [];
            const numberOfParticles = 150;
            for (let i = 0; i < numberOfParticles; i++) {
                particles.push(new Particle());
            }
        };

        const animate = () => {
            if (!ctx || !canvas) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const particlePositions: { x: number, y: number, z: number, opacity: number }[] = [];

            // Update and draw particles
            particles.forEach(particle => {
                particle.update();
                const pos = particle.draw();
                if (pos) particlePositions.push(pos);
            });

            // Draw connections
            connectParticles(particlePositions);

            animationFrameId = requestAnimationFrame(animate);
        };

        const connectParticles = (positions: { x: number, y: number, z: number, opacity: number }[]) => {
            if (!ctx) return;

            for (let a = 0; a < positions.length; a++) {
                for (let b = a; b < positions.length; b++) {
                    const p1 = positions[a];
                    const p2 = positions[b];

                    // Check 3D depth difference first to avoid connecting far layers
                    if (Math.abs(p1.z - p2.z) > 100) continue;

                    const dx = p1.x - p2.x;
                    const dy = p1.y - p2.y;
                    const distance = Math.hypot(dx, dy);
                    const maxDist = 100 * (600 / (600 + p1.z)); // Scale max distance by depth

                    if (distance < maxDist) {
                        // Lower opacity of connection based on depth and distance
                        const alpha = Math.min(p1.opacity, p2.opacity) * (1 - distance / maxDist) * 0.5;

                        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
                        ctx.lineWidth = 0.5;
                        ctx.beginPath();
                        ctx.moveTo(p1.x, p1.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                }
            }
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed top-0 left-0 w-full h-[100vh] z-[-1] pointer-events-none"
        />
    );
};

export default BackgroundNodeEffect;
