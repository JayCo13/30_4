import React, { useState, useEffect, useRef } from 'react';
import Dino from './Dino';
import Obstacle from './Obstacle';
import gameConfig from '../config/gameConfig';
import '../styles/gameBackground.css';
import tankImage from '../assets/tank-img.png';
import video from '../assets/video.MOV';
import '../styles/timeReverse.css'; // Import for time-reverse animation
import warfareSound from '../assets/warfare.mp3'; // Add this import

const GameWorld = () => {
  const [isJumping, setIsJumping] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [obstacles, setObstacles] = useState([]);
  const [dinoY, setDinoY] = useState(0);
  const [jumpVelocity, setJumpVelocity] = useState(0);
  const [obstacleTypes, setObstacleTypes] = useState({});
  const [showTank, setShowTank] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [tankPosition, setTankPosition] = useState(window.innerWidth);
  
  // New states for freeze-frame and time-reverse effects
  const [freezeFrame, setFreezeFrame] = useState(false);
  const [timeReverse, setTimeReverse] = useState(false);
  const [gameSnapshot, setGameSnapshot] = useState(null);
  
  const videoRef = useRef(null);
  const jumpSoundRef = useRef(null);
  const warfareSoundRef = useRef(null); // Add this ref
  const [config, setConfig] = useState(gameConfig.getConfig());
  
  
  
  // Initialize audio on component mount
  useEffect(() => {
    jumpSoundRef.current = new Audio('/sounds/jump.mp3');
    jumpSoundRef.current.volume = 0.8; // Set jump sound volume to 30%
    warfareSoundRef.current = new Audio(warfareSound);
    warfareSoundRef.current.loop = true; // Make the warfare sound loop
    
    // Enable for mobile
    document.addEventListener('touchstart', () => {
      if (jumpSoundRef.current) {
        jumpSoundRef.current.load();
        jumpSoundRef.current.volume = 0.3; // Ensure volume is set after loading
      }
      if (warfareSoundRef.current) {
        warfareSoundRef.current.load();
      }
    }, { once: true });

    // Cleanup function to stop sounds when component unmounts
    return () => {
      if (warfareSoundRef.current) {
        warfareSoundRef.current.pause();
        warfareSoundRef.current.currentTime = 0;
      }
      if (jumpSoundRef.current) {
        jumpSoundRef.current.pause();
        jumpSoundRef.current.currentTime = 0;
      }
    };
  }, []);

  // Add effect to handle warfare sound based on game state
  useEffect(() => {
    if (warfareSoundRef.current) {
      if (gameStarted && !gameOver && !showVideo) {
        warfareSoundRef.current.play().catch(e => console.log("Warfare audio play failed:", e));
      } else {
        warfareSoundRef.current.pause();
        warfareSoundRef.current.currentTime = 0;
      }
    }
  }, [gameStarted, gameOver, showVideo]);

  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setDinoY(0);
    setJumpVelocity(0);
    setIsJumping(false);
    setObstacleTypes({});
    setShowTank(false);
    setShowVideo(false);
    setFreezeFrame(false);
    setTimeReverse(false);
    setGameSnapshot(null);
    setTankPosition(window.innerWidth);
    // Remove the warfare sound play from here since it's handled by the effect
    setObstacles([
      { 
        id: 1, 
        position: window.innerWidth,
        height: config.obstacleHeight,
        scored: false,
        type: Math.random() > 0.5 ? 'bomb' : 'mine'
      }
    ]);
  };
  
  const handleJump = () => {
    if (!isJumping && gameStarted && !gameOver) {
      setIsJumping(true);
      setJumpVelocity(config.jumpVelocity);
      
      // Play jump sound
      if (jumpSoundRef.current) {
        jumpSoundRef.current.currentTime = 0; // Reset sound to beginning
        jumpSoundRef.current.play().catch(e => console.log("Audio play failed:", e));
      }
    }
  };

  // Handle jumping physics with config
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const jumpInterval = setInterval(() => {
      if (isJumping) {
        setDinoY(prev => {
          const newY = prev + jumpVelocity;
          if (newY <= 0) {
            setIsJumping(false);
            setJumpVelocity(0);
            return 0;
          }
          return newY;
        });
        setJumpVelocity(prev => prev - config.gravity);
      }
    }, 16);

    return () => clearInterval(jumpInterval);
  }, [isJumping, gameStarted, gameOver, jumpVelocity, config.gravity]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (!gameStarted && !gameOver) {
          startGame();
        } else {
          handleJump();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameStarted, gameOver, handleJump, startGame]);
  // Main game loop - using config values
  useEffect(() => {
    if (!gameStarted || gameOver || freezeFrame || timeReverse) return;
    
    let scoreIncremented = false;
    
    const gameLoop = setInterval(() => {
      scoreIncremented = false;
      
      // Check for score 30
      if (score === 30 && !showTank) {
        setShowTank(true);
        setObstacles([]); // Remove all obstacles
        setTankPosition(window.innerWidth - 200); // Position tank at right edge
      }

      if (!showTank) {
        setObstacles(prevObstacles => {
          // Move obstacles with config-based speed
          const updatedObstacles = prevObstacles.map(obstacle => {
            const speedIncrease = Math.floor(score / 10) * config.obstacleSpeedIncrease;
            const newPosition = obstacle.position - (config.obstacleSpeed + speedIncrease);
            const justPassed = newPosition <= 50 && obstacle.position > 50;
            
            if (justPassed && !obstacle.scored && !scoreIncremented) {
              scoreIncremented = true;
              setTimeout(() => {
                setScore(s => s + 1);
              }, 0);
            }

            return {
              ...obstacle,
              position: newPosition,
              scored: obstacle.scored || justPassed
            };
          }).filter(obstacle => obstacle.position > -50);

          // Generate new obstacles with config-based spacing
          const lastObstacle = updatedObstacles[updatedObstacles.length - 1];
          if (lastObstacle && 
              lastObstacle.position < window.innerWidth - (config.minObstacleSpacing + Math.random() * config.maxRandomSpacing)) {
            return [
              ...updatedObstacles,
              { 
                id: Date.now(),
                position: window.innerWidth,
                height: config.obstacleHeight + Math.random() * config.obstacleHeightVariation,
                scored: false,
                type: Math.random() > 0.5 ? 'bomb' : 'mine'
              }
            ];
          }

          return updatedObstacles;
        });
        
        const dinoPosition = { 
          x: 50, // Adjusted to match visual position
          y: dinoY, 
          width: 60, // Adjusted to match actual visible dino area
          height: 60  // Adjusted to match actual visible dino area
        };
        
        const collision = obstacles.some(obstacle => {
          // Get dimensions based on obstacle type
          let obstacleWidth, obstacleHeight;
          
          if (obstacle.type === 'bomb') {
            obstacleWidth = 100; // Reduced from 120 to match visible area
            obstacleHeight = 120; // Adjusted to match visible area
          } else { // mine
            obstacleWidth = 100; // Reduced from 70 to match visible area
            obstacleHeight = 50; // Reduced from 70 to match visible area
          }
          
          const obstaclePosition = { 
            x: obstacle.type === 'bomb' 
              ? obstacle.position - 20  // Offset for bomb
              : obstacle.position - 5, // Offset for mine
            y: 0, 
            width: obstacleWidth,
            height: obstacleHeight
          };
          
          // Improved collision detection with more accurate hitboxes
          if (obstacle.type === 'bomb') {
            // For bombs, check collision with a more accurate hitbox
            const horizontalCollision = 
              dinoPosition.x + 50 < obstaclePosition.x + obstacleWidth &&
              dinoPosition.x + dinoPosition.width - 50 > obstaclePosition.x;
              
            const verticalCollision = 
              dinoPosition.y < obstaclePosition.height &&
              dinoPosition.y + dinoPosition.height > 0;

            return horizontalCollision && verticalCollision;
          } else {
            // For mines, use a more accurate hitbox
            return (
              dinoPosition.x + 30 < obstaclePosition.x + obstaclePosition.width - 10 &&
              dinoPosition.x + dinoPosition.width - 30 > obstaclePosition.x + 10 &&
              dinoPosition.y < obstaclePosition.height 
            );
          }
        });
        
        if (collision) {
          setGameOver(true);
        }
      } else {
        // Move tank towards dino
        setTankPosition(prev => {
          const newPosition = prev - 4; // Move tank left by 4 pixels each frame
          
          const dinoPosition = { 
            x: 50,
            y: dinoY,
            width: 60,
            height: 60
          };
          
          const tankHitbox = {
            x: newPosition + 40, // Offset to match visual center of tank
            y: 0,
            width: 120, // Increased to match tank's visual width
            height: 200 // Match tank's visual height
          };
          
          const horizontalCollision = 
            dinoPosition.x < tankHitbox.x + tankHitbox.width &&
            dinoPosition.x + dinoPosition.width > tankHitbox.x;
            
          const verticalCollision = 
            dinoPosition.y < tankHitbox.height;
          
          if (horizontalCollision && verticalCollision && !freezeFrame && !timeReverse && !showVideo) {
            // Capture the current game state for the freeze-frame
            setGameSnapshot({
              dinoPosition: { x: 50, y: dinoY },
              tankPosition: newPosition
            });
            
            // Trigger freeze-frame effect
            setFreezeFrame(true);
            
            // After a delay, start the time-reverse animation
            setTimeout(() => {
              setFreezeFrame(false);
              setTimeReverse(true);
              
              // After time-reverse animation completes, show the video
              setTimeout(() => {
                setTimeReverse(false);
                setShowVideo(true);
                if (videoRef.current) {
                  videoRef.current.play().catch(e => console.log("Video play failed:", e));
                }
              }, 1500); // Time-reverse animation duration
            }, 1000); // Freeze-frame duration
          }
          
          return newPosition;
        });
      }
    }, 16);
    
    return () => clearInterval(gameLoop);
  }, [gameStarted, gameOver, isJumping, obstacles, score, dinoY, config, showTank, showVideo, freezeFrame, timeReverse]);
  
  return (
    <div 
      className="game-world" 
      style={{ 
        width: '100%',
        height: '60vh',
        maxHeight: '600px',
        position: 'relative',
        overflow: 'hidden',
        touchAction: 'none',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)'
      }}
      onClick={() => {
        if (gameStarted && !gameOver) {
          handleJump();
        }
      }}
      onTouchStart={() => {
        if (gameStarted && !gameOver) {
          handleJump();
        }
      }}
    >
      {/* Score Display */}
      {gameStarted && !showVideo && (
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          color: '#FFD700',
          fontSize: 'clamp(20px, 4vw, 24px)',
          fontWeight: 'bold',
          textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
          padding: '10px 20px',
          background: 'rgba(0, 0, 0, 0.5)',
          borderRadius: '10px',
          zIndex: 1000
        }}>
          Ngày {score}/4/1975
        </div>
      )}

      {/* Start Game Dialog */}
      {!gameStarted && !gameOver && score < 30 && (
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#000',
            borderRadius: '10px',
            borderTop: '3px solid rgba(255, 217, 0, 0.52)',
            zIndex: 1000
          }}
        >
          <div style={{
            width: '100%',
            height: 'calc(100% - 80px)', // Leave space for button
            position: 'relative',
            
          }}>
            <img 
              src="/bg-dino.png"
              alt="Start Background"
              style={{
                marginTop: '10px',
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                objectPosition: 'center'
              }}
            />
          </div>
          
          <div style={{
            width: '100%',
            height: '80px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.8)'
          }}>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                startGame();
              }}
              style={{
                marginTop: '15px',
                padding: '15px 30px',
                fontSize: '20px',
                fontFamily: '-apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji"',
                cursor: 'pointer',
                backgroundColor: 'rgba(200, 0, 0, 0.8)',
                color: 'white',
                border: '2px solid #FFD700',
                borderRadius: '5px',
                boxShadow: '0 4px 8px rgba(0,0,0,0.4)',
                textTransform: 'uppercase',
                fontWeight: 'bold',
                position: 'relative',
                zIndex: 2
              }}
            >
              Chiến đấu!
            </button>
          </div>
        </div>
      )}
      <div className="battlefield-elements" />
      <div className="ground" />
      <Dino isJumping={isJumping} jumpHeight={dinoY} />
      
      {obstacles.map(obstacle => (
        <Obstacle 
          key={obstacle.id} 
          position={obstacle.position}
          height={obstacle.height}
          type={obstacle.type}
        />
      ))}
      
      {showTank && !showVideo && (
        <div 
          style={{
            position: 'absolute',
            bottom: 0,
            left: `${tankPosition}px`,
            width: '300px',
            height: '200px', // Reduced height to match tank's actual size
            display: 'flex',
            alignItems: 'flex-end', // Align tank to bottom
            transition: 'left 0.016s linear'
          }}
        >
          {/* Thêm dòng chữ phía trên xe tăng */}
          <div style={{
            position: 'absolute',
            top: '-50px',
            width: '100%',
            textAlign: 'center',
            color: 'white',
            fontSize: '18px',
            fontWeight: 'bold',
            textShadow: '0 0 5px red, 0 0 10px orange',
            animation: 'pulse 1.5s infinite',
            zIndex: 100
          }}>
            Nhảy vào xe tăng tiến vào Dinh Độc Lập!
          </div>
          
          {/* Thêm hiệu ứng ánh sáng xung quanh xe tăng */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: '10%',
            width: '80%',
            height: '100%',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,215,0,0.6) 0%, rgba(255,0,0,0.3) 50%, rgba(0,0,0,0) 70%)',
            filter: 'blur(15px)',
            animation: 'glow 2s infinite alternate',
            zIndex: 1
          }}></div>
          
          <img 
           src={tankImage}
            alt="Victory Tank"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              objectPosition: 'bottom', // Align image to bottom
              position: 'relative',
              zIndex: 10,
              filter: 'drop-shadow(0 0 10px gold)'
            }}
          />
        </div>
      )}
      
      
      
      {/* Time Reverse Animation */}
      {timeReverse && (
        <div className="time-reverse-effect">
          <div style={{
            color: 'white',
            fontSize: '24px',
            fontWeight: 'bold',
            position: 'relative',
            zIndex: 1502,
            textShadow: '0 0 10px rgba(255, 215, 0, 0.8)'
          }}>
            Vào Xe Tăng...
          </div>
        </div>
      )}
      
      {/* Video Display */}
      {showVideo && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'black',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 2000
          }}
        >
          <video
            ref={videoRef}
            src={video}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              border: '1px solid white',
              objectFit: 'contain'
            }}
            autoPlay
            playsInline
            onEnded={() => {
              setShowVideo(false);
              setGameStarted(false);
              setGameOver(false);
            }}
          />
        </div>
      )}

      {/* Victory Dialog - Show when video ends */}
      {!showVideo && !gameStarted && !gameOver && score >= 30 && (
        <div 
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(28, 28, 28, 0.95) 0%, rgba(45, 45, 45, 0.95) 100%)',
            padding: '20px',
            borderRadius: '20px',
            boxShadow: '0 0 40px rgba(255, 215, 0, 0.3), 0 8px 32px rgba(0, 0, 0, 0.4)',
            border: '2px solid rgba(255, 215, 0, 0.3)',
            zIndex: 1000,
            width: '90%',
            maxWidth: '400px',
            backdropFilter: 'blur(10px)',
            animation: 'fadeInScale 0.5s ease-out'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ 
            fontSize: 'clamp(24px, 6vw, 36px)', 
            color: '#FFD700', 
            marginBottom: '15px',
            textShadow: '0 0 10px rgba(255, 215, 0, 0.5), 0 0 20px rgba(255, 215, 0, 0.3)',
            fontWeight: 'bold',
            letterSpacing: '2px',
            animation: 'pulseText 2s infinite'
          }}>
            CHIẾN THẮNG!
          </div>
          <div style={{ 
            fontSize: 'clamp(16px, 4vw, 20px)', 
            marginBottom: '20px',
            color: '#fff',
            lineHeight: '1.5',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
          }}>
            Đồng chí đã hoàn thành xuất sắc nhiệm vụ!<br/>
            Húc thêm một lần nữa chứ?
          </div>
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              startGame();
            }}
            style={{
              padding: 'clamp(10px, 3vw, 15px) clamp(20px, 6vw, 40px)',
              fontSize: 'clamp(16px, 4vw, 20px)',
              cursor: 'pointer',
              background: 'linear-gradient(45deg, #ff4e50, #f9d423)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              boxShadow: '0 4px 15px rgba(255, 78, 80, 0.4)',
              transition: 'all 0.3s ease',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              position: 'relative',
              overflow: 'hidden',
              width: 'fit-content',
              margin: '0 auto'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 78, 80, 0.6)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 78, 80, 0.4)';
            }}
          >
            Tiến Lên!
          </button>
        </div>
      )}

      {/* Add these animations to your existing styles */}
      <style>
        {`
          @keyframes fadeInScale {
            from {
              opacity: 0;
              transform: translate(-50%, -50%) scale(0.9);
            }
            to {
              opacity: 1;
              transform: translate(-50%, -50%) scale(1);
            }
          }
          
          @keyframes pulseText {
            0% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.05);
            }
            100% {
              transform: scale(1);
            }
          }
        `}
      </style>
      {/* Game Over Dialog - Only show when gameOver is true AND video is not showing */}
    

      {/* Victory Dialog - Show when video ends */}
      {!showVideo && !gameStarted && !gameOver && score >= 30 && (
        <div 
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(28, 28, 28, 0.95) 0%, rgba(45, 45, 45, 0.95) 100%)',
            padding: '20px',
            borderRadius: '20px',
            boxShadow: '0 0 40px rgba(255, 215, 0, 0.3), 0 8px 32px rgba(0, 0, 0, 0.4)',
            border: '2px solid rgba(255, 215, 0, 0.3)',
            zIndex: 1000,
            width: '90%',
            maxWidth: '400px',
            backdropFilter: 'blur(10px)',
            animation: 'fadeInScale 0.5s ease-out'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ 
            fontSize: 'clamp(24px, 6vw, 36px)', 
            color: '#FFD700', 
            marginBottom: '15px',
            textShadow: '0 0 10px rgba(255, 215, 0, 0.5), 0 0 20px rgba(255, 215, 0, 0.3)',
            fontWeight: 'bold',
            letterSpacing: '2px',
            animation: 'pulseText 2s infinite'
          }}>
            CHIẾN THẮNG!
          </div>
          <div style={{ 
            fontSize: 'clamp(16px, 4vw, 20px)', 
            marginBottom: '20px',
            color: '#fff',
            lineHeight: '1.5',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
          }}>
            Đồng chí đã hoàn thành xuất sắc nhiệm vụ!<br/>
            Húc thêm một lần nữa chứ?
          </div>
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              startGame();
            }}
            style={{
              padding: 'clamp(10px, 3vw, 15px) clamp(20px, 6vw, 40px)',
              fontSize: 'clamp(16px, 4vw, 20px)',
              cursor: 'pointer',
              background: 'linear-gradient(45deg, #ff4e50, #f9d423)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              boxShadow: '0 4px 15px rgba(255, 78, 80, 0.4)',
              transition: 'all 0.3s ease',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              position: 'relative',
              overflow: 'hidden',
              width: 'fit-content',
              margin: '0 auto'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 78, 80, 0.6)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 78, 80, 0.4)';
            }}
          >
            Tiến Lên!
          </button>
        </div>
      )}

      {/* Add these animations to your existing styles */}
      <style>
        {`
          @keyframes fadeInScale {
            from {
              opacity: 0;
              transform: translate(-50%, -50%) scale(0.9);
            }
            to {
              opacity: 1;
              transform: translate(-50%, -50%) scale(1);
            }
          }
          
          @keyframes pulseText {
            0% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.05);
            }
            100% {
              transform: scale(1);
            }
          }
        `}
      </style>
      {/* Game Over Dialog - Only show when gameOver is true AND video is not showing */}
      {gameOver && !showVideo && score < 30 && (
        <div 
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(252, 145, 145, 0.95) 0%, rgba(178, 34, 34, 0.95) 100%)',
            padding: '20px',
            borderRadius: '20px',
            boxShadow: '0 0 40px rgba(255, 0, 0, 0.3), 0 8px 32px rgba(0, 0, 0, 0.4)',
            border: '2px solid rgba(255, 0, 0, 0.3)',
            zIndex: 1000,
            minWidth: '324px',
            backdropFilter: 'blur(10px)',
            animation: 'fadeInScale 0.5s ease-out'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ 
            fontSize: '32px', 
            color: '#FFD700', 
            marginBottom: '25px',
            textShadow: '0 0 10px rgba(255, 215, 0, 0.5), 0 0 20px rgba(255, 215, 0, 0.3)',
            fontWeight: 'bold',
            letterSpacing: '2px',
            animation: 'pulseText 2s infinite'
          }}>
            Các đồng chí!
          </div>
          <div style={{ 
            fontSize: '20px', 
            marginBottom: '30px',
            color: 'black',
            fontWeight: 'bold',
            lineHeight: '1.8',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
          }}>
            Ngày {score}/4/1975 rồi, bom đạn không thể cản bước chúng ta được<br/>
            cố lên, tiến lên phía trước!
          </div>
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              startGame();
            }}
            style={{
              padding: '15px 40px',
              fontSize: '20px',
              cursor: 'pointer',
              background: 'linear-gradient(45deg, #d4af37, #ffd700)',
              color: '#8b0000',
              border: 'none',
              borderRadius: '12px',
              boxShadow: '0 4px 15px rgba(255, 215, 0, 0.4)',
              transition: 'all 0.3s ease',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 215, 0, 0.6)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 215, 0, 0.4)';
            }}
          >
            Tiếp tục chiến đấu
          </button>
        </div>
      )}
    </div>
  );
};

export default GameWorld;