// Game configuration for different screen sizes
const gameConfig = {
  // Base settings for all devices
  base: {
    gravity: 0.8,
    jumpVelocity: 17,
    obstacleSpeed: 5,
    obstacleSpeedIncrease: 0.5, // Speed increase per 10 points
    minObstacleSpacing: 400,
    maxRandomSpacing: 300,
    obstacleHeight: 30,
    obstacleHeightVariation: 20,
  },
  
  // Mobile-specific overrides
  mobile: {
    obstacleSpeedIncrease: 0.6, // Slower speed increase on mobile
    minObstacleSpacing: 300,    // Closer obstacles
    maxRandomSpacing: 200,      // Less random variation
  },
  
  // Get the appropriate config based on screen size
  getConfig: () => {
    const isMobile = window.innerWidth < 768;
    return {
      ...gameConfig.base,
      ...(isMobile ? gameConfig.mobile : {})
    };
  }
};

export default gameConfig;