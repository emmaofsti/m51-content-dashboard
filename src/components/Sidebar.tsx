"use client";

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import styles from './Sidebar.module.css';

export function Sidebar() {
    const pathname = usePathname();
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        if (pathname.startsWith('/nettsideinnhold') || pathname.startsWith('/rapport') || pathname.startsWith('/historikk')) {
            setIsExpanded(true);
        } else {
            setIsExpanded(false);
        }
    }, [pathname]);

    return (
        <aside className={styles.sidebar}>
            <div className={styles.logoContainer}>
                <Image
                    src="/m51-logo.png"
                    alt="M51 Logo"
                    width={40}
                    height={40}
                    priority
                    style={{ objectFit: 'contain' }}
                />
            </div>
            <nav className={styles.nav}>
                {/* Nettsideinnhold Parent Item */}
                {/* Nettsideinnhold Parent Item - Toggle Only */}
                <div
                    onClick={() => setIsExpanded(!isExpanded)}
                    className={`${styles.link} ${isExpanded ? styles.active : ''}`}
                    style={{ cursor: 'pointer', justifyContent: 'space-between' }}
                >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        Nettsideinnhold
                    </span>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{
                            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.2s ease'
                        }}
                    >
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                </div>

                {isExpanded && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', marginTop: '-0.2rem', paddingLeft: '1rem' }}>
                        <Link
                            href="/nettsideinnhold"
                            className={`${styles.subLink} ${pathname === '/nettsideinnhold' ? styles.active : ''}`}
                        >
                            Oversikt
                        </Link>
                        <Link
                            href="/rapport"
                            className={`${styles.subLink} ${pathname === '/rapport' ? styles.active : ''}`}
                        >
                            Rapport
                        </Link>
                        <Link
                            href="/historikk"
                            className={`${styles.subLink} ${pathname === '/historikk' ? styles.active : ''}`}
                        >
                            Historikk
                        </Link>
                    </div>
                )}
            </nav>
        </aside>
    );
}
