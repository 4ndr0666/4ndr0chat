import React, { useState, useRef, useEffect } from 'react';
import { MenuIcon, ExportIcon, ImportIcon, TrashIcon } from './IconComponents';

interface HeaderMenuProps {
    onExportChat: () => void;
    onTriggerImport: () => void;
    onClearChat: () => void;
}

const HeaderMenu: React.FC<HeaderMenuProps> = ({ onExportChat, onTriggerImport, onClearChat }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const createMenuButton = (label: string, icon: React.ReactNode, action: () => void, isDanger = false) => (
        <button
            onClick={() => {
                action();
                setIsMenuOpen(false);
            }}
            className={`attach-popover-button ${isDanger ? 'text-danger hover:!bg-[rgba(239,68,68,0.1)] hover:!text-[var(--danger-color-hover)]' : ''}`}
        >
            {icon} {label}
        </button>
    );
    
    return (
        <div className="relative" ref={menuRef}>
            <button 
                onClick={() => setIsMenuOpen(p => !p)} 
                className={`action-button ${isMenuOpen ? 'active' : ''}`}
                aria-label="Open chat menu"
            >
                <MenuIcon />
            </button>

            {isMenuOpen && (
                <div 
                    className="attach-popover !bottom-auto !left-auto top-full right-0 mt-2 !w-52"
                    style={{ transformOrigin: 'top right' }}
                >
                    {createMenuButton("Import Chat...", <ImportIcon className="w-4 h-4" />, onTriggerImport)}
                    {createMenuButton("Export Chat", <ExportIcon className="w-4 h-4" />, onExportChat)}
                    <div className="toolbar-divider my-1 !h-px w-full bg-[var(--border-color)]"></div>
                    {createMenuButton("Clear Conversation", <TrashIcon className="w-4 h-4" />, onClearChat, true)}
                </div>
            )}
        </div>
    );
};

export default HeaderMenu;
