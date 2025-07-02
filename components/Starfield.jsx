import React, { useRef, useEffect } from 'react';

// Simple starfield animation using HTML5 canvas.
// Renders a fixed, full-viewport canvas behind all content (pointer-events: none).
// Tailwind classes keep it dark-mode friendly.
export default function Starfield() {
  const canvasRef = useRef(null);
  const animationRef = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const STAR_COUNT = Math.floor((width * height) / 8000); // density-dependent
    const stars = Array.from({ length: STAR_COUNT }).map(() => createStar());

    function createStar() {
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        z: Math.random() * width,
        o: Math.random() * 0.5 + 0.3, // opacity
      };
    }

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    }

    window.addEventListener('resize', resize);

    function render() {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, width, height);

      for (const star of stars) {
        star.z -= 0.5; // speed
        if (star.z <= 0) star.z = width;

        const k = 128.0 / star.z;
        const px = star.x * k + width / 2;
        const py = star.y * k + height / 2;

        if (px >= 0 && px <= width && py >= 0 && py <= height) {
          const size = (1 - star.z / width) * 2;
          ctx.fillStyle = `rgba(255,255,255,${star.o})`;
          ctx.fillRect(px, py, size, size);
        }
      }

      animationRef.current = requestAnimationFrame(render);
    }

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-50 pointer-events-none mix-blend-screen"
    />
  );
} 