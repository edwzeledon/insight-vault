import { useState } from "react";
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    LineElement,
    CategoryScale,
    LinearScale,
    TimeScale,
    PointElement,
    Tooltip,
    Legend,
    Title,
} from 'chart.js';

import 'chartjs-adapter-date-fns';

ChartJS.register(
    LineElement,
    CategoryScale,
    LinearScale,
    TimeScale,
    PointElement,
    Tooltip,
    Legend,
    Title
);

export default function LineChart() {
    const [chartData, setChartData] = useState({
        datasets: [
            {
                data: [
                    { x: '2025-06-10', y: 4.9 },
                    { x: '2025-06-11', y: 5.3 },
                    { x: '2025-06-12', y: 6.0 },
                    { x: '2025-06-13', y: 6.6 },
                    { x: '2025-06-14', y: 7.2 },
                    { x: '2025-06-15', y: 7.5 },
                    { x: '2025-06-16', y: 8.1 },
                    { x: '2025-06-17', y: 8.6 },
                    { x: '2025-06-18', y: 8.9 },
                    { x: '2025-06-19', y: 9.2 },
                    { x: '2025-06-20', y: 8.4 },
                    { x: '2025-06-21', y: 7.9 },
                    { x: '2025-06-22', y: 7.3 }
                ],
                borderColor: '#3498db',
                backgroundColor: '#cfe2ff',
                pointRadius: 5,
                pointHoverRadius: 6,
                tension: 0.2
            },
        ]
    })
    return (
        <>
            <div className="col-12">
                <Line
                    data={chartData}
                    options={{
                        plugins: {
                            legend: {
                                display: false
                            }
                        },
                        scales: {
                            x: {
                                type: 'time',
                                time: {
                                    unit: 'day',
                                    tooltipFormat: 'MMM dd',
                                    displayFormats: {
                                        day: 'MMM dd',
                                    },
                                },
                                title: {
                                    display: true,
                                    text: 'Date'
                                }
                            },
                            y: {
                                title: {
                                    display: true,
                                    text: 'value'
                                }
                            }
                        },
                    }}
                />
            </div>
        </>
    );
}