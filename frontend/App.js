import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar, Platform } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  useEffect(() => {
    // Inject responsive web CSS and media queries according to requirements
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const styleId = 'nivara-responsive-css';
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = `
          /* Universal box sizing and horizontal scroll prevention */
          *, *::before, *::after {
            box-sizing: border-box;
          }

          html, body, #root {
            width: 100%;
            max-width: 100%;
            overflow-x: hidden !important;
            margin: 0;
            padding: 0;
            scroll-behavior: smooth;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }

          /* Responsive images and media */
          img, svg, video {
            max-width: 100%;
            height: auto;
            display: block;
          }

          /* Interactive elements & touch targets */
          [role="button"], button, a {
            cursor: pointer;
            touch-action: manipulation;
            user-select: none;
            -webkit-tap-highlight-color: transparent;
            transition: transform 0.18s ease, filter 0.18s ease, background-color 0.18s ease;
          }
          [role="button"]:hover, button:hover {
            filter: brightness(1.02);
          }
          [role="button"]:active, button:active {
            transform: scale(0.98);
          }

          /* ======================================================== */
          /* CSS MEDIA QUERIES (Breakpoints: 320-480, 481-768, 769-1200, 1201+) */
          /* ======================================================== */

          /* Mobile: 320px - 480px */
          @media (max-width: 480px) {
            .hide-on-mobile {
              display: none !important;
            }
            .mobile-full-width {
              width: 100% !important;
              max-width: 100% !important;
            }
            .mobile-stack {
              flex-direction: column !important;
            }
            .mobile-touch-target {
              min-height: 44px !important;
            }
          }

          /* Tablet: 481px - 768px */
          @media (min-width: 481px) and (max-width: 768px) {
            .hide-on-tablet {
              display: none !important;
            }
          }

          /* Laptop: 769px - 1200px */
          @media (min-width: 769px) and (max-width: 1200px) {
            .hide-on-laptop {
              display: none !important;
            }
          }

          /* Desktop: 1201px+ */
          @media (min-width: 1201px) {
            .hide-on-desktop {
              display: none !important;
            }
          }

          /* Gentle continuous micro-animations */
          @keyframes floatGentle {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-6px); }
            100% { transform: translateY(0px); }
          }
          .floating-card {
            animation: floatGentle 3.5s ease-in-out infinite;
          }

          @keyframes pulseBeacon {
            0% { transform: scale(0.96); opacity: 0.9; }
            50% { transform: scale(1.05); opacity: 1; }
            100% { transform: scale(0.96); opacity: 0.9; }
          }
          .pulse-beacon {
            animation: pulseBeacon 2s ease-in-out infinite;
          }
        `;
        document.head.appendChild(style);
      }
    }
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
      <AppNavigator />
    </SafeAreaProvider>
  );
}
