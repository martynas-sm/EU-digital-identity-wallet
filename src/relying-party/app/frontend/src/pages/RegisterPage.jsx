import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { FormField, Input } from '@/components/ui/form'
import * as auth from '@/services/auth'
import { toast } from 'sonner'

export function RegisterPage() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    async function handleRegister(e) {
        e.preventDefault()
        if (!username || !password) {
            setError('Please enter username and password.')
            return
        }

        setLoading(true)
        setError('')

        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            })

            if (!res.ok) {
                const data = await res.json().catch(() => ({}))
                setError(data.error || 'Registration failed.')
                return
            }
            toast.success("Account created successfully. Please login.")
            navigate('/login')
        } catch (err) {
            setError(`Network error: ${err.message}`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-md mx-auto mt-12 p-6 border dark:border-slate-800 rounded-2xl bg-card dark:bg-slate-900 shadow-sm">
            <h1 className="text-2xl font-bold mb-2">Register</h1>
            <p className="text-sm text-muted-foreground mb-6">Create a new account.</p>

            <form onSubmit={handleRegister} className="space-y-4">
                <FormField label="Username">
                    <Input value={username} onChange={e => setUsername(e.target.value)} disabled={loading} className="bg-white dark:bg-slate-900" />
                </FormField>
                <FormField label="Password">
                    <Input type="password" value={password} onChange={e => setPassword(e.target.value)} disabled={loading} className="bg-white dark:bg-slate-900" />
                </FormField>

                {error && <p className="text-sm text-destructive font-medium">{error}</p>}

                <Button type="submit" className="w-full font-semibold mt-4" disabled={loading}>
                    {loading ? 'Creating account...' : 'Register'}
                </Button>
            </form>

            <p className="text-sm text-center mt-6 text-muted-foreground">
                Already have an account? <Link to="/login" className="text-primary hover:underline">Login</Link>
            </p>
        </div>
    )
}
