import { useEffect, useState } from "react";
import useAuthStore from "./authStore";

export default function SideBar() {
    const accessToken = useAuthStore((state) => state.accessToken)
    const [addOrg, setAddOrg] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [userCompetitors, setUserCompetitors] = useState([
        'Competitor A',
        'Competitor B',
        'Competitor C',
        'Competitor D'
    ])
    const [sources, setSources] = useState([
        'Press Releases',
        'Twitter/X',
        'Play store reviews',
        'Reddit'
    ])
    const [org, setOrg] = useState({
        name: ''
    })

    function handleCompClick() {
       //fill in page with data for that specific comp
    }
    async function handleOrgSubmit(e) {
        e.preventDefault()
        const form = e.target
        if (!form.checkValidity()) {
            form.classList.add('was-validated')
            return
        }
        setIsLoading(true)
        //make a fetch request to add competiors
        try {
            console.log('acesstoken: ', accessToken)
            const response = await fetch('http://localhost:3000/addcompetitor', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify(org)
            })
            const results = await response.json()
            if (results.error) {
                throw new Error(results.error)
            }
            //if successful reset section
            setUserCompetitors(prev => ([...prev, org.name]))
            setOrg('')
            setIsLoading(false)
            setAddOrg(false)

        } catch (err) {
            console.log('Error fetching request', err)
            setIsLoading(false)
        }
    }
    return (
        <div className="col-2 d-flex flex-column bg-secondary-subtle p-3">
            <div className="d-flex flex-column">
                <div className="mb-3">
                    <span className="fw-bold fs-5"> Tracked Competitors </span>
                    <div className="list-group mb-3">
                        {
                            userCompetitors.map((comp, index) => {
                                return (
                                    <button key={index} type="button" className="list-group-item list-group-item-action mt-3" onClick={handleCompClick}> {comp} </button>
                                )
                            })
                        }
                        {addOrg && (
                            <form className="needs-validation" onSubmit={handleOrgSubmit} noValidate>
                                <div className="mb-3">
                                    <input
                                        type="text"
                                        className="form-control mt-3"
                                        value={org.name}
                                        onChange={(e) => { setOrg({ name: e.target.value }) }}
                                        required
                                    />
                                    <div className="invalid-feedback">
                                        Please input a valid org name.
                                    </div>
                                </div>
                                <div className="row g-0 gap-2">
                                    <button type="submit" className="btn btn-primary col">
                                        {isLoading ? 'Adding...' : 'Add'}
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-danger col"
                                        onClick={() => {
                                            setAddOrg(false)
                                            setOrg('')
                                        }} >
                                        Close
                                    </button>

                                </div>
                            </form>
                        )}
                        {!addOrg && (
                            <button className="btn btn-sm btn-secondary mt-3" onClick={() => { setAddOrg(true) }}> + Add Competitor </button>
                        )}
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
                <div>
                    <span className="fw-bold fs-5"> Background Jobs </span>
                    <ul className="list-group">
                        <li className="list-group-item bg-light text-success mt-3"> Data Collection: Active</li>
                        <li className="list-group-item bg-light text-success mt-3"> Sentiment: Active </li>
                        <li className="list-group-item bg-light text-success mt-3"> Trend detection: Active </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}