import React from 'react';

export interface CountryFlagProps {
  countryId?: string; // 'team-1', 'team-2', etc.
  countryCode?: string; // 'us', 'cn', 'in', 'jp', 'fr', 'gb'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  rounded?: 'none' | 'sm' | 'md' | 'full';
}

const sizeClasses = {
  xs: 'w-4 h-3',
  sm: 'w-5 h-3.5',
  md: 'w-6 h-4',
  lg: 'w-8 h-5.5',
  xl: 'w-10 h-7',
};

const roundedClasses = {
  none: 'rounded-none',
  sm: 'rounded-xs',
  md: 'rounded-sm',
  full: 'rounded-full',
};

export const CountryFlag: React.FC<CountryFlagProps> = ({
  countryId,
  countryCode,
  size = 'md',
  className = '',
  rounded = 'sm',
}) => {
  // Normalize key
  let code = (countryCode || '').toLowerCase();
  if (!code && countryId) {
    const map: Record<string, string> = {
      'team-1': 'us',
      'team-2': 'cn',
      'team-3': 'in',
      'team-4': 'jp',
      'team-5': 'fr',
      'team-6': 'gb',
    };
    code = map[countryId] || 'earth';
  }

  const baseClasses = `inline-block shrink-0 shadow-xs border border-white/20 overflow-hidden select-none align-middle ${sizeClasses[size]} ${roundedClasses[rounded]} ${className}`;

  switch (code) {
    case 'us':
      // USA Flag: 13 stripes + Blue canton with stars
      return (
        <svg
          className={baseClasses}
          viewBox="0 0 741 390"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* 13 Stripes */}
          <rect width="741" height="390" fill="#B22234" />
          <rect y="30" width="741" height="30" fill="#FFFFFF" />
          <rect y="90" width="741" height="30" fill="#FFFFFF" />
          <rect y="150" width="741" height="30" fill="#FFFFFF" />
          <rect y="210" width="741" height="30" fill="#FFFFFF" />
          <rect y="270" width="741" height="30" fill="#FFFFFF" />
          <rect y="330" width="741" height="30" fill="#FFFFFF" />

          {/* Blue Canton */}
          <rect width="296.4" height="210" fill="#3C3B6E" />

          {/* Stars Grid Pattern */}
          <g fill="#FFFFFF">
            {[0, 1, 2, 3, 4].map((row) =>
              [0, 1, 2, 3, 4, 5].map((col) => (
                <circle
                  key={`star-main-${row}-${col}`}
                  cx={25 + col * 49}
                  cy={20 + row * 42}
                  r="7"
                />
              ))
            )}
            {[0, 1, 2, 3].map((row) =>
              [0, 1, 2, 3, 4].map((col) => (
                <circle
                  key={`star-alt-${row}-${col}`}
                  cx={49.5 + col * 49}
                  cy={41 + row * 42}
                  r="6.5"
                />
              ))
            )}
          </g>
        </svg>
      );

    case 'cn':
      // China Flag: Red field with 5 golden stars
      return (
        <svg
          className={baseClasses}
          viewBox="0 0 900 600"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="900" height="600" fill="#EE1C25" />
          {/* Main Large Star */}
          <polygon
            fill="#FFDE00"
            points="150,55 178,141 268,141 195,194 223,280 150,227 77,280 105,194 32,141 122,141"
          />
          {/* 4 Small Stars pointing towards main star */}
          <polygon
            fill="#FFDE00"
            transform="translate(300, 60) rotate(23.04)"
            points="0,-30 8.8,-9.3 30,-9.3 12.9,3.1 19.4,24.3 0,11.3 -19.4,24.3 -12.9,3.1 -30,-9.3 -8.8,-9.3"
          />
          <polygon
            fill="#FFDE00"
            transform="translate(360, 120) rotate(45.87)"
            points="0,-30 8.8,-9.3 30,-9.3 12.9,3.1 19.4,24.3 0,11.3 -19.4,24.3 -12.9,3.1 -30,-9.3 -8.8,-9.3"
          />
          <polygon
            fill="#FFDE00"
            transform="translate(360, 210) rotate(69.95)"
            points="0,-30 8.8,-9.3 30,-9.3 12.9,3.1 19.4,24.3 0,11.3 -19.4,24.3 -12.9,3.1 -30,-9.3 -8.8,-9.3"
          />
          <polygon
            fill="#FFDE00"
            transform="translate(300, 270) rotate(20.66)"
            points="0,-30 8.8,-9.3 30,-9.3 12.9,3.1 19.4,24.3 0,11.3 -19.4,24.3 -12.9,3.1 -30,-9.3 -8.8,-9.3"
          />
        </svg>
      );

    case 'in':
      // India Flag: Saffron, White, Green tricolor with Ashoka Chakra
      return (
        <svg
          className={baseClasses}
          viewBox="0 0 900 600"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="900" height="200" fill="#FF9933" />
          <rect y="200" width="900" height="200" fill="#FFFFFF" />
          <rect y="400" width="900" height="200" fill="#138808" />
          {/* Ashoka Chakra Wheel */}
          <g transform="translate(450, 300)" stroke="#000080" fill="none">
            <circle r="80" strokeWidth="12" />
            <circle r="18" fill="#000080" />
            {[...Array(24)].map((_, i) => (
              <line
                key={i}
                x1="0"
                y1="0"
                x2={74 * Math.cos((i * 15 * Math.PI) / 180)}
                y2={74 * Math.sin((i * 15 * Math.PI) / 180)}
                strokeWidth="4"
              />
            ))}
          </g>
        </svg>
      );

    case 'jp':
      // Japan Flag: White field with Red Disc (Hinomaru)
      return (
        <svg
          className={baseClasses}
          viewBox="0 0 900 600"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="900" height="600" fill="#FFFFFF" />
          <circle cx="450" cy="300" r="180" fill="#BC002D" />
        </svg>
      );

    case 'fr':
      // France Flag: Blue, White, Red vertical tricolor
      return (
        <svg
          className={baseClasses}
          viewBox="0 0 900 600"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="300" height="600" fill="#002654" />
          <rect x="300" width="300" height="600" fill="#FFFFFF" />
          <rect x="600" width="300" height="600" fill="#ED2939" />
        </svg>
      );

    case 'gb':
      // UK Flag: Union Jack
      return (
        <svg
          className={baseClasses}
          viewBox="0 0 600 300"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Blue field */}
          <rect width="600" height="300" fill="#012169" />

          {/* White Saltire (St Andrew) */}
          <line x1="0" y1="0" x2="600" y2="300" stroke="#FFFFFF" strokeWidth="60" />
          <line x1="600" y1="0" x2="0" y2="300" stroke="#FFFFFF" strokeWidth="60" />

          {/* Red Saltire (St Patrick) */}
          <line x1="0" y1="0" x2="600" y2="300" stroke="#C8102E" strokeWidth="20" />
          <line x1="600" y1="0" x2="0" y2="300" stroke="#C8102E" strokeWidth="20" />

          {/* White Cross backing */}
          <rect x="250" y="0" width="100" height="300" fill="#FFFFFF" />
          <rect x="0" y="100" width="600" height="100" fill="#FFFFFF" />

          {/* Red St George Cross */}
          <rect x="270" y="0" width="60" height="300" fill="#C8102E" />
          <rect x="0" y="120" width="600" height="60" fill="#C8102E" />
        </svg>
      );

    default:
      // Earth / Global fallback
      return (
        <svg
          className={baseClasses}
          viewBox="0 0 100 60"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="100" height="60" fill="#1E3A8A" />
          <circle cx="50" cy="30" r="22" fill="#10B981" />
          <circle cx="38" cy="24" r="8" fill="#3B82F6" opacity="0.6" />
        </svg>
      );
  }
};
