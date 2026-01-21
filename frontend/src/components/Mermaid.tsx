import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

interface MermaidProps {
    chart: string;
    id?: string;
}

// Initialize mermaid with dark theme
mermaid.initialize({
    startOnLoad: false,
    theme: 'dark',
    themeVariables: {
        primaryColor: '#8b5cf6',
        primaryTextColor: '#f8fafc',
        primaryBorderColor: '#6366f1',
        lineColor: '#94a3b8',
        secondaryColor: '#1e293b',
        tertiaryColor: '#0f172a',
        background: '#1e293b',
        mainBkg: '#1e293b',
        secondBkg: '#334155',
        textColor: '#f8fafc',
        fontFamily: 'Inter, system-ui, sans-serif',
    },
    flowchart: {
        curve: 'basis',
        padding: 20,
    },
    er: {
        fontSize: 12,
    },
    sequence: {
        actorMargin: 50,
        boxMargin: 10,
        mirrorActors: false,
    },
});

export default function Mermaid({ chart, id }: MermaidProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const uniqueId = id || `mermaid-${Math.random().toString(36).substr(2, 9)}`;

    useEffect(() => {
        const renderChart = async () => {
            if (containerRef.current) {
                containerRef.current.innerHTML = '';
                try {
                    const { svg } = await mermaid.render(uniqueId, chart);
                    if (containerRef.current) {
                        containerRef.current.innerHTML = svg;
                    }
                } catch (error) {
                    console.error('Mermaid render error:', error);
                    if (containerRef.current) {
                        containerRef.current.innerHTML = `<pre style="color: #ef4444; font-size: 0.8rem;">${chart}</pre>`;
                    }
                }
            }
        };

        renderChart();
    }, [chart, uniqueId]);

    return (
        <div
            ref={containerRef}
            style={{
                display: 'flex',
                justifyContent: 'center',
                padding: 'var(--space-lg)',
                background: 'var(--color-bg-tertiary)',
                borderRadius: 'var(--radius-lg)',
                overflow: 'auto',
            }}
        />
    );
}
