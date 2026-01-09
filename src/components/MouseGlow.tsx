"use client";

import { useEffect, useState } from 'react';

export function MouseGlow() {
    const [position, setPosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMove = (e: MouseEvent) => {
            // Using requestAnimationFrame for smoother performance if needed, 
            // but direct state update is usually fine for simple use cases.
            // Adding a slight delay/smoothing logic could be done with CSS transition.
            setPosition({ x: e.clientX, y: e.clientY });
        };

        window.addEventListener('mousemove', handleMove);
        return () => window.removeEventListener('mousemove', handleMove);
    }, []);

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                pointerEvents: 'none',
                zIndex: -1,
                background: 'var(--background)',
                overflow: 'hidden',
            }}
        >
            <div
                style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    transform: `translate(${position.x}px, ${position.y}px) translate(-50%, -50%)`,
                    width: '600px',
                    height: '600px',
                    background: 'radial-gradient(circle, rgba(189, 237, 98, 0.04) 0%, rgba(255, 59, 63, 0.02) 40%, rgba(0,0,0,0) 70%)',
                    borderRadius: '50%',
                    filter: 'blur(100px)',
                    transition: 'transform 0.4s cubic-bezier(0.2, 0, 0.2, 1)',
                    willChange: 'transform'
                }}
            />
        </div>
    );
}
