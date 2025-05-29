import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import useAuthStore from "./authStore"


export default function Register() {
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const [registerData, setRegisterData] = useState({
        fname: '',
        email: '',
        password: ''
    })
    const setAccessToken = useAuthStore((state) => state.setAccessToken)

    function handleChange(e) {
        const { name, value } = e.target
        setRegisterData(prev => ({ ...prev, [name]: value }))
    }

    async function handleSubmit(e) {
        e.preventDefault()
        const form = e.target
        if (!form.checkValidity()) {
            form.classList.add('was-validated')
            return
        }

        setIsLoading(true)

        try {
            const response = await fetch('http://localhost:4000/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(registerData)
            })
            const results = await response.json()
            if (results.error) {
                setError(results.error)
                setIsLoading(false)
                return
            }
            setAccessToken(results.accessToken)
            setIsLoading(false)
            navigate('/')
        } catch (err) {
            setIsLoading(false)
            console.log(err)
        }
    }

    return (
        <div className="d-flex justify-content-center align-items-center bg-body-tertiary min-vh-100">
            <div className="col-5 p-5 border shadow rounded-3 d-flex flex-column bg-white text-center">
                <div className="mx-auto my-3">
                    <h1> Insight Vault</h1>
                    <p className="fw-bold text-secondary"> Competitive Intellegnece Platform </p>
                </div>
                <div className="bg-body-tertiary rounded-3 border-start border-primary border-5 p-3 mb-3">
                    Join executives from 500+ companies tracking competitor intelligence
                </div>
                <form onSubmit={handleSubmit} className="needs-validation" noValidate>
                    <div className="mb-3 text-start">
                        <label htmlFor="name" className="form-label"> Full Name </label>
                        <input
                            type="text"
                            className="form-control form-control-lg"
                            id="name"
                            name="fname"
                            onChange={handleChange}
                            value={registerData.fname}
                            required
                        />
                        <div className="invalid-feedback">
                            Please enter your full name.
                        </div>
                    </div>
                    <div className="mb-3 text-start">
                        <label htmlFor="email" className="form-label"> Email </label>
                        <input
                            type="text"
                            className="form-control form-control-lg"
                            id="email"
                            name="email"
                            onChange={handleChange}
                            value={registerData.email}
                            required
                        />
                        <div className="invalid-feedback">
                            Please enter your email.
                        </div>
                    </div>
                    <div className="mb-3 text-start">
                        <label htmlFor="pw" className="form-label"> Password </label>
                        <input
                            type="text"
                            className="form-control form-control-lg"
                            id="pw"
                            name="password"
                            onChange={handleChange}
                            value={registerData.password}
                            required
                        />
                        <div className="invalid-feedback">
                            Please enter your password.
                        </div>
                        {error && (<div className="text-danger my-3"> {error} </div>)}
                        {/* <span className="text-secondary fw-bold" style={{ fontSize: '14px' }} > Minimum 8 characters with uppercase, lowercase, and number </span> */}
                    </div>
                    <button type="submit" className="btn btn-primary col-12">
                        {isLoading ? 'Creating...' : 'Create Account'}
                    </button>
                </form>
                <hr className="text-secondary" />
                <div className="text-primary">
                    Already have an account?
                    <Link to='/login' className="link-primary text-decoration-none"> Sign in </Link>
                </div>
            </div>
        </div>
    )
}