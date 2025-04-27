import React, { useState, useEffect } from 'react';

const Ground = ({ speed }) => {
  const [position, setPosition] = useState(0);
  
  useEffect(() => {
    const moveGround = () => {
      setPosition(prev => (prev - speed) % 20);
    };
    
    const interval = setInterval(moveGround, 16);
    return () => clearInterval(interval);
  }, [speed]);
  
  return (
    <div
      style={{
        position: 'absolute',
        bottom: '0',
        left: '0',
        width: '100%',
        height: '2px',
        backgroundColor: '#333',
        backgroundImage: 'linear-gradient(90deg, #333 50%, transparent 50%)',
        backgroundSize: '20px 2px',
        backgroundPosition: `${position}px 0`,
      }}
    />
  );
};

export default Ground;