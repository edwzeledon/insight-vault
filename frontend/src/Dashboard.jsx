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
                                    sources.map((src, index)=> {
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
                            <LineChart />
                        </div>
                        <div className="col-5 bg-secondary-subtle rounded-3 p-3">
                            <h6 className="fw-bold"> Latest Activity </h6>
                            <div className="mb-3 rounded-3 p-2 bg-white" style={{fontSize: '14px'}}>
                                <span className="fw-bold"> New Feature Launch: Virtual Assistant </span>
                                <div>
                                    <span className="text-secondary"> Press Release | May 15, 2025 </span>
                                    <p className="m-0"> AI detected: Major product strategy shift</p>
                                </div>
                            </div>
                            <div className="rounded-3 p-2 bg-white" style={{fontSize: '14px'}}>
                                <span className="fw-bold"> User complaints about login issues </span>
                                <div>
                                    <span className="text-secondary"> App store reviews | May 12-14, 2025 </span>
                                    <p className="m-0"> AI detected: Technical issue trend</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="row g-0">
                        <div className="col-7 bg-primary-subtle rounded-3 p-3">
                            <h6 className="fw-bold"> AI Analysis Summary </h6>
                            <p className="m-0"> 
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