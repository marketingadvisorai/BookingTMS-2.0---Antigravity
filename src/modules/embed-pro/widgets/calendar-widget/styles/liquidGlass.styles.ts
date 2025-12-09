/**
 * Calendar Widget Pro - Liquid Glass Styles
 * @module embed-pro/widgets/calendar-widget/styles
 * 
 * Apple-inspired glassmorphism styles for premium UX
 */

export const liquidGlassStyles = `
  /* Light Mode Glass */
  .liquid-glass {
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    border: 1px solid rgba(255, 255, 255, 0.6);
    box-shadow: 
      0 8px 32px rgba(31, 38, 135, 0.15),
      inset 0 2px 20px rgba(255, 255, 255, 0.4);
  }
  
  /* Dark Mode Glass */
  .liquid-glass-dark {
    background: rgba(30, 30, 35, 0.85);
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    border: 1px solid rgba(75, 75, 85, 0.4);
    box-shadow: 
      0 8px 32px rgba(0, 0, 0, 0.4),
      inset 0 2px 20px rgba(75, 75, 85, 0.2);
  }
  
  /* Glass Buttons - Light */
  .liquid-glass-button {
    position: relative;
    background: linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.8);
    box-shadow: 
      0 4px 16px rgba(0, 0, 0, 0.1),
      inset 0 2px 8px rgba(255, 255, 255, 0.6);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  /* Glass Buttons - Dark */
  .liquid-glass-button-dark {
    position: relative;
    background: linear-gradient(135deg, rgba(55, 55, 65, 0.9) 0%, rgba(40, 40, 50, 0.8) 100%);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(100, 100, 110, 0.4);
    color: rgba(255, 255, 255, 0.9);
    box-shadow: 
      0 4px 16px rgba(0, 0, 0, 0.3),
      inset 0 2px 8px rgba(100, 100, 110, 0.2);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  /* Hover Effects */
  .liquid-glass-button:hover,
  .liquid-glass-button-dark:hover {
    transform: translateY(-2px) scale(1.02);
  }
  
  .liquid-glass-button:hover {
    box-shadow: 
      0 8px 24px rgba(0, 0, 0, 0.15),
      inset 0 2px 12px rgba(255, 255, 255, 0.8);
  }
  
  .liquid-glass-button-dark:hover {
    box-shadow: 
      0 8px 24px rgba(0, 0, 0, 0.4),
      inset 0 2px 12px rgba(120, 120, 130, 0.3);
  }
  
  /* Active States */
  .liquid-glass-button:active,
  .liquid-glass-button-dark:active {
    transform: translateY(0) scale(0.98);
  }
  
  /* Primary Button */
  .liquid-primary-button {
    position: relative;
    overflow: hidden;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  }
  
  .liquid-primary-button::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 60%);
    pointer-events: none;
  }
  
  .liquid-primary-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.25);
  }
  
  .liquid-primary-button:active {
    transform: translateY(0);
  }
`;

export default liquidGlassStyles;
