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

    // Create stars (daha az, daha soft)
    const stars: Star[] = Array.from({ length: 200 }, () => ({
      x: Math.random() * canvas.width - canvas.width / 2,
      y: Math.random() * canvas.height - canvas.height / 2,
      z: Math.random() * 2000,
      size: Math.random() * 1.5,
      color: starColors[Math.floor(Math.random() * starColors.length)],
      twinkle: Math.random() * Math.PI * 2,
    }));

    // Create nebulas (daha az, daha soft)
    const nebulas: Nebula[] = Array.from({ length: 8 }, () => ({
      x: Math.random() * canvas.width - canvas.width / 2,
      y: Math.random() * canvas.height - canvas.height / 2,
      z: Math.random() * 1500 + 500,
      size: Math.random() * 150 + 100,
      color: nebulaColors[Math.floor(Math.random() * nebulaColors.length)],
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.005,
      pulse: Math.random() * Math.PI * 2,
    }));

    // Shooting stars
    let shootingStars: ShootingStar[] = [];

    const createShootingStar = () => {
      // Daha az sıklıkta
      if (Math.random() > 0.995) {
        shootingStars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height * 0.5,
          vx: Math.random() * 3 + 2,
          vy: Math.random() * 2 + 1,
          life: 80,
          maxLife: 80,
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

      // Draw nebulas (daha soft, daha yavaş)
      nebulas.forEach((nebula) => {
        nebula.z -= 0.2;
        if (nebula.z <= 0) nebula.z = 2000;

        const scale = 1000 / nebula.z;
        const x2d = (nebula.x * scale) + centerX;
        const y2d = (nebula.y * scale) + centerY;
        const size = nebula.size * scale;

        if (x2d < -200 || x2d > canvas.width + 200 || y2d < -200 || y2d > canvas.height + 200) return;

        nebula.rotation += nebula.rotationSpeed;
        nebula.pulse += 0.01;
        const pulseFactor = 0.85 + Math.sin(nebula.pulse) * 0.15;

        ctx.save();
        ctx.translate(x2d, y2d);
        ctx.rotate(nebula.rotation);

        const nebulaGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size * pulseFactor);
        nebulaGradient.addColorStop(0, nebula.color + '20');
        nebulaGradient.addColorStop(0.5, nebula.color + '10');
        nebulaGradient.addColorStop(1, nebula.color + '00');

        ctx.fillStyle = nebulaGradient;
        ctx.fillRect(-size, -size, size * 2, size * 2);
        ctx.restore();
      });

      // Draw stars (daha soft ve yavaş)
      stars.forEach((star) => {
        // Daha yavaş hareket
        star.z -= 0.5;
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
        
        // Soft twinkle
        star.twinkle += 0.03;
        const twinkleFactor = 0.6 + Math.sin(star.twinkle) * 0.4;

        // Soft star glow (blur olmadan daha soft)
        const starGradient = ctx.createRadialGradient(x2d, y2d, 0, x2d, y2d, size * 2);
        starGradient.addColorStop(0, star.color);
        starGradient.addColorStop(0.7, star.color + '40');
        starGradient.addColorStop(1, star.color + '00');
        
        ctx.fillStyle = starGradient;
        ctx.globalAlpha = twinkleFactor * 0.8;
        ctx.beginPath();
        ctx.arc(x2d, y2d, size * 2, 0, Math.PI * 2);
        ctx.fill();

        // Core star
        ctx.fillStyle = star.color;
        ctx.globalAlpha = twinkleFactor;
        ctx.beginPath();
        ctx.arc(x2d, y2d, size / 2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.globalAlpha = 1;
      });

      // Create and draw shooting stars (daha soft)
      createShootingStar();
      shootingStars = shootingStars.filter((star) => {
        star.x += star.vx;
        star.y += star.vy;
        star.life -= 1;

        if (star.life <= 0) return false;

        const alpha = (star.life / star.maxLife) * 0.6;
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(star.x, star.y);
        ctx.lineTo(star.x - star.vx * 2, star.y - star.vy * 2);
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
