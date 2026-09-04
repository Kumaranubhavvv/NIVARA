import { useWindowDimensions } from 'react-native';

/**
 * Standard Breakpoints according to requirements:
 * Mobile: 320px–480px
 * Tablet: 481px–768px
 * Laptop: 769px–1200px
 * Desktop: 1200px+
 */
export const BREAKPOINTS = {
  mobileMax: 480,
  tabletMin: 481,
  tabletMax: 768,
  laptopMin: 769,
  laptopMax: 1200,
  desktopMin: 1201,
};

/**
 * Custom Hook for responsive design across all devices
 */
export function useResponsive() {
  const { width, height } = useWindowDimensions();

  const isMobile = width <= BREAKPOINTS.mobileMax;
  const isTablet = width >= BREAKPOINTS.tabletMin && width <= BREAKPOINTS.tabletMax;
  const isLaptop = width >= BREAKPOINTS.laptopMin && width <= BREAKPOINTS.laptopMax;
  const isDesktop = width >= BREAKPOINTS.desktopMin;

  const isTouchDevice = isMobile || isTablet;

  // Responsive padding & gutters
  const gutter = isMobile ? 12 : isTablet ? 20 : isLaptop ? 28 : 36;
  const containerMaxWidth = isDesktop ? 1280 : isLaptop ? 1080 : '100%';

  // Dynamic typography clamp helper
  const clampFont = (min, preferred, max) => {
    if (width <= 360) return min;
    if (width <= BREAKPOINTS.mobileMax) return Math.min(preferred * 0.9, max);
    if (width <= BREAKPOINTS.tabletMax) return Math.min(preferred * 1.0, max);
    if (width <= BREAKPOINTS.laptopMax) return Math.min(preferred * 1.1, max);
    return Math.max(preferred * 1.15, min);
  };

  return {
    width,
    height,
    isMobile,
    isTablet,
    isLaptop,
    isDesktop,
    isTouchDevice,
    gutter,
    containerMaxWidth,
    clampFont,
  };
}

export default useResponsive;
