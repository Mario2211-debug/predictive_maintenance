'use client';

import React, { ReactNode } from 'react';

interface DashboardLayoutProps {
    children: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    return (
        <div className="flex flex-col bg-neutral-800 text-white">
            <header className="bg-neutral-900 p-4 shadow-md">
                <h1 className="text-3xl font-bold">Dashboard</h1>
            </header>
            <main className="flex-1 p-5">{children}</main>
            <footer className="bg-neutral-900 p-4 text-center">
                <p className="text-sm">&copy; 2025 Sistema de Previsão de Falhas</p>
            </footer>
        </div>
    );
};

export default DashboardLayout;
