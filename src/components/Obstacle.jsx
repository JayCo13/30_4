import React, { useEffect, useState } from 'react';

const Obstacle = ({ position, height, type }) => {
  const [obstacleType, setObstacleType] = useState(type || 'bomb');
  
  useEffect(() => {
    if (type) {
      setObstacleType(type);
    } else {
      const types = ['bomb', 'mine'];
      const randomType = types[Math.floor(Math.random() * types.length)];
      setObstacleType(randomType);
    }
  }, [type]);
  
  const getObstacleImage = () => {
    switch(obstacleType) {
      case 'bomb':
        return '/bomb.png';
      case 'mine':
        return '/mine.png';
      default:
        return '/bomb.png';
    }
  };

  const getDimensions = () => {
    switch(obstacleType) {
      case 'bomb':
        return {
          width: '60px',
          height: '120px'
        };
      case 'mine':
        return {
          width: '70px',
          height: '50px'
        };
      default:
        return {
          width: '60px',
          height: '120px'
        };
    }
  };
  
  const dimensions = getDimensions();
  
  return (
    <div
      style={{
        position: 'absolute',
        padding: '0',
        borderRadius: '15%',
        bottom: '0',
        left: `${position - 10}px`,
        width: dimensions.width,
        height: dimensions.height,
        backgroundImage: `url(${getObstacleImage()})`,
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        transition: 'none'
      }}
    />
  );
};

export default Obstacle;