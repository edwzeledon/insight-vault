import { useState } from "react";

import Navbar from "./Navbar";
import LineChart from "./LineChart";

export default function Dashboard() {
    const [comp, setcomp] = useState([
        'Competitor A',
        'Competitor B',
        'Competitor C',
        'Competitor D'
    ])
    const [sources, setSources] = useState([
        'App store reviews',
        'Twitter/X',
        'Reddit'
    ])
    const [topics, setTopics] = useState([
        {
            title: 'AI Integeration',
            category: 'Product/Innovation',
            source: 'Press Release',
            link: '#'
        },
        {
            title: 'Restructuring',
            category: 'Operations',
            source: 'Twitter/X',
            link: '#'
        },
        {
            title: 'Customer Churn',
            category: 'Market Signals',
            source: 'Reddit',
            link: '#'
        },
        {
            title: 'Restructuring',
            category: 'Operations',
            source: 'Twitter/X',
            link: '#'
        },
    ])
    const [changes, setChanges] = useState([
        {
            title: 'Partnership with CloudTech',
            impact: 'Expanded market reach',
            date: 'May 15'
        },
        {
            title: 'Pricing increase %15',
            impact: 'Customer churn risk',
            date: 'May 10'
        },
        {
            title: 'New VP of product hired',
            impact: 'Potential strategy shift',
            date: 'April 22'
        }
    ])

    function handleCompClick() {

    }

    return (
        <div className="d-flex flex-column min-vh-100">
            <Navbar />
            <div className="row g-0 d-flex flex-grow-1">
                <div className="col-2 d-flex flex-column bg-secondary-subtle p-3">
                    <div className="d-flex flex-column">
                        <div className="mb-3">
                            <span className="fw-bold fs-5"> Tracked Competitors </span>
                            <div className="list-group mb-3">
                                {
                                    comp.map((comp, index) => {
                                        return (
                                            <button key={index} type="button" className="list-group-item list-group-item-action mt-3" onClick={handleCompClick}> {comp} </button>
                                        )
                                    })
                                }
                                <button className="btn btn-sm btn-secondary mt-3"> + Add Competitor </button>
                            </div>

                        </div>
                        <div className="mb-3">
                            <span className="fw-bold fs-5"> Data Sources</span>
                            <ul className="list-group ">
                                {
                                    sources.map((src, index) => {
                                        return (
                                            <li key={index} className="list-group-item bg-light mt-3"> &#10003; {src} </li>
                                        )
                                    })
                                }
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="col-10 p-3">
                    <h2 className="fs-3 fw-bold mb-3"> Competitor B | Dashboard </h2>
                    <div className="mb-3 row g-0 gap-3">
                        <div className="col-3 rounded-3 bg-secondary-subtle p-3">
                            <h6 className="fw-bold mb-0"> Product Updates </h6>
                            <div className="fs-3 fw-bold mb-1">
                                8
                                <span className="text-success ms-2" style={{ fontSize: '18px' }}> &uarr; 3 </span>
                            </div>
                            <p className="m-0 text-secondary"> Last update: 2 days ago </p>
                        </div>
                        <div className="col-3 rounded-3 bg-secondary-subtle p-3">
                            <h6 className="fw-bold mb-0"> Average Sentiment </h6>
                            <div className="fs-3 fw-bold mb-1">
                                7.8/10
                                <span className="text-danger ms-2" style={{ fontSize: '18px' }}> &darr; 0.5 </span>
                            </div>
                            <p className="m-0 text-secondary"> Across all sources</p>
                        </div>
                        <div className="col-3 rounded-3 bg-secondary-subtle p-3">
                            <h6 className="fw-bold mb-0"> Customer Issues </h6>
                            <div className="fs-3 fw-bold mb-1">
                                24
                                <span className="text-danger ms-2" style={{ fontSize: '18px' }}> &uarr; 7 </span>
                            </div>
                            <p className="m-0 text-secondary"> App store + Social media </p>
                        </div>
                    </div>
                    <div className="row g-0 gap-3 mb-3">
                        <div className="col-6 bg-secondary-subtle rounded-3 p-3">
                            <h6 className="fw-bold"> Sentiment Trends </h6>
                            <div className="container bg-white rounded-3 py-2">
                                <LineChart />
                            </div>
                        </div>
                        <div className="col-5 bg-secondary-subtle rounded-3 p-3">
                            <h6 className="fw-bold"> Latest Activity </h6>
                            <div className="mb-3 rounded-3 p-2 bg-white" style={{ fontSize: '14px' }}>
                                <span className="fw-bold"> New Feature Launch: Virtual Assistant </span>
                                <div>
                                    <span className="text-secondary"> Press Release | May 15, 2025 </span>
                                    <p className="m-0"> AI detected: Major product strategy shift</p>
                                </div>
                            </div>
                            <div className="mb-3 rounded-3 p-2 bg-white" style={{ fontSize: '14px' }}>
                                <span className="fw-bold"> User complaints about login issues </span>
                                <div>
                                    <span className="text-secondary"> App store reviews | May 12-14, 2025 </span>
                                    <p className="m-0"> AI detected: Technical issue trend</p>
                                </div>
                            </div>
                            <div className="rounded-3 p-2 bg-white" style={{ fontSize: '14px' }}>
                                <span className="fw-bold"> User complaints about login issues </span>
                                <div>
                                    <span className="text-secondary"> App store reviews | May 12-14, 2025 </span>
                                    <p className="m-0"> AI detected: Technical issue trend</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="row g-0 gap-3 mb-3">
                        <div className="col-6 rounded-3 p-3 bg-secondary-subtle">
                            <h6 className="fw-bold"> Stategic Topics</h6>
                            <div className="row g-0" style={{ fontSize: '14px' }}>
                                {
                                    topics.map((topic, index) => {
                                        return (
                                            <div key={index} className="col-12 bg-white p-2 mb-2 border-start border-success border-5 rounded-end d-flex justify-content-between align-items-center">
                                                <span className="fw-bold"> {topic.title}</span>
                                                <span> {topic.category} </span>
                                                <span className="d-flex align-items-center">
                                                    {topic.source}
                                                    <a href={topic.link} target="_blank" className="btn btn-primary btn-sm rounded-circle ms-2"> &rarr; </a>
                                                </span>
                                            </div>
                                        )
                                    })
                                }
                                <div className="col-12 mt-1 d-flex justify-content-end">
                                    <a href="#" className="link-primary text-decoration-none">4 more topics &rarr;</a>
                                </div>
                            </div>
                        </div>
                        <div className="col-5 rounded-3 p-3 bg-secondary-subtle">
                            <h6 className="fw-bold"> Strategic Changes</h6>
                            <div className="row g-0" style={{ fontSize: '14px' }}>
                                {
                                    changes.map((change, index) => {
                                        return (
                                            <div key={index} className="col-12 bg-white p-2 mb-2 border-start border-success border-5 rounded-end align-items-center">
                                                <div className="d-flex justify-content-between">
                                                    <span className="fw-bold"> {change.title}</span>
                                                    <span> {change.date} </span>
                                                </div>
                                                <div className="d-flex align-items-center">
                                                    Impact: {change.impact}
                                                </div>
                                            </div>
                                        )
                                    })
                                }
                                <div className="col-12 mt-1 d-flex justify-content-end">
                                    <a href="#" className="link-primary text-decoration-none">View all &rarr;</a>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="row g-0">
                        <div className="col-11 bg-primary-subtle rounded-3 p-3">
                            <h6 className="fw-bold"> AI Analysis Summary </h6>
                            <p className="m-0 col-8">
                                Competitor B appears to be pivoting toward an AI-first strategy with their latest product update.
                                Their price increase has caused negative sentiment, but new features have been well-received.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}