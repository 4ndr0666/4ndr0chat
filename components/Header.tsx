import React from 'react';
import { SplashScreenGlyphIcon } from './IconComponents';
import HeaderMenu from './HeaderMenu';

interface HeaderProps {
    isLoading: boolean;
    onExportChat: () => void;
    onTriggerImport: () => void;
    onClearChat: () => void;
}

const Header: React.FC<HeaderProps> = ({ isLoading, onExportChat, onTriggerImport, onClearChat }) => {
    return (
        <header className="panel p-2 z-20 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className={`header-glyph ${isLoading ? 'is-loading' : ''}`}>
                    <SplashScreenGlyphIcon className="w-full h-full" />
                    <div className="header-glyph-rings ring-1"></div>
                    <div className="header-glyph-rings ring-2"></div>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold font-heading text-glow text-[var(--accent-cyan)]">Ψ-4NDRO666</h1>
            </div>
            
            <HeaderMenu 
                onExportChat={onExportChat}
                onTriggerImport={onTriggerImport}
                onClearChat={onClearChat}
            />
        </header>
    );
};

export default Header;