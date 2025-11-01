import React from 'react';
import { Attachment, TextAttachment } from '../types';
import { LinkIcon, PaperclipIcon } from './IconComponents';

interface AttachmentPreviewProps {
    attachments: Attachment[];
    onClearAttachments: () => void;
}

const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

const SingleAttachmentPreview: React.FC<{ attachment: Attachment; onClear: () => void; }> = ({ attachment, onClear }) => {
    let previewContent: React.ReactNode;
    let title: string;
    let subtitle: string | null = null;

    switch(attachment.type) {
        case 'image':
            previewContent = (
                <img 
                    src={`data:${attachment.mimeType};base64,${attachment.base64}`} 
                    alt={attachment.file.name}
                    className="w-10 h-10 object-cover rounded flex-shrink-0 border border-black/20"
                />
            );
            title = attachment.file.name;
            subtitle = formatFileSize(attachment.file.size);
            break;
        case 'text':
            previewContent = (
                <div className="w-10 h-10 flex items-center justify-center bg-black/20 rounded flex-shrink-0 border border-black/30">
                    <PaperclipIcon className="w-5 h-5 text-accent-cyan" />
                </div>
            );
            title = attachment.file.name;
            subtitle = `${formatFileSize(attachment.file.size)} - ${attachment.file.type}`;
            break;
        case 'url':
            previewContent = (
                <div className="w-10 h-10 flex items-center justify-center bg-black/20 rounded flex-shrink-0 border border-black/30">
                    <LinkIcon className="w-5 h-5 text-accent-cyan" />
                </div>
            );
            title = attachment.url;
            subtitle = "Web page context";
            break;
        default:
            return null;
    }
     return (
        <div className="flex items-center justify-between bg-panel-accent-bg border border-border-color rounded-lg p-2 mb-2 animate-message-in">
            <div className="flex items-center gap-3 overflow-hidden">
                {previewContent}
                <div className="overflow-hidden">
                    <p className="text-sm text-text-primary font-medium truncate" title={title}>{title}</p>
                    {subtitle && (
                        <p className="text-xs text-text-tertiary truncate">{subtitle}</p>
                    )}
                </div>
            </div>
            <button 
                onClick={onClear} 
                className="action-button !p-1 ml-2 flex-shrink-0" 
                aria-label="Remove attachment"
            >
                <span className="text-2xl leading-none font-light" aria-hidden="true">&times;</span>
            </button>
        </div>
    );
};


const AttachmentPreview: React.FC<AttachmentPreviewProps> = ({ attachments, onClearAttachments }) => {
    if (attachments.length === 0) {
        return null;
    }
    
    if (attachments.length === 1) {
        return <SingleAttachmentPreview attachment={attachments[0]} onClear={onClearAttachments} />
    }

    const totalSize = attachments.reduce((sum, a) => {
        return sum + (a as TextAttachment).file.size;
    }, 0);

    return (
        <div className="flex items-center justify-between bg-panel-accent-bg border border-border-color rounded-lg p-2 mb-2 animate-message-in">
            <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 flex items-center justify-center bg-black/20 rounded flex-shrink-0 border border-black/30">
                    <PaperclipIcon className="w-5 h-5 text-accent-cyan" />
                </div>
                <div className="overflow-hidden">
                    <p className="text-sm text-text-primary font-medium truncate">{attachments.length} text files attached</p>
                    {totalSize > 0 && <p className="text-xs text-text-tertiary truncate">Total size: {formatFileSize(totalSize)}</p>}
                </div>
            </div>
            <button 
                onClick={onClearAttachments} 
                className="action-button !p-1 ml-2 flex-shrink-0" 
                aria-label="Remove all attachments"
            >
                <span className="text-2xl leading-none font-light" aria-hidden="true">&times;</span>
            </button>
        </div>
    );
};

export default AttachmentPreview;