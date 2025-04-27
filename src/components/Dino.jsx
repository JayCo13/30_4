import React from 'react';

const Dino = ({ isJumping, jumpHeight }) => {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: `${jumpHeight}px`,
        width: '130px',
        height: '130px',
        backgroundImage: 'url(/dino.gif)',
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        transition: 'none' // Remove transition for smoother physics
      }}
    />
  );
};

export default Dino;