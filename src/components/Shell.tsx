"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { usePathname } from "next/navigation";
import styles from "./Shell.module.css";

export function Shell({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    // Initialize based on screen size (client-side only)
    useEffect(() => {
        const checkScreen = () => {
            if (window.innerWidth > 1024) {
                setIsOpen(true);
            } else {
                setIsOpen(false);
            }
        };

        // Check on mount
        checkScreen();

        // Optional: Listen for resize if we want dynamic adaptation
        // window.addEventListener('resize', checkScreen);
        // return () => window.removeEventListener('resize', checkScreen);
    }, []);

    // Bypass shell layout for login page
    if (pathname?.startsWith('/login')) {
        return <>{children}</>;
    }

    return (
        <div className={styles.shell}>
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={styles.toggleButton}
                aria-label="Toggle menu"
            >
                {isOpen ? "✕" : "☰"}
            </button>

            {/* Sidebar */}
            <div className={`${styles.sidebarContainer} ${isOpen ? styles.open : styles.closed}`}>
                <Sidebar />
            </div>

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className={styles.overlay}
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Main Content */}
            <main className={`${styles.mainContent} ${!isOpen ? styles.closed : ''}`}>
                {children}
            </main>
        </div>
    );
}
