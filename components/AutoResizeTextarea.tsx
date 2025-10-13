import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';

type AutoResizeTextareaProps = React.DetailedHTMLProps<
    React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    HTMLTextAreaElement
>;

const AutoResizeTextarea = forwardRef<HTMLTextAreaElement, AutoResizeTextareaProps>((props, ref) => {
    const internalRef = useRef<HTMLTextAreaElement>(null);
    const { value } = props;

    // This exposes the internal textarea DOM node to the parent component via the ref
    useImperativeHandle(ref, () => internalRef.current!, []);

    useEffect(() => {
        if (internalRef.current) {
            internalRef.current.style.height = 'auto'; // Reset height to shrink if text is deleted
            const scrollHeight = internalRef.current.scrollHeight;
            internalRef.current.style.height = `${scrollHeight}px`;
        }
    }, [value]);

    return <textarea ref={internalRef} {...props} />;
});

export default AutoResizeTextarea;