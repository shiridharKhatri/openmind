'use client';

import { cn } from '@/lib/utils';

interface OpenMindMascotProps {
  size?: number;
  className?: string;
}

export function OpenMindMascot({
  size = 200,
  className,
}: OpenMindMascotProps) {
  return (
    <div
      className={cn('inline-flex items-center justify-center', className)}
      style={{ width: size, height: size }}
    >
      <video
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-full object-contain"
        style={{ mixBlendMode: 'screen' }}
      >
        <source src="/character_clean.mp4" type="video/mp4" />
      </video>
    </div>
  );
}
