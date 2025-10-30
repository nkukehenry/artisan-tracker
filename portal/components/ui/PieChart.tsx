"use client";
import React from 'react';

type PieDatum = { label: string; value: number; color?: string };

interface PieChartProps {
    data: PieDatum[];
    size?: number;
    thickness?: number;
    colors?: string[];
    legend?: boolean;
}

export default function PieChart({ data, size = 160, thickness = 18, colors, legend = true }: PieChartProps) {
    const total = data.reduce((sum, d) => sum + d.value, 0);
    const radius = size / 2;
    const innerRadius = radius - thickness;
    let cumulative = 0;

    const palette = colors || [
        '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f472b6', '#fb7185', '#a3e635'
    ];

    const renderData = total > 0 ? data : [{ label: 'No data', value: 1 }];
    const slices = renderData.map((d, i) => {
        const value = total > 0 ? d.value : 1;
        const startAngle = (cumulative / (total || 1)) * 2 * Math.PI;
        const angle = (value / (total || 1)) * 2 * Math.PI;
        const endAngle = startAngle + angle;
        cumulative += value;

        const largeArc = angle > Math.PI ? 1 : 0;
        const x0 = radius + innerRadius * Math.cos(startAngle);
        const y0 = radius + innerRadius * Math.sin(startAngle);
        const x1 = radius + innerRadius * Math.cos(endAngle);
        const y1 = radius + innerRadius * Math.sin(endAngle);
        const x2 = radius + radius * Math.cos(endAngle);
        const y2 = radius + radius * Math.sin(endAngle);
        const x3 = radius + radius * Math.cos(startAngle);
        const y3 = radius + radius * Math.sin(startAngle);

        const pathData = [
            `M ${x0} ${y0}`,
            `A ${innerRadius} ${innerRadius} 0 ${largeArc} 1 ${x1} ${y1}`,
            `L ${x2} ${y2}`,
            `A ${radius} ${radius} 0 ${largeArc} 0 ${x3} ${y3}`,
            'Z',
        ].join(' ');

        const color = d.color || palette[i % palette.length];

        return <path key={`${d.label}-${i}`} d={pathData} fill={color} stroke="#ffffff" strokeWidth={1} />;
    });

    return (
        <div className="flex items-start gap-4">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-label="Pie chart">
                <g>{slices}</g>
                {thickness > 0 && (
                    <circle cx={radius} cy={radius} r={Math.max(0, innerRadius)} fill="white" />
                )}
            </svg>
            {legend && (
                <div className="space-y-2">
                    {renderData.map((d, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                            <span
                                className="inline-block w-3 h-3 rounded"
                                style={{ backgroundColor: d.color || palette[i % palette.length] }}
                            />
                            <span className="font-medium">{d.label}</span>
                            <span className="text-gray-500">{total > 0 ? d.value : 0}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}


