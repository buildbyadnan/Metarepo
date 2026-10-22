"use client";
import { useState, useEffect } from 'react';

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gray-900 text-white">
      {/* Resume content container with rings */}
      <div className={`container relative z-10 mx-auto px-4 py-10 transition-all duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
        <div 
          className="relative mx-auto max-w-5xl overflow-hidden shadow-2xl"
          style={{
            background: 'linear-gradient(145deg, rgba(18, 18, 18, 0.9) 0%, rgba(26, 26, 26, 0.9) 100%)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            boxShadow: `0 10px 50px -5px rgba(0, 0, 0, 0.8),
                        0 0 0 1px rgba(255, 215, 0, 0.2),
                        0 0 0 2px rgba(0, 0, 0, 0.8),
                        0 0 20px rgba(255, 215, 0, 0.3)`,
            position: 'relative',
          }}
        >
          {/* 3D border effect */}
          <div 
            className="pointer-events-none absolute inset-0"
            style={{
              borderRadius: '16px',
              boxShadow: 'inset 0 0 0 1px rgba(255, 215, 0, 0.3)',
              background: 'linear-gradient(145deg, rgba(255, 215, 0, 0.1) 0%, rgba(0, 0, 0, 0) 100%)',
              filter: 'blur(0.5px)',
              opacity: 0.7,
            }}
          />
          {/* Top-left hanging ring */}
          <div 
            className="animate-ring-sway absolute -left-6 -top-6 z-20"
            style={{
              transformOrigin: 'bottom right',
              animation: 'ringSwayTopLeft 6s infinite ease-in-out'
            }}
          >
            <div className="relative">
              <div 
                className="size-20 rounded-full border-4"
                style={{
                  borderColor: 'rgba(255, 215, 0, 0.6)',
                  boxShadow: '0 0 15px rgba(255, 215, 0, 0.4), inset 0 0 10px rgba(255, 215, 0, 0.3)',
                  transform: 'perspective(800px) rotateX(55deg) rotateZ(5deg)',
                  background: 'linear-gradient(145deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 215, 0, 0) 80%)',
                }}
              ></div>
              <div 
                className="absolute inset-0 size-20 rounded-full"
                style={{
                  boxShadow: 'inset 0 5px 10px -2px rgba(0,0,0,0.6), inset 0 -2px 8px rgba(255, 215, 0, 0.4)',
                  transform: 'perspective(800px) rotateX(55deg) rotateZ(5deg)',
                }}
              ></div>
            </div>
          </div>
          {/* Top-right hanging ring */}
          <div 
            className="absolute -right-6 -top-6 z-20"
            style={{
              transformOrigin: 'bottom left',
              animation: 'ringSwayTopRight 7s infinite ease-in-out'
            }}
          >
            <div className="relative">
              <div 
                className="size-16 rounded-full border-4"
                style={{
                  borderColor: 'rgba(255, 215, 0, 0.6)',
                  boxShadow: '0 0 15px rgba(255, 215, 0, 0.4), inset 0 0 10px rgba(255, 215, 0, 0.3)',
                  transform: 'perspective(800px) rotateX(55deg) rotateZ(-5deg)',
                  background: 'linear-gradient(145deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 215, 0, 0) 80%)',
                }}
              ></div>
              <div 
                className="absolute inset-0 size-16 rounded-full"
                style={{
                  boxShadow: 'inset 0 5px 10px -2px rgba(0,0,0,0.6), inset 0 -2px 8px rgba(255, 215, 0, 0.4)',
                  transform: 'perspective(800px) rotateX(55deg) rotateZ(-5deg)',
                }}
              ></div>
            </div>
          </div>
          {/* Bottom-left hanging ring */}
          <div 
            className="absolute -bottom-8 -left-8 z-20"
            style={{
              transformOrigin: 'top right',
              animation: 'ringSwayBottomLeft 8s infinite ease-in-out'
            }}
          >
            <div className="relative">
              <div 
                className="size-24 rounded-full border-4"
                style={{
                  borderColor: 'rgba(255, 215, 0, 0.5)',
                  boxShadow: '0 0 15px rgba(255, 215, 0, 0.3), inset 0 0 10px rgba(255, 215, 0, 0.2)',
                  transform: 'perspective(800px) rotateX(-55deg) rotateZ(-5deg)',
                  background: 'linear-gradient(145deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 215, 0, 0) 80%)',
                }}
              ></div>
              <div 
                className="absolute inset-0 size-24 rounded-full"
                style={{
                  boxShadow: 'inset 0 -5px 10px -2px rgba(0,0,0,0.6), inset 0 2px 8px rgba(255, 215, 0, 0.4)',
                  transform: 'perspective(800px) rotateX(-55deg) rotateZ(-5deg)',
                }}
              ></div>
            </div>
          </div>
          {/* Bottom-right hanging ring */}
          <div 
            className="absolute -bottom-6 -right-6 z-20"
            style={{
              transformOrigin: 'top left',
              animation: 'ringSwayBottomRight 6.5s infinite ease-in-out'
            }}
          >
            <div className="relative">
              <div 
                className="w-18 h-18 rounded-full border-4"
                style={{
                  borderColor: 'rgba(255, 215, 0, 0.5)',
                  boxShadow: '0 0 15px rgba(255, 215, 0, 0.3), inset 0 0 10px rgba(255, 215, 0, 0.2)',
                  transform: 'perspective(800px) rotateX(-45deg) rotateZ(5deg)',
                  background: 'linear-gradient(145deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 215, 0, 0) 80%)',
                  width: '72px',
                  height: '72px'
                }}
              ></div>
              <div 
                className="absolute inset-0 rounded-full"
                style={{
                  boxShadow: 'inset 0 -5px 10px -2px rgba(0,0,0,0.6), inset 0 2px 8px rgba(255, 215, 0, 0.4)',
                  transform: 'perspective(800px) rotateX(-45deg) rotateZ(5deg)',
                  width: '72px',
                  height: '72px'
                }}
              ></div>
            </div>
          </div>
          {/* Header Section */}
          <div className="relative p-8" style={{
            background: 'linear-gradient(145deg, rgba(17, 17, 17, 0.8) 0%, rgba(32, 32, 32, 0.8) 100%)',
            backdropFilter: 'blur(5px)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5), 0 1px 0 rgba(255, 215, 0, 0.3)',
          }}>
            <div className="absolute inset-0" style={{
              background: 'radial-gradient(circle at top right, rgba(255, 215, 0, 0.15) 0%, rgba(0, 0, 0, 0) 70%)',
              borderRadius: '16px 16px 0 0',
            }}></div>
            <div className="relative z-10 flex flex-col items-center justify-between md:flex-row">
              <div className={`transition-all delay-300 duration-1000${isLoaded ? 'translate-x-0 opacity-100' : '-translate-x-20 opacity-0'}`}>
                <h1 className="text-4xl font-bold" style={{
                  background: 'linear-gradient(to right, #ffd700, #ffc107, #ffd700)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
                }}>Syed Adnan Ali</h1>
                <h2 className="mt-2 text-2xl text-gray-200" style={{
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)',
                }}>Software Developer</h2>
              </div>
              <div className={`mt-6 transition-all delay-500 duration-1000 md:mt-0${isLoaded ? 'translate-x-0 opacity-100' : 'translate-x-20 opacity-0'}`}>
                <div className="mb-2 flex items-center gap-2">
                  <svg className="size-5" style={{ color: '#ffd700' }} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
                  </svg>
                  <a href="mailto:syedadnanali0106@gmail.com" className="text-gray-300 transition hover:text-yellow-300">syedadnanali0106@gmail.com</a>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="size-5" style={{ color: '#ffd700' }} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path>
                  </svg>
                  <span className="text-gray-300">+91-8290393487</span>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6 p-8 md:grid-cols-3">
            {/* Left Column - About & Education */}
            <div className="md:col-span-1">
              <div className={`mb-6 rounded-lg p-6 transition-all delay-300 duration-700${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`} style={{ 
                background: 'linear-gradient(145deg, rgba(26, 26, 26, 0.8) 0%, rgba(34, 34, 34, 0.8) 100%)',
                backdropFilter: 'blur(5px)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 215, 0, 0.1)'
              }}>
                <h3 className="mb-4 pb-2 text-xl font-semibold" style={{
                  background: 'linear-gradient(to right, #ffd700, #ffcc00)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  borderBottom: '1px solid rgba(255, 215, 0, 0.3)',
                }}>About Me</h3>
                <p className="text-sm leading-relaxed text-gray-300">
                  Skilled in deploying serverless architectures using Cloudflare Workers, combining
                  strong technical foundations with creative problem-solving to craft efficient,
                  high-impact digital solutions.
                </p>
                <p className="mt-3 text-sm leading-relaxed text-gray-300">
                  A passionate full-stack developer and founder of Electroplix, currently pursuing a
                  degree in Computer Science Engineering, with hands-on experience in building
                  scalable and dynamic end-to-end applications.
                </p>
              </div>
              <div className={`delay-400 mb-6 rounded-lg p-6 transition-all duration-700${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`} style={{ 
                background: 'linear-gradient(145deg, rgba(26, 26, 26, 0.8) 0%, rgba(34, 34, 34, 0.8) 100%)',
                backdropFilter: 'blur(5px)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 215, 0, 0.1)'
              }}>
                <h3 className="mb-4 pb-2 text-xl font-semibold" style={{
                  background: 'linear-gradient(to right, #ffd700, #ffcc00)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  borderBottom: '1px solid rgba(255, 215, 0, 0.3)',
                }}>Education</h3>
                <div className="mb-3">
                  <h4 className="font-medium text-gray-200">Bachelor Engineering in Computer Science and Engineering</h4>
                  <p className="text-sm text-gray-300">Muffakham Jah College of Engineering & Technology</p>
                  <p className="text-xs text-yellow-200/70">2024-2028</p>
                </div>
              </div>
              <div className={`mb-6 rounded-lg p-6 transition-all delay-500 duration-700${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`} style={{ 
                background: 'linear-gradient(145deg, rgba(26, 26, 26, 0.8) 0%, rgba(34, 34, 34, 0.8) 100%)',
                backdropFilter: 'blur(5px)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 215, 0, 0.1)'
              }}>
                <h3 className="mb-4 pb-2 text-xl font-semibold" style={{
                  background: 'linear-gradient(to right, #ffd700, #ffcc00)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  borderBottom: '1px solid rgba(255, 215, 0, 0.3)',
                }}>Achievements</h3>
                <div className="mb-3">
                  <h4 className="font-medium text-gray-200">TS Eapcet 2024</h4>
                  <p className="text-sm text-gray-300">Score: Top 2% · May 2024</p>
                  <p className="text-xs text-yellow-200/70">Rank 6365 out of 2,40,617</p>
                </div>
              </div>
              <div className={`delay-600 rounded-lg p-6 transition-all duration-700${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`} style={{ 
                background: 'linear-gradient(145deg, rgba(26, 26, 26, 0.8) 0%, rgba(34, 34, 34, 0.8) 100%)',
                backdropFilter: 'blur(5px)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 215, 0, 0.1)'
              }}>
                <h3 className="mb-4 pb-2 text-xl font-semibold" style={{
                  background: 'linear-gradient(to right, #ffd700, #ffcc00)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  borderBottom: '1px solid rgba(255, 215, 0, 0.3)',
                }}>Career Objective</h3>
                <p className="text-sm leading-relaxed text-gray-300">
                  Seeking a rewarding position within a dynamic organization where I can leverage my existing experience to
                  contribute effectively, while also cultivating new skills and knowledge through collaboration with professionals.
                </p>
              </div>
            </div>
            {/* Middle & Right Column - Experience & Skills */}
            <div className="md:col-span-2">
              <div className={`delay-400 mb-6 rounded-lg p-6 transition-all duration-700${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`} style={{ 
                background: 'linear-gradient(145deg, rgba(26, 26, 26, 0.8) 0%, rgba(34, 34, 34, 0.8) 100%)',
                backdropFilter: 'blur(5px)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 215, 0, 0.1)'
              }}>
                <h3 className="mb-4 pb-2 text-xl font-semibold" style={{
                  background: 'linear-gradient(to right, #ffd700, #ffcc00)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  borderBottom: '1px solid rgba(255, 215, 0, 0.3)',
                }}>Work Experience</h3>
                <div className="mb-6">
                  <div className="flex items-start justify-between">
                    <h4 className="font-medium text-gray-200">Founder & CEO</h4>
                    <span className="text-sm text-yellow-200/70">8-24 - Now</span>
                  </div>
                  <p className="text-sm text-yellow-100/90">Electroplix</p>
                  <p className="mt-2 text-sm leading-relaxed text-gray-300">
                    Building Electroplix.com, A platform with robust global network based
                    serverless infrastructure and helping businesses tap in the digital world.
                    Keeping sustainable solutions to drive business growth 📈 which are
                    secure, efficient and scalable.
                  </p>
                </div>
                <div className="mb-6">
                  <div className="flex items-start justify-between">
                    <h4 className="font-medium text-gray-200">Tech Captain</h4>
                    <span className="text-sm text-yellow-200/70">10-24 - Now</span>
                  </div>
                  <p className="text-sm text-yellow-100/90">Entrepreneurship Cell, MJCET</p>
                  <p className="mt-2 text-sm text-gray-300">Developed and refactored Web technologies</p>
                </div>
                <div className="mb-6">
                  <div className="flex items-start justify-between">
                    <h4 className="font-medium text-gray-200">Full Stack Web Developer</h4>
                    <span className="text-sm text-yellow-200/70">5-22 - 9-24</span>
                  </div>
                  <p className="text-sm text-yellow-100/90">Freelance</p>
                  <p className="mt-2 text-sm text-gray-300">Built 6+ Web Projects and Optimized website builds for businesses</p>
                </div>
                <div>
                  <div className="flex items-start justify-between">
                    <h4 className="font-medium text-gray-200">Python developer</h4>
                    <span className="text-sm text-yellow-200/70">8-22 - 10-24</span>
                  </div>
                  <p className="text-sm text-yellow-100/90">Hobby Master</p>
                  <p className="mt-2 text-sm text-gray-300">
                    Developed a complete desktop assistant with Graphical user interface.
                    Built on python and tkinter GUI, has more than 25+ features, Inspired From Iron man Jarvis.
                  </p>
                </div>
              </div>
              <div className={`rounded-lg p-6 transition-all delay-500 duration-700${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`} style={{ 
                background: 'linear-gradient(145deg, rgba(26, 26, 26, 0.8) 0%, rgba(34, 34, 34, 0.8) 100%)',
                backdropFilter: 'blur(5px)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 215, 0, 0.1)'
              }}>
                <h3 className="mb-4 pb-2 text-xl font-semibold" style={{
                  background: 'linear-gradient(to right, #ffd700, #ffcc00)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  borderBottom: '1px solid rgba(255, 215, 0, 0.3)',
                }}>Skills & Tools</h3>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {[
                    "Typescript", "Python", "Supabase", "NodeJS", 
                    "ReactJS", "Web Hosting", "NextJS", "GCP",
                    "C", "Javascript", "NeonDB", "Cloudflare",
                    "JAVA", "TailWind CSS", "Elysia JS", "Backend",
                    "HTML", "CSS", "HonoJS", "BlockhChain",
                    "BunJS", "Blender", "Video Editing", "Drizzle ORM",
                    "API Development", "Payment Gateway", "Arduino", "Jet Engine Design",
                    "MERN Stack", "Network Security", "AI Integration", "React Native"
                  ].map((skill, index) => (
                    <div 
                      key={index}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all hover:scale-105"
                      style={{ 
                        background: 'linear-gradient(145deg, rgba(26, 26, 26, 0.8) 0%, rgba(25, 25, 25, 0.8) 100%)',
                        backdropFilter: 'blur(3px)',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 215, 0, 0.1)',
                        animationDelay: `${index * 0.05}s`, 
                        animation: `fadeIn 0.5s ease-in-out ${index * 0.05}s both`,
                        color: '#e0e0e0',
                        textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 215, 0, 0.3), 0 0 10px rgba(255, 215, 0, 0.3)';
                        e.currentTarget.style.background = 'linear-gradient(145deg, rgba(34, 34, 34, 0.9) 0%, rgba(26, 26, 26, 0.9) 100%)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 215, 0, 0.1)';
                        e.currentTarget.style.background = 'linear-gradient(145deg, rgba(26, 26, 26, 0.8) 0%, rgba(25, 25, 25, 0.8) 100%)';
                      }}
                    >
                      <span className="size-2 rounded-full" style={{
                        background: 'linear-gradient(145deg, #ffd700 0%, #ffcc00 100%)',
                        boxShadow: '0 0 5px rgba(255, 215, 0, 0.5)',
                      }}></span>
                      {skill}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Global animations */}
      <style jsx global>{`
        @keyframes ringSwayTopLeft {
          0% { transform: rotate(5deg); }
          50% { transform: rotate(-2deg); }
          100% { transform: rotate(5deg); }
        }
        
        @keyframes ringSwayTopRight {
          0% { transform: rotate(-5deg); }
          50% { transform: rotate(2deg); }
          100% { transform: rotate(-5deg); }
        }
        
        @keyframes ringSwayBottomLeft {
          0% { transform: rotate(-4deg); }
          50% { transform: rotate(3deg); }
          100% { transform: rotate(-4deg); }
        }
        
        @keyframes ringSwayBottomRight {
          0% { transform: rotate(5deg); }
          50% { transform: rotate(-3deg); }
          100% { transform: rotate(5deg); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
      `}</style>
    </div>
  );
}