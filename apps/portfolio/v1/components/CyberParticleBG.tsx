/* eslint-disable prefer-const */
'use client';

import { useRef, useEffect, useState } from 'react';

const CyberParticleBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    // Initial dimensions
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight
    });

    // Handle resize with debounce for performance
    let resizeTimer: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        setDimensions({
          width: window.innerWidth,
          height: window.innerHeight
        });
      }, 100);
    };

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!canvasRef.current || dimensions.width === 0)
       return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) 
      return;

    // Set canvas dimensions
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    // Calculate particle density based on screen size
    const getParticleCount = () => {
      const baseDensity = dimensions.width * dimensions.height / 15000;

      return Math.min(Math.max(Math.floor(baseDensity), 40), 200);
    };

    // Create particles
    const particlesArray: Particle[] = [];
    const numberOfParticles = getParticleCount();

    // Mouse position tracking with touch support
    const mouse = {
      x: undefined as number | undefined,
      y: undefined as number | undefined,
      radius: Math.min(150, dimensions.width * 0.1) // Responsive radius
    };

    const updateMousePosition = (event: MouseEvent | TouchEvent) => {
      if ('touches' in event) {
        mouse.x = event.touches[0].clientX;
        mouse.y = event.touches[0].clientY;
      } else {
        mouse.x = event.clientX;
        mouse.y = event.clientY;
      }
    };

    window.addEventListener('mousemove', updateMousePosition);
    window.addEventListener('touchmove', updateMousePosition);

    // Idle animation - subtle movement when no mouse activity
    let mouseIdle = true;
    let idleTimer: NodeJS.Timeout;
    
    const resetIdleTimer = () => {
      mouseIdle = false;
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        mouseIdle = true;
      }, 3000);
    };

    window.addEventListener('mousemove', resetIdleTimer);
    window.addEventListener('touchstart', resetIdleTimer);
    resetIdleTimer();

    class Particle {
      x: number;
      y: number;
      size: number;
      baseX: number;
      baseY: number;
      density: number;
      color: string;
      velocityX: number;
      velocityY: number;
      pulseSize: number;
      pulseSpeed: number;
      pulseDirection: boolean;
      dataGlow: boolean;

      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.baseX = this.x;
        this.baseY = this.y;
        this.density = (Math.random() * 25) + 1;
        this.velocityX = Math.random() * 0.2 - 0.1;
        this.velocityY = Math.random() * 0.2 - 0.1;
        
        // Pulsing effect
        this.pulseSize = this.size;
        this.pulseSpeed = Math.random() * 0.05 + 0.01;
        this.pulseDirection = Math.random() > 0.5;
        
        // Data node effect (5% of particles will be data nodes)
        this.dataGlow = Math.random() < 0.05;
        
        // Hacker green color palette
        const colors = [
          'rgba(0, 255, 70, 0.7)',    // Bright neon green
          'rgba(0, 200, 80, 0.6)',    // Medium green
          'rgba(0, 150, 70, 0.5)',    // Darker green
          'rgba(100, 255, 100, 0.4)', // Light green
          'rgba(0, 180, 110, 0.6)',   // Teal-green
          'rgba(0, 100, 50, 0.5)',    // Deep green
          'rgba(30, 255, 150, 0.4)'   // Cyan-green
        ];
        
        this.color = this.dataGlow 
          ? 'rgba(0, 255, 70, 0.9)' 
          : colors[Math.floor(Math.random() * colors.length)];
      }

      update() {
        // Mouse repulsion effect
        if (mouse.x !== undefined && mouse.y !== undefined) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < mouse.radius) {
            const forceDirectionX = dx / distance;
            const forceDirectionY = dy / distance;
            const maxDistance = mouse.radius;
            const force = (maxDistance - distance) / maxDistance;
            const directionX = forceDirectionX * force * this.density * -1.5; // Stronger repulsion
            const directionY = forceDirectionY * force * this.density * -1.5;
            
            this.x += directionX;
            this.y += directionY;
          } else {
            // Return to original position with slight drift
            if (this.x !== this.baseX) {
              let dx = this.x - this.baseX;
              this.x -= dx / 15;
            }
            if (this.y !== this.baseY) {
              let dy = this.y - this.baseY;
              this.y -= dy / 15;
            }
          }
        }

        // Add idle animation when mouse isn't moving
        if (mouseIdle) {
          this.x += this.velocityX;
          this.y += this.velocityY;
          
          // Boundary check
          if (this.x > canvas.width || this.x < 0) {
            this.velocityX *= -1;
          }
          if (this.y > canvas.height || this.y < 0) {
            this.velocityY *= -1;
          }
        }

        // Pulsing size effect for data nodes
        if (this.dataGlow) {
          if (this.pulseDirection) {
            this.pulseSize += this.pulseSpeed;
            if (this.pulseSize > this.size * 1.5) this.pulseDirection = false;
          } else {
            this.pulseSize -= this.pulseSpeed;
            if (this.pulseSize < this.size * 0.8) this.pulseDirection = true;
          }
        }
      }

      draw() {
        if (!ctx) return;
        
        // Draw main particle
        ctx.fillStyle = this.color;
        ctx.beginPath();
        
        // Data nodes are squares for a more digital look
        if (this.dataGlow) {
          ctx.shadowBlur = 15;
          ctx.shadowColor = 'rgba(0, 255, 70, 0.8)';
          ctx.rect(
            this.x - this.pulseSize, 
            this.y - this.pulseSize, 
            this.pulseSize * 2, 
            this.pulseSize * 2
          );
        } else {
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        }
        
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0; // Reset shadow
      }
    }

    function init() {
      particlesArray.length = 0;
      for (let i = 0; i < numberOfParticles; i++) {
        particlesArray.push(new Particle());
      }
    }
    init();

    // Connect particles with lines
    function connect() {
      if (!ctx) return;
      
      for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a; b < particlesArray.length; b++) {
          const dx = particlesArray[a].x - particlesArray[b].x;
          const dy = particlesArray[a].y - particlesArray[b].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Dynamic connection distance based on screen size
          const connectionDistance = Math.min(150, dimensions.width * 0.1);

          if (distance < connectionDistance) {
            // Create data-like flow effect on lines
            const flowSpeed = Date.now() * 0.001;
            const flowOffset = (a * b) % 10;
            const flowPhase = (flowSpeed + flowOffset) % 1;
            
            let opacityValue = 1 - (distance / connectionDistance);
            
            // Data flow effect - brighter parts moving along connections
            if (particlesArray[a].dataGlow || particlesArray[b].dataGlow) {
              // Data nodes get brighter connections
              ctx.strokeStyle = `rgba(0, 255, 100, ${opacityValue * 0.7})`;
              ctx.lineWidth = 1;
              
              // Add moving data packet effect
              if (Math.random() > 0.99) {
                ctx.fillStyle = 'rgba(0, 255, 70, 0.8)';
                const packetPosition = flowPhase;
                const packetX = particlesArray[a].x * (1 - packetPosition) + particlesArray[b].x * packetPosition;
                const packetY = particlesArray[a].y * (1 - packetPosition) + particlesArray[b].y * packetPosition;
                ctx.beginPath();
                ctx.arc(packetX, packetY, 1.5, 0, Math.PI * 2);
                ctx.fill();
              }
            } else {
              // Normal connections
              ctx.strokeStyle = `rgba(0, 180, 70, ${opacityValue * 0.3})`;
              ctx.lineWidth = 0.6;
            }
            
            ctx.beginPath();
            ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
            ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
            ctx.stroke();
          }
        }
      }
    }

    // Add a digital rain effect for more hacker vibes
    function drawDigitalRain() {
      if (!ctx) return;
      
      const characters = "01";
      const fontSize = 10;
      const columns = Math.floor(canvas.width / fontSize);
      // const _rainDrops = Array(columns).fill(1);
      
      // Only draw occasionally for subtle effect
      if (Math.random() > 0.95) {
        const x = Math.floor(Math.random() * columns) * fontSize;
        const y = Math.random() * canvas.height;
        
        ctx.fillStyle = "rgba(0, 255, 70, 0.1)";
        ctx.font = fontSize + "px monospace";
        const text = characters.charAt(Math.floor(Math.random() * characters.length));
        ctx.fillText(text, x, y);
      }
    }

    // Animation loop
    function animate() {
      if (!ctx) return;
      requestAnimationFrame(animate);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Matrix-like digital rain effect
      drawDigitalRain();

      // Update and draw particles
      for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
        particlesArray[i].draw();
      }
      
      // Connect particles with lines
      connect();
    }
    
    animate();

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      window.removeEventListener('touchmove', updateMousePosition);
      window.removeEventListener('mousemove', resetIdleTimer);
      window.removeEventListener('touchstart', resetIdleTimer);
      clearTimeout(idleTimer);
    };
  }, [dimensions]);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed top-0 left-0 w-full h-full bg-gradient-to-br from-black via-gray-900 to-gray-950 -z-10"
      style={{
        background: 'radial-gradient(circle, rgba(0,20,10,1) 0%, rgba(0,10,5,1) 50%, rgba(0,0,0,1) 100%)'
      }}
    />
  );
};

export default CyberParticleBackground;