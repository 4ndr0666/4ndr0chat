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
            // Reset height to 0 to calculate the new scrollHeight correctly.
            // This allows the CSS transition to work smoothly when shrinking.
            internalRef.current.style.height = '0px';
            const scrollHeight = internalRef.current.scrollHeight;
            
            // Set the new height.
            internalRef.current.style.height = `${scrollHeight}px`;
        }
    }, [value, props.placeholder]); // Depend on value and placeholder for accurate sizing.

    return <textarea ref={internalRef} {...props} />;
});

export default AutoResizeTextarea;