import { useEffect, useState } from 'react';

interface Leaf {
  id: number;
  x: number;
  size: number;
  delay: number;
  duration: number;
  rotation: number;
}

export default function FloatingLeaves() {
  const [leaves, setLeaves] = useState<Leaf[]>([]);

  useEffect(() => {
    const generatedLeaves: Leaf[] = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 95,
      size: Math.random() * 16 + 12,
      delay: Math.random() * 8,
      duration: Math.random() * 12 + 14,
      rotation: Math.random() * 360,
    }));
    setLeaves(generatedLeaves);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-10 overflow-hidden" aria-hidden="true">
      {leaves.map((leaf) => (
        <div
          key={leaf.id}
          className="absolute text-[#94a388]/20"
          style={{
            left: `${leaf.x}%`,
            top: '-50px',
            animation: `leaf-drift ${leaf.duration}s linear infinite`,
            animationDelay: `${leaf.delay}s`,
          }}
        >
          <svg
            width={leaf.size}
            height={leaf.size * 1.5}
            viewBox="0 0 24 36"
            fill="currentColor"
            style={{ transform: `rotate(${leaf.rotation}deg)` }}
          >
            <path d="M12 0C12 0 24 10 24 22C24 29.732 18.627 36 12 36C5.373 36 0 29.732 0 22C0 10 12 0 12 0ZM12 4.5C8.5 10 3 17 3 22C3 27.5 7 32 12 32C17 32 21 27.5 21 22C21 17 15.5 10 12 4.5Z" />
            <path d="M12 6V30" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
          </svg>
        </div>
      ))}
    </div>
  );
}
