"use client";
import React, { useState, useEffect, useRef } from 'react';

type TerminalLine = {
  text: string;
  delay: number;
  color: string;
};
type SystemStats = {
  cpu: number;
  memory: number;
  network: {
    in: number;
    out: number;
  };
  processes: string[];
  temperature: number;
  uptime: number;
};


const Hero = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [leftTerminalLines, setLeftTerminalLines] = useState<TerminalLine[]>([]);
  const [rightSystemStats, setRightSystemStats] = useState<SystemStats>({
  cpu: 0,
  memory: 0,
  network: { in: 0, out: 0 },
  processes: [],
  temperature: 0,
  uptime: 0,
});

  const canvasRef = useRef(null);
  const overlayCanvasRef = useRef(null);
  const animationRef = useRef<number | null>(null);
  const cpuHistoryRef = useRef(new Array(20).fill(0));
  const memoryHistoryRef = useRef(new Array(20).fill(0));
  const networkHistoryRef = useRef({ in: new Array(20).fill(0), out: new Array(20).fill(0) });

  const commandSets = [
    [
      { text: '$ git status', delay: 800, color: '#10b981' },
      { text: 'On branch main', delay: 300, color: '#cbd5e1' },
      { text: '$ npm run build', delay: 1000, color: '#10b981' },
      { text: '✓ Compiled successfully', delay: 600, color: '#22c55e' }
    ],
    [
      { text: '$ docker ps', delay: 800, color: '#10b981' },
      { text: 'CONTAINER ID   STATUS', delay: 400, color: '#06b6d4' },
      { text: 'f2a1c3d5e7   Up 2 hours', delay: 300, color: '#22c55e' },
      { text: '$ kubectl get pods', delay: 1000, color: '#10b981' },
      { text: 'portfolio-app   Running', delay: 400, color: '#22c55e' }
    ],
    [
      { text: '$ tail -f app.log', delay: 800, color: '#10b981' },
      { text: '[INFO] Server started', delay: 400, color: '#3b82f6' },
      { text: '[INFO] DB connected', delay: 300, color: '#22c55e' },
      { text: '[INFO] Ready for requests', delay: 500, color: '#06b6d4' }
    ]
  ];

  const processes = [
    'node server.js',
    'nginx master',
    'postgres main',
    'redis-server',
    'docker daemon',
    'kubectl proxy'
  ];

  // Terminal animation
  useEffect(() => {
    let currentSet = 0;
    let currentCommand = 0;
    let timeoutId:any;

    const executeCommands = () => {
      const commandSet = commandSets[currentSet];
      const command = commandSet[currentCommand];

      setLeftTerminalLines(prev => [...prev, command].slice(-8));

      currentCommand++;
      if (currentCommand >= commandSet.length) {
        currentCommand = 0;
        currentSet = (currentSet + 1) % commandSets.length;
        timeoutId = setTimeout(executeCommands, 2000);
      } else {
        timeoutId = setTimeout(executeCommands, command.delay);
      }
    };

    executeCommands();
    return () => clearTimeout(timeoutId);
  }, []);

  // System stats
  useEffect(() => {
    const updateStats = () => {
      setRightSystemStats((prev) => {
        const newCpu = Math.max(15, Math.min(95, prev.cpu + (Math.random() - 0.5) * 25));
        const newMemory = Math.max(25, Math.min(85, prev.memory + (Math.random() - 0.5) * 20));
        const newNetworkIn = Math.max(0, Math.min(100, prev.network.in + (Math.random() - 0.5) * 40));
        const newNetworkOut = Math.max(0, Math.min(100, prev.network.out + (Math.random() - 0.5) * 35));

        cpuHistoryRef.current.push(newCpu);
        cpuHistoryRef.current.shift();
        
        memoryHistoryRef.current.push(newMemory);
        memoryHistoryRef.current.shift();
        
        networkHistoryRef.current.in.push(newNetworkIn);
        networkHistoryRef.current.in.shift();
        networkHistoryRef.current.out.push(newNetworkOut);
        networkHistoryRef.current.out.shift();

        return {
          cpu: newCpu,
          memory: newMemory,
          network: { in: newNetworkIn, out: newNetworkOut },
          processes: processes.sort(() => 0.5 - Math.random()).slice(0, 4),
          temperature: 45 + Math.random() * 20,
          uptime: prev.uptime + 1
        };
      });
    };

    setRightSystemStats({
      cpu: 45 + Math.random() * 20,
      memory: 60 + Math.random() * 15,
      network: { in: 30 + Math.random() * 20, out: 25 + Math.random() * 15 },
      processes: processes.slice(0, 4),
      temperature: 55,
      uptime: 0
    });

    const interval = setInterval(updateStats, 2000);
    return () => clearInterval(interval);
  }, []);

  // Enhanced background animation with integrated elements
  useEffect(() => {
    const canvas:any = canvasRef.current;
    const overlayCanvas:any = overlayCanvasRef.current;
    if (!canvas || !overlayCanvas) return;
    
    const ctx = canvas.getContext('2d');
    const overlayCtx = overlayCanvas.getContext('2d');
    
    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      overlayCanvas.width = window.innerWidth;
      overlayCanvas.height = window.innerHeight;
    };
    
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    let time = 0;
    
    // Floating particles
    const particles = Array.from({ length: 25 }, () => ({ // Reduced from 50 to 25
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3, // Slower movement
      vy: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.4 + 0.05, // More subtle
      size: Math.random() * 1.5 + 0.3
    }));

    // Data streams for minimal effect
    const dataStreams = Array.from({ length: 4 }, (_, i) => ({ // Reduced from 8 to 4
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      chars: '01',
      speed: 1.5 + Math.random() * 2, // Slower
      opacity: 0.2 + Math.random() * 0.2 // More subtle
    }));
    
    const animate = () => {
      // Clear both canvases
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
      
      time += 0.01;

      // Subtle data streams - minimal
      dataStreams.forEach((stream, index) => {
        if (index % 3 === 0) { // Only show every 3rd stream
          overlayCtx.fillStyle = `rgba(0, 255, 255, ${stream.opacity * 0.1})`;
          overlayCtx.font = '10px monospace';
          
          for (let i = 0; i < 5; i++) { // Reduced from 15 to 5
            const char = stream.chars[Math.floor(Math.random() * stream.chars.length)];
            overlayCtx.fillText(
              char, 
              stream.x, 
              stream.y + i * 30 - (time * stream.speed * 20) % (canvas.height + 300)
            );
          }
        }
      });

      // Floating particles - cleaner connections
      particles.forEach((particle, index) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;
        
        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 255, 255, ${particle.alpha * 0.6})`;
        ctx.fill();

        // Connect only very close particles
        particles.slice(index + 1).forEach(otherParticle => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 60) { // Reduced from 100 to 60
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.strokeStyle = `rgba(0, 255, 255, ${(1 - distance / 60) * 0.05})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

      // Central energy field - more subtle
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      for (let ring = 1; ring <= 2; ring++) { // Reduced from 4 to 2 rings
        const segments = ring * 6; // Reduced segments
        const baseRadius = Math.min(canvas.width, canvas.height) * 0.08; // Smaller radius
        
        for (let i = 0; i < segments; i++) {
          const angle = (i / segments) * Math.PI * 2 + time * (ring % 2 === 0 ? 0.2 : -0.15);
          const radius = ring * baseRadius + Math.sin(time * 1.2 + ring) * 8;
          const x = centerX + Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * radius;
          
          const opacity = 0.05 + Math.sin(time * 1.5 + i + ring) * 0.02; // More subtle
          const size = 0.8 + Math.sin(time * 1.5 + i) * 0.3;
          
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0, 255, 255, ${opacity})`;
          ctx.fill();
        }
      }

      // Subtle data flow streams
      const streamCount = Math.max(2, Math.floor(canvas.height / 300)); // Reduced streams
      for (let i = 0; i < streamCount; i++) {
        const progress = (time * 0.3 + i / streamCount) % 1; // Slower
        const startX = canvas.width * 0.1;
        const endX = canvas.width * 0.9;
        const y = canvas.height * 0.3 + (i * canvas.height * 0.2);
        
        const currentX = startX + (endX - startX) * progress;
        
        const gradient = ctx.createLinearGradient(currentX - 40, y, currentX, y);
        gradient.addColorStop(0, 'rgba(0, 255, 255, 0)');
        gradient.addColorStop(0.8, 'rgba(0, 255, 255, 0.08)');
        gradient.addColorStop(1, 'rgba(0, 255, 255, 0.2)');
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(Math.max(0, currentX - 40), y);
        ctx.lineTo(currentX, y);
        ctx.stroke();
        
        // Subtle data packets
        if (progress > 0.2) {
          ctx.beginPath();
          ctx.arc(currentX, y, 1, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(0, 255, 255, 0.4)';
          ctx.fill();
        }
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, []);

  useEffect(() => {
    const handleMouseMove = (e:any) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Enhanced SVG Chart Component with better visibility and styling
  const MiniChart = ({ data, color, height = 30, showFill = true }:any) => {
    const maxValue = Math.max(...data);
    const minValue = Math.min(...data);
    const range = maxValue - minValue || 1;
    
    return (
      <svg width="100%" height={height} className="overflow-visible">
        <defs>
          <filter id={`glow-${color.replace('#', '')}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.4"/>
            <stop offset="50%" stopColor={color} stopOpacity="0.2"/>
            <stop offset="100%" stopColor={color} stopOpacity="0.05"/>
          </linearGradient>
          <linearGradient id={`line-gradient-${color.replace('#', '')}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color} stopOpacity="0.6"/>
            <stop offset="50%" stopColor={color} stopOpacity="1"/>
            <stop offset="100%" stopColor={color} stopOpacity="0.8"/>
          </linearGradient>
        </defs>
        
        {/* Background grid dots */}
        {Array.from({ length: 5 }, (_, i) => (
          <line
            key={i}
            x1="0"
            x2="100"
            y1={height * (i + 1) / 6}
            y2={height * (i + 1) / 6}
            stroke={color}
            strokeOpacity="0.1"
            strokeWidth="0.5"
            strokeDasharray="1,2"
          />
        ))}
        
        {showFill && (
          <path
            d={`M0,${height} ${data.map((value:any, index:any) => {
              const x = (index / (data.length - 1)) * 100;
              const y = height - ((value - minValue) / range) * (height * 0.8) - height * 0.1;
              return `L${x},${y}`;
            }).join(' ')} L100,${height} Z`}
            fill={`url(#gradient-${color.replace('#', '')})`}
          />
        )}
        
        {/* Main line with enhanced visibility */}
        <polyline
          points={data.map((value:any, index:any) => {
            const x = (index / (data.length - 1)) * 100;
            const y = height - ((value - minValue) / range) * (height * 0.8) - height * 0.1;
            return `${x},${y}`;
          }).join(' ')}
          fill="none"
          stroke={`url(#line-gradient-${color.replace('#', '')})`}
          strokeWidth="2.5"
          filter={`url(#glow-${color.replace('#', '')})`}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Data points */}
        {data.map((value:any, index:any) => {
          const x = (index / (data.length - 1)) * 100;
          const y = height - ((value - minValue) / range) * (height * 0.8) - height * 0.1;
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="1.5"
              fill={color}
              opacity={index === data.length - 1 ? "1" : "0.6"}
              filter={`url(#glow-${color.replace('#', '')})`}
            />
          );
        })}
        
        {/* Current value indicator */}
        <circle
          cx={100}
          cy={height - ((data[data.length - 1] - minValue) / range) * (height * 0.8) - height * 0.1}
          r="3"
          fill={color}
          opacity="0.8"
        >
          <animate attributeName="r" values="3;4;3" dur="2s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite"/>
        </circle>
      </svg>
    );
  };

  return (
    <div className="relative min-h-screen bg-black overflow-hidden font-sans pt-24 lg:pt-28">
      {/* Multi-layer background */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />
      <canvas ref={overlayCanvasRef} className="absolute inset-0 z-5 opacity-60" />
      
      {/* Subtle gradient overlays */}
      <div className="absolute inset-0 bg-gradient-radial from-cyan-900/5 via-transparent to-transparent z-10" />
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/10 via-transparent to-slate-900/10 z-15" />

      {/* Interactive mouse glow */}
      <div
        className="fixed w-32 h-32 lg:w-64 lg:h-64 rounded-full pointer-events-none z-20 transition-all duration-700 ease-out opacity-15 hidden md:block"
        style={{
          background: 'radial-gradient(circle, rgba(0,255,255,0.15) 0%, rgba(0,255,255,0.05) 30%, transparent 70%)',
          transform: `translate(${mousePosition.x - 128}px, ${mousePosition.y - 128}px)`,
          filter: 'blur(1px)'
        }}
      />

      {/* Mobile Layout */}
      <div className="lg:hidden">
        {/* Main content */}
        <div className="relative z-25 px-4 py-20 text-center max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight mb-3 leading-tight">
            <span className="brand-heading drop-shadow-lg">Adnan</span>
          </h1>
          <h2 className="text-lg sm:text-xl font-semibold tracking-[0.2em] text-slate-200/90 mb-4 uppercase">
            Full Stack Developer
          </h2>
          <p className="text-base text-slate-300/80 max-w-xl mx-auto leading-relaxed mb-9">
            Architecting scalable, edge-first experiences with tasteful dark UI.
          </p>
          
          <div className="flex flex-col gap-3 mb-12">
            <button className="px-6 py-3 rounded-lg bg-cyan-500 text-black font-semibold hover:bg-cyan-400 transition-all duration-300 shadow-lg shadow-cyan-500/25">
              Explore Projects
            </button>
            <button
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-6 py-3 rounded-lg border border-cyan-500/40 text-cyan-200 font-semibold hover:border-cyan-400/60 hover:text-white transition-all duration-300"
            >
              Connect
            </button>
          </div>
        </div>

        {/* Floating system info */}
        <div className="absolute top-1/2 left-4 transform -translate-y-1/2 space-y-4 z-25">
          {/* Terminal lines */}
          <div className="space-y-2">
            {leftTerminalLines.slice(-3).map((line, index) => (
              <div key={index} className="font-mono text-xs opacity-60 transition-all duration-500" style={{ color: line.color }}>
                {line.text}
              </div>
            ))}
          </div>
        </div>

        <div className="absolute top-1/2 right-4 transform -translate-y-1/2 space-y-6 z-25">
          {/* CPU */}
          <div className="text-right">
            <div className="text-xs font-mono text-cyan-400/80 mb-1">CPU {Math.round(rightSystemStats.cpu)}%</div>
            <div className="w-16 h-4">
              <MiniChart data={cpuHistoryRef.current.slice(-8)} color="#00ffff" height={16} showFill={false} />
            </div>
          </div>

          {/* Memory */}
          <div className="text-right">
            <div className="text-xs font-mono text-purple-400/80 mb-1">MEM {Math.round(rightSystemStats.memory)}%</div>
            <div className="w-16 h-4">
              <MiniChart data={memoryHistoryRef.current.slice(-8)} color="#a855f7" height={16} showFill={false} />
            </div>
          </div>

          {/* Network */}
          <div className="text-right">
            <div className="text-xs font-mono text-green-400/80 mb-1">NET</div>
            <div className="w-16 h-3 mb-1">
              <MiniChart data={networkHistoryRef.current.in.slice(-8)} color="#22c55e" height={12} showFill={false} />
            </div>
            <div className="w-16 h-3">
              <MiniChart data={networkHistoryRef.current.out.slice(-8)} color="#16a34a" height={12} showFill={false} />
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block">
        <div className="grid grid-cols-12 gap-8 max-w-7xl mx-auto px-6 lg:px-10 py-16 min-h-[80vh] items-center">
          
          {/* Left - Floating terminal */}
          <div className="col-span-3 flex flex-col justify-center">
            <div className="space-y-4">
              <div className="text-cyan-400/80 font-mono text-sm mb-4 flex items-center">
                <div className="w-2 h-2 bg-cyan-400 rounded-full mr-3 animate-pulse" />
                ~/portfolio
              </div>
              <div className="space-y-3">
                {leftTerminalLines.map((line, index) => (
                  <div key={index} className="font-mono text-sm transition-all duration-500 opacity-80 hover:opacity-100" style={{ color: line.color }}>
                    {line.text}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Center */}
          <div className="col-span-6 flex flex-col justify-center items-center text-center relative z-25">
            <h1 className="text-6xl xl:text-7xl font-black tracking-tight mb-6 leading-tight">
              <span className="brand-heading drop-shadow-2xl">Adnan</span>
            </h1>
            <h2 className="text-xl xl:text-2xl font-semibold tracking-[0.28em] text-slate-200/90 mb-8 uppercase">
              Full Stack Developer
            </h2>
            <p className="text-lg text-slate-300/85 max-w-2xl mx-auto leading-relaxed mb-16">
              <span className="block">Architecting scalable, edge-first solutions.</span>
              <span className="block text-slate-200 font-semibold mt-1">Revolutionize your systems, one build at a time.</span>
            </p>

            <div className="flex gap-6 mb-16">
              <button className="px-10 py-4 rounded-lg bg-cyan-500 text-black font-semibold hover:bg-cyan-400 transition-all duration-300 hover:scale-105 shadow-lg shadow-cyan-500/25" onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}>
                Explore Projects
              </button>
              <button
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-10 py-4 rounded-lg border border-cyan-500/40 text-cyan-200 font-semibold hover:border-cyan-400/60 hover:text-white transition-all duration-300 hover:scale-105"
              >
                Connect
              </button>
            </div>

          </div>

          {/* Right - Floating system stats */}
          <div className="col-span-3 flex flex-col justify-center space-y-8">
            
            {/* CPU */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-cyan-300 font-mono text-sm flex items-center">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full mr-3 animate-pulse shadow-lg shadow-cyan-400/50" />
                  CPU
                </div>
                <span className="text-xl font-mono text-white font-bold drop-shadow-lg">{Math.round(rightSystemStats.cpu)}%</span>
              </div>
              <div className="h-12 mb-3">
                <MiniChart data={cpuHistoryRef.current} color="#00ffff" height={48} />
              </div>
              <div className="flex justify-between text-xs font-mono text-slate-300/80">
                <span>8 cores</span>
                <span>{Math.round(rightSystemStats.temperature)}°C</span>
              </div>
            </div>

            {/* Memory */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-purple-300 font-mono text-sm flex items-center">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mr-3 animate-pulse shadow-lg shadow-purple-400/50" />
                  MEMORY
                </div>
                <span className="text-xl font-mono text-white font-bold drop-shadow-lg">{Math.round(rightSystemStats.memory)}%</span>
              </div>
              <div className="h-12 mb-3">
                <MiniChart data={memoryHistoryRef.current} color="#a855f7" height={48} />
              </div>
              <div className="text-xs font-mono text-slate-300/80">
                {(rightSystemStats.memory * 0.16).toFixed(1)}GB / 16GB
              </div>
            </div>

            {/* Network */}
            <div className="space-y-4">
              <div className="text-green-300 font-mono text-sm flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-3 animate-pulse shadow-lg shadow-green-400/50" />
                NETWORK I/O
              </div>
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-mono text-slate-200/90 mb-2 flex items-center justify-between">
                    <span>↓ DOWNLOAD</span>
                    <span className="text-green-300 font-bold">{Math.round(rightSystemStats.network.in)} MB/s</span>
                  </div>
                  <div className="h-8">
                    <MiniChart data={networkHistoryRef.current.in} color="#22c55e" height={32} />
                  </div>
                </div>
                <div>
                  <div className="text-sm font-mono text-slate-200/90 mb-2 flex items-center justify-between">
                    <span>↑ UPLOAD</span>
                    <span className="text-green-300 font-bold">{Math.round(rightSystemStats.network.out)} MB/s</span>
                  </div>
                  <div className="h-8">
                    <MiniChart data={networkHistoryRef.current.out} color="#16a34a" height={32} />
                  </div>
                </div>
              </div>
            </div>

            {/* Processes */}
            <div className="space-y-4">
              <div className="text-yellow-300 font-mono text-sm flex items-center">
                <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3 animate-pulse shadow-lg shadow-yellow-400/50" />
                PROCESSES
              </div>
              <div className="space-y-3">
                {rightSystemStats.processes.map((process, index) => (
                  <div key={index} className="flex items-center justify-between text-sm font-mono">
                    <span className="text-slate-200/90 truncate mr-3">{process}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full opacity-80 animate-pulse shadow-sm shadow-green-400/50" />
                      <span className="text-green-300 text-xs">ACTIVE</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Minimal corner decorations */}
      <div className="absolute top-0 left-0 w-8 h-8 lg:w-12 lg:h-12 border-l border-t border-cyan-500/20 z-40" />
      <div className="absolute top-0 right-0 w-8 h-8 lg:w-12 lg:h-12 border-r border-t border-cyan-500/20 z-40" />
      <div className="absolute bottom-0 left-0 w-8 h-8 lg:w-12 lg:h-12 border-l border-b border-cyan-500/20 z-40" />
      <div className="absolute bottom-0 right-0 w-8 h-8 lg:w-12 lg:h-12 border-r border-b border-cyan-500/20 z-40" />
    </div>
  );
};

export default Hero;