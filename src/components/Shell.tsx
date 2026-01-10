"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { usePathname } from "next/navigation";
import styles from "./Shell.module.css";

export function Shell({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

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
            <div className={`${styles.sidebarContainer} ${isOpen ? styles.open : ''}`}>
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
            <main className={styles.mainContent}>
                {children}
            </main>
        </div>
    );
}
