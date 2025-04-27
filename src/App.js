import React from 'react';
import GameWorld from './components/GameWorld';
import Lottie from 'lottie-react';
import flagData from './assets/flag.json';
import './App.css';

function App() {
  return (
    <div className="App" style={{ 
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: 'black',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Flags */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none'
      }}>
        {[...Array(5)].map((_, index) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              left: `${Math.random() * 80}%`, // Random horizontal position
              width: '150px',
              height: '150px',
              animation: `flagDrop 8s linear infinite`,
              animationDelay: `${index * 1.5}s`, // Staggered delays
              opacity: 0 // Start invisible
            }}
          >
            <Lottie
              animationData={flagData}
              loop={true}
              autoplay={true}
            />
          </div>
        ))}
      </div>

      <div style={{ 
        marginBottom: '30px', 
        color: '#FFD700',
        textAlign: 'center',
        textShadow: '2px 2px 4px rgba(255, 0, 0, 0.3)',
        fontFamily: '-apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji"',
        animation: 'titleGlow 3s ease-in-out infinite',
        position: 'relative',
        zIndex: 1
      }}>
        <h1 style={{ 
          fontSize: '2.3em',
          marginBottom: '10px',
          fontWeight: 'bold',
          position: 'relative',
          animation: 'titleWave 2s ease-in-out infinite',
          background: 'linear-gradient(45deg, #FFD700, #FFA500)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          filter: 'drop-shadow(2px 2px 4px rgba(255, 0, 0, 0.5))'
        }}>
          50 năm giải phóng miền Nam
        </h1>
        <div style={{ 
          fontSize: '1.3em',
          color: '#fff',
          fontWeight: '500',
          animation: 'fadeInOut 4s ease-in-out infinite',
          textShadow: '0 0 10px rgba(255, 255, 255, 0.5)'
        }}>
          30/04/1975 - 30/04/2025
        </div>
      </div>
      <GameWorld />

      <style>
        {`
          @keyframes titleGlow {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.02); }
          }
          
          @keyframes titleWave {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-3px); }
          }
          
          @keyframes fadeInOut {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }

          @keyframes flagDrop {
            0% {
              transform: translateY(-150px);
              opacity: 1;
            }
            90% {
              opacity: 1;
            }
            100% {
              transform: translateY(100vh);
              opacity: 0;
            }
          }
        `}
      </style>
    </div>
  );
}

export default App;
