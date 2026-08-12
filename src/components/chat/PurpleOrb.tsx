'use client';

export function PurpleOrb() {
  return (
    <div className="orb-container relative w-28 h-28 mx-auto mb-6">
      {/* Outer glow */}
      <div className="orb-glow absolute inset-0 rounded-full bg-lavender-400/20 blur-2xl" />
      
      {/* Ring */}
      <div className="orb-ring absolute inset-1 rounded-full border border-lavender-300/40" />
      
      {/* Main sphere */}
      <div
        className="absolute inset-2 rounded-full"
        style={{
          background:
            'radial-gradient(circle at 35% 35%, #EDE5FF 0%, #C4AAFF 30%, #B79AF7 50%, #9B7DE8 70%, #7C5DC9 100%)',
          boxShadow:
            'inset -8px -8px 20px rgba(123, 93, 201, 0.3), inset 4px 4px 12px rgba(237, 229, 255, 0.5), 0 0 40px rgba(183, 154, 247, 0.2)',
        }}
      />

      {/* Highlight reflection */}
      <div
        className="absolute top-4 left-5 w-8 h-6 rounded-full"
        style={{
          background:
            'radial-gradient(ellipse, rgba(255,255,255,0.6) 0%, transparent 70%)',
          transform: 'rotate(-20deg)',
        }}
      />
    </div>
  );
}
