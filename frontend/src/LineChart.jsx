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
                    { x: '2025-05-24', y: 5 },
                    { x: '2025-05-25', y: 7 },
                    { x: '2025-05-26', y: 6.5 },
                    { x: '2025-05-27', y: 8 },
                    { x: '2025-05-28', y: 8.5 },
                ],
                borderColor: '#0d6efd',
                backgroundColor: '#cfe2ff',
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