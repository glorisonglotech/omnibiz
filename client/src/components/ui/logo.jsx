import React from 'react';

const Logo = ({ 
  size = 'md', 
  variant = 'full', 
  className = '',
  showText = true,
  animated = false 
}) => {
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
    '2xl': 'w-32 h-32'
  };

  const textSizeClasses = {
    xs: 'text-sm',
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
    '2xl': 'text-4xl'
  };

  const LogoIcon = ({ className: iconClassName = '' }) => (
    <div className={`relative ${iconClassName} ${animated ? 'animate-pulse' : ''}`}>
      {/* Main circle with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-400 via-green-500 to-green-600 rounded-full shadow-lg">
        {/* Inner highlight */}
        <div className="absolute top-1 left-1 w-3 h-3 bg-white/30 rounded-full blur-sm"></div>
      </div>
      
      {/* Business icon overlay */}
      <div className="relative flex items-center justify-center w-full h-full text-white">
        <svg 
          viewBox="0 0 24 24" 
          fill="currentColor" 
          className="w-2/3 h-2/3"
        >
          {/* Building/Business icon */}
          <path d="M12 2L2 7v10c0 5.55 3.84 10 9 11 1.16-.21 2.31-.48 3.38-.84C16.5 26.32 18.74 25.5 21 24.5V7L12 2z"/>
          <path d="M12 2v20c5.16-1 9-5.45 9-11V7L12 2z" opacity="0.7"/>
          {/* Business elements */}
          <rect x="6" y="9" width="2" height="2" fill="currentColor" opacity="0.8"/>
          <rect x="10" y="9" width="2" height="2" fill="currentColor" opacity="0.8"/>
          <rect x="14" y="9" width="2" height="2" fill="currentColor" opacity="0.8"/>
          <rect x="6" y="13" width="2" height="2" fill="currentColor" opacity="0.8"/>
          <rect x="10" y="13" width="2" height="2" fill="currentColor" opacity="0.8"/>
          <rect x="14" y="13" width="2" height="2" fill="currentColor" opacity="0.8"/>
        </svg>
      </div>
      
      {/* Outer glow effect */}
      {animated && (
        <div className="absolute -inset-1 bg-gradient-to-br from-green-400 to-green-600 rounded-full opacity-20 animate-ping"></div>
      )}
    </div>
  );

  if (variant === 'icon') {
    return <LogoIcon className={`${sizeClasses[size]} ${className}`} />;
  }

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <LogoIcon className={sizeClasses[size]} />
      {showText && (
        <div className="flex flex-col">
          <span className={`font-bold text-gray-900 dark:text-white ${textSizeClasses[size]} leading-tight`}>
            OmniBiz
          </span>
          <span className={`text-green-600 font-medium ${size === 'xs' ? 'text-xs' : size === 'sm' ? 'text-xs' : 'text-sm'} leading-tight`}>
            Business Pro
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
