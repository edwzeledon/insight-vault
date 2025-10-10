import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import useAuthStore from "../../../stores/AuthStore"


export default function Login() {
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const [loginData, setLoginData] = useState({
        email: '',
        password: ''
    })
    const setAccessToken = useAuthStore((state) => state.setAccessToken)

    function handleChange(e) {
        const { name, value } = e.target
        setLoginData(prev => ({ ...prev, [name]: value }))
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
            const response = await fetch('http://localhost:3000/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(loginData)
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
        <div className="flex justify-center items-center bg-muted min-h-screen">
            <div className="w-full max-w-md p-8 border border-border shadow-lg rounded-lg bg-card">
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold text-foreground mb-2">Insight Vault</h1>
                    <p className="text-sm font-semibold text-muted-foreground">Competitive Intelligence Platform</p>
                </div>
                
                <div className="bg-accent/50 rounded-lg border-l-4 border-l-primary p-4 mb-6">
                    <p className="text-sm text-foreground">
                        Sign in to monitor your competitors' activity in real-time
                    </p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
                            Email
                        </label>
                        <input
                            type="email"
                            className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                            id="email"
                            name="email"
                            onChange={handleChange}
                            value={loginData.email}
                            required
                        />
                    </div>
                    
                    <div>
                        <label htmlFor="pw" className="block text-sm font-medium text-foreground mb-1.5">
                            Password
                        </label>
                        <input
                            type="password"
                            className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                            id="pw"
                            name="password"
                            onChange={handleChange}
                            value={loginData.password}
                            required
                        />
                        {error && (
                            <div className="text-destructive text-sm mt-2">
                                {error}
                            </div>
                        )}
                    </div>
                    
                    <button
                        type="submit"
                        className="w-full py-2.5 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-md border border-primary/20 cursor-pointer disabled:cursor-not-allowed"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
                
                <hr className="my-6 border-border" />
                
                <div className="text-center text-sm text-muted-foreground">
                    Don't have an account?{' '}
                    <Link to='/register' className="text-primary hover:underline font-medium">
                        Register
                    </Link>
                </div>
            </div>
        </div>
    )
}
