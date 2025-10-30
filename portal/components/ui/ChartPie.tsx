"use client";
import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface ChartPieProps {
    data: { label: string; value: number }[];
}

export default function ChartPie({ data }: ChartPieProps) {
    const labels = data.length > 0 ? data.map(d => d.label) : ['No data'];
    const values = data.length > 0 ? data.map(d => d.value) : [1];
    const colors = [
        '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f472b6', '#fb7185', '#a3e635'
    ];

    const chartData = {
        labels,
        datasets: [
            {
                data: values,
                backgroundColor: labels.map((_, i) => colors[i % colors.length]),
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: { position: 'right' as const },
            tooltip: { enabled: true },
        },
    };

    return (
        <div className="w-full">
            <Pie data={chartData} options={options} />
        </div>
    );
}


