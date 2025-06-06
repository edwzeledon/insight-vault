import { useState } from "react";
import TrackedCompetitors from "./TrackedCompetitors";

export default function SideBar() {
    const [sources, setSources] = useState([
        'Press Releases',
        'Twitter/X',
        'Play store reviews',
        'Reddit'
    ])
    
    function handleCompClick(e) {
        //fill in page with data for that specific comp

    }
    return (
        <div className="col-2 d-flex flex-column bg-light p-3">
            <div className="d-flex flex-column">
                <div className="mb-3">
                    <span className="fw-bold fs-5"> Tracked Competitors </span>
                    <TrackedCompetitors />
                </div>
                <div className="mb-3">
                    <span className="fw-bold fs-5"> Data Sources</span>
                    <ul className="list-group ">
                        {
                            sources.map((src, index) => {
                                return (
                                    <li key={index} className="list-group-item bg-white shadow-sm mt-3"> &#10003; {src} </li>
                                )
                            })
                        }
                    </ul>
                </div>
                <div>
                    <span className="fw-bold fs-5"> Background Jobs </span>
                    <ul className="list-group">
                        <li className="list-group-item bg-white text-success shadow-sm mt-3"> Data Collection: Active</li>
                        <li className="list-group-item bg-white text-success shadow-sm mt-3"> Sentiment: Active </li>
                        <li className="list-group-item bg-white text-success shadow-sm mt-3"> Trend detection: Active </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}