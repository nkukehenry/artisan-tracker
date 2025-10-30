"use client";
import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface ChartLineProps {
    data: { day: string; count: number }[];
    label?: string;
}

export default function ChartLine({ data, label = 'Count' }: ChartLineProps) {
    const labels = data.map(d => d.day);
    const labelsShort = labels.map((s) => {
        const dt = new Date(s);
        if (isNaN(dt.getTime())) return s; // fallback if not parseable
        return dt.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    });
    const values = data.map(d => d.count);

    const chartData = {
        labels: labelsShort,
        datasets: [
            {
                label,
                data: values,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59,130,246,0.2)',
                tension: 0.3,
                pointRadius: 2.5,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: { display: false },
            tooltip: {
                enabled: true,
                callbacks: {
                    title: (items: any[]) => {
                        const idx = items?.[0]?.dataIndex ?? 0;
                        return labels[idx] || '';
                    },
                },
            },
            title: { display: false, text: '' },
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: {
                    autoSkip: true,
                    maxRotation: 0,
                    minRotation: 0,
                },
            },
            y: { grid: { color: '#e5e7eb' }, beginAtZero: true },
        },
    } as const;

    return (
        <div className="w-full">
            <Line data={chartData} options={options} />
        </div>
    );
}


