"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { usePathname } from "next/navigation";

export function Shell({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    // Bypass shell layout for login page
    if (pathname?.startsWith('/login')) {
        return <>{children}</>;
    }

    return (
        <div style={{ minHeight: "100vh" }}>
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    position: "fixed",
                    top: "4rem",
                    left: "1rem",
                    zIndex: 200,
                    background: "var(--background)",
                    border: "1px solid rgba(0,0,0,0.1)",
                    borderRadius: "8px",
                    padding: "0.5rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 2px 5px rgba(0,0,0,0.05)"
                }}
            >
                {isOpen ? "✕" : "☰"}
            </button>

            {/* Sidebar */}
            <div
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    height: "100vh",
                    width: "250px", // Explicit width for transform
                    transform: isOpen ? "translateX(0)" : "translateX(-100%)",
                    transition: "transform 0.3s ease",
                    zIndex: 100,
                }}
            >
                <Sidebar />
            </div>

            {/* Main Content */}
            <div
                style={{
                    transition: "margin-left 0.3s ease",
                    marginLeft: isOpen ? "250px" : "0", // Push content when open
                    paddingTop: "4rem", // Space for the toggle button
                    paddingLeft: "2rem",
                    paddingRight: "2rem"
                }}
            >
                {children}
            </div>

            {/* Overlay for mobile (optional, but good for UX) */}
            {isOpen && (
                <div
                    onClick={() => setIsOpen(false)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.2)',
                        zIndex: 90,
                        display: 'none' // Hidden for now, simplified to Push layout
                    }}
                />
            )}
        </div>
    );
}
