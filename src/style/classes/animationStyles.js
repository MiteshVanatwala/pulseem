export const getAnimationStyle = (windowSize, isRTL, theme) => ({
  '@keyframes flickerAndFade': {
    '0%': {
      opacity: 0.5,
    },
    '100%': {
      opacity: 1
    }
  },
  flickering: {
    animation: '$flickerAndFade 0.2s infinite alternate',
    animationFillMode: 'forwards'
  },
  smoothEnd: {
    animation: '$flickerAndFade .5s forwards',
    animationIterationCount: '1',
    animationTimingFunction: 'ease-out'
  }
})