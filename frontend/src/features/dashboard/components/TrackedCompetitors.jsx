import { useEffect, useState } from "react";
import useAuthStore from "../../../stores/AuthStore";

export default function TrackedCompetitors() {
    const accessToken = useAuthStore((state) => state.accessToken)
    const [activeIndex, setActiveIndex] = useState(0);
    const [showOrgInput, setShowOrgInput] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [userCompetitors, setUserCompetitors] = useState([])
    const [org, setOrg] = useState('')

    useEffect(() => {
        if (!accessToken) return
        const getUserCompetitors = async () => {
            try {
                const response = await fetch('http://localhost:3000/getUserCompetitors', {
                    headers: {
                        "Authorization": `Bearer ${accessToken}`
                    }
                })
                if (response.ok) {
                    const results = await response.json()
                    setUserCompetitors(results.organizations)
                }
            } catch (err) {
                console.log('Error fetching user competitors', err)
            }
        }
        getUserCompetitors()
    }, [accessToken])

    function format(str) {
        if (!str) return ''
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
    }
    async function handleOrgSubmit(e) {
        e.preventDefault()
        const form = e.target
        if (!form.checkValidity()) {
            form.classList.add('was-validated')
            return
        }
        console.log(userCompetitors)
        setIsLoading(true)
        const formatted = { name: format(org) }
        //make a fetch request to add competiors
        try {
            const response = await fetch('http://localhost:3000/addcompetitor', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify(formatted)
            })
            const results = await response.json()
            if (results.error) {
                throw new Error(results.error)
            }
            //if successful reset section
            if (!userCompetitors.some((org) => org.name === formatted.name)) {
                setUserCompetitors(prev => ([...prev, { name: formatted.name, org_id: results.org_id }]))
            }
            setOrg('')
            setIsLoading(false)
            setShowOrgInput(false)

        } catch (err) {
            console.log('Error fetching request', err)
            setIsLoading(false)
        }
    }
    async function handleOrgDelete(orgId) {
        try {
            const response = await fetch(`http://localhost:3000/userCompetitors/${orgId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            })
            const results = await response.json()
            if (results.error) {
                throw new Error(results.error)
            }
            //filter out the array
            const orgs = userCompetitors.filter((org) => org.org_id !== orgId)
            setUserCompetitors(orgs)
        } catch (err) {
            console.log('Error fetching delete endpoint', err)
        }
    }
    function handleCompClick() {
        //fill in page with data for that specific comp

    }

    return (
        <div className="list-group mb-3">
            {
                userCompetitors.map((comp, index) => {
                    return (
                        <button
                            key={comp.org_id}
                            type="button"
                            className={`list-group-item list-group-item-action mt-3 d-flex justify-content-between ${index === activeIndex ? 'active' : '' }`}
                            onClick={(e) => {
                                setActiveIndex(index)
                                handleCompClick()
                            }}
                        >
                            {comp.name}
                            <span
                                role="button"
                                tabIndex="0"
                                className="btn-close"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (confirm('Are you sure you want to remove this organization from your tracked competitors?')) {
                                        handleOrgDelete(comp.org_id)
                                    }
                                }}
                            ></span>
                        </button>
                    )
                })
            }
            {showOrgInput && (
                <form className="needs-validation" onSubmit={handleOrgSubmit} noValidate>
                    <div className="mb-3">
                        <input
                            type="text"
                            className="form-control mt-3"
                            value={org}
                            onChange={(e) => { setOrg(e.target.value) }}
                            required
                        />
                        <div className="invalid-feedback">
                            Please input a valid org name.
                        </div>
                    </div>
                    <div className="row g-0 gap-2">
                        <button type="submit" className="btn btn-secondary col">
                            {isLoading ? 'Adding...' : 'Add'}
                        </button>
                        <button
                            type="button"
                            className="btn btn-dark col"
                            onClick={() => {
                                setShowOrgInput(false)
                                setOrg('')
                            }} >
                            Close
                        </button>

                    </div>
                </form>
            )}
            {!showOrgInput && (
                <button className="btn btn-sm btn-secondary mt-3" onClick={() => { setShowOrgInput(true) }}> + Add Competitor </button>
            )}
        </div>
    );
}