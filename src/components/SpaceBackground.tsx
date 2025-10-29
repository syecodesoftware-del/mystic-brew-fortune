import { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  z: number;
  size: number;
  color: string;
  twinkle: number;
}

interface Nebula {
  x: number;
  y: number;
  z: number;
  size: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  pulse: number;
}

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
}

const SpaceBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Responsive canvas
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Star colors
    const starColors = ['#ffffff', '#fffacd', '#ffb347', '#87ceeb', '#ffb6c1'];
    
    // Nebula colors
    const nebulaColors = ['#9333ea', '#3b82f6', '#dc2626', '#06b6d4'];

    // Create stars
    const stars: Star[] = Array.from({ length: 1000 }, () => ({
      x: Math.random() * canvas.width - canvas.width / 2,
      y: Math.random() * canvas.height - canvas.height / 2,
      z: Math.random() * 2000,
      size: Math.random() * 2,
      color: starColors[Math.floor(Math.random() * starColors.length)],
      twinkle: Math.random() * Math.PI * 2,
    }));

    // Create nebulas
    const nebulas: Nebula[] = Array.from({ length: 20 }, () => ({
      x: Math.random() * canvas.width - canvas.width / 2,
      y: Math.random() * canvas.height - canvas.height / 2,
      z: Math.random() * 1500 + 500,
      size: Math.random() * 100 + 50,
      color: nebulaColors[Math.floor(Math.random() * nebulaColors.length)],
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.01,
      pulse: Math.random() * Math.PI * 2,
    }));

    // Shooting stars
    let shootingStars: ShootingStar[] = [];

    const createShootingStar = () => {
      if (Math.random() > 0.98) {
        shootingStars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height * 0.5,
          vx: Math.random() * 5 + 3,
          vy: Math.random() * 3 + 2,
          life: 100,
          maxLife: 100,
        });
      }
    };

    // Animation
    let animationId: number;
    let time = 0;

    const animate = () => {
      if (!canvas || !ctx) return;

      time += 0.016;

      // Deep space gradient background
      const gradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        canvas.width
      );
      gradient.addColorStop(0, '#000005');
      gradient.addColorStop(0.5, '#000008');
      gradient.addColorStop(1, '#00000a');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Draw nebulas
      nebulas.forEach((nebula) => {
        nebula.z -= 0.5;
        if (nebula.z <= 0) nebula.z = 2000;

        const scale = 1000 / nebula.z;
        const x2d = (nebula.x * scale) + centerX;
        const y2d = (nebula.y * scale) + centerY;
        const size = nebula.size * scale;

        if (x2d < -100 || x2d > canvas.width + 100 || y2d < -100 || y2d > canvas.height + 100) return;

        nebula.rotation += nebula.rotationSpeed;
        nebula.pulse += 0.02;
        const pulseFactor = 0.8 + Math.sin(nebula.pulse) * 0.2;

        ctx.save();
        ctx.translate(x2d, y2d);
        ctx.rotate(nebula.rotation);

        const nebulaGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size * pulseFactor);
        nebulaGradient.addColorStop(0, nebula.color + '40');
        nebulaGradient.addColorStop(0.5, nebula.color + '20');
        nebulaGradient.addColorStop(1, nebula.color + '00');

        ctx.fillStyle = nebulaGradient;
        ctx.fillRect(-size, -size, size * 2, size * 2);
        ctx.restore();
      });

      // Draw stars
      stars.forEach((star) => {
        // Warp speed effect - stars moving toward camera
        star.z -= 2;
        if (star.z <= 0) {
          star.z = 2000;
          star.x = Math.random() * canvas.width - canvas.width / 2;
          star.y = Math.random() * canvas.height - canvas.height / 2;
        }

        const scale = 1000 / star.z;
        const x2d = (star.x * scale) + centerX;
        const y2d = (star.y * scale) + centerY;

        if (x2d < 0 || x2d > canvas.width || y2d < 0 || y2d > canvas.height) return;

        const size = star.size * scale;
        
        // Twinkle effect
        star.twinkle += 0.05;
        const twinkleFactor = 0.5 + Math.sin(star.twinkle) * 0.5;

        // Motion blur trail for faster stars
        if (star.z < 500) {
          const prevX = ((star.x) * (1000 / (star.z + 2))) + centerX;
          const prevY = ((star.y) * (1000 / (star.z + 2))) + centerY;
          
          ctx.beginPath();
          ctx.moveTo(prevX, prevY);
          ctx.lineTo(x2d, y2d);
          ctx.strokeStyle = star.color + '60';
          ctx.lineWidth = size;
          ctx.stroke();
        }

        // Star glow
        const starGradient = ctx.createRadialGradient(x2d, y2d, 0, x2d, y2d, size * 3);
        starGradient.addColorStop(0, star.color);
        starGradient.addColorStop(0.5, star.color + '80');
        starGradient.addColorStop(1, star.color + '00');
        
        ctx.fillStyle = starGradient;
        ctx.globalAlpha = twinkleFactor;
        ctx.fillRect(x2d - size * 3, y2d - size * 3, size * 6, size * 6);

        // Core star
        ctx.fillStyle = star.color;
        ctx.globalAlpha = 1;
        ctx.fillRect(x2d - size / 2, y2d - size / 2, size, size);

        // Lens flare for bright stars
        if (size > 1.5) {
          ctx.strokeStyle = star.color + '60';
          ctx.lineWidth = 0.5;
          // Horizontal flare
          ctx.beginPath();
          ctx.moveTo(x2d - size * 4, y2d);
          ctx.lineTo(x2d + size * 4, y2d);
          ctx.stroke();
          // Vertical flare
          ctx.beginPath();
          ctx.moveTo(x2d, y2d - size * 4);
          ctx.lineTo(x2d, y2d + size * 4);
          ctx.stroke();
        }
      });

      // Create and draw shooting stars
      createShootingStar();
      shootingStars = shootingStars.filter((star) => {
        star.x += star.vx;
        star.y += star.vy;
        star.life -= 1;

        if (star.life <= 0) return false;

        const alpha = star.life / star.maxLife;
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(star.x, star.y);
        ctx.lineTo(star.x - star.vx * 3, star.y - star.vy * 3);
        ctx.stroke();

        return true;
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: '#000005' }}
    />
  );
};

export default SpaceBackground;
