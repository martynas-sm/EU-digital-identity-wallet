import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import * as auth from '@/services/auth'

function fmt(cents) { return `€${(cents / 100).toFixed(2)}` }

export function ProfilePage() {
    const [user, setUser] = useState(auth.getUser())
    const [transactions, setTransactions] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const navigate = useNavigate()

    useEffect(() => {
        if (!user) {
            navigate('/login')
            return
        }

        fetch('/api/transactions', {
            headers: { 'Authorization': auth.getToken() }
        })
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch transactions')
                return res.json()
            })
            .then(setTransactions)
            .catch(() => setError('Could not load transactions.'))
            .finally(() => setLoading(false))
    }, [user, navigate])

    function handleLogout() {
        auth.logout()
        navigate('/')
    }

    const [loginLink, setLoginLink] = useState('')
    const [linkLoading, setLinkLoading] = useState(false)

    async function handleGenerateLink() {
        setLinkLoading(true)
        try {
            const res = await fetch('/api/user/login-link', {
                headers: { 'Authorization': auth.getToken() }
            })
            if (!res.ok) throw new Error('Failed to generate link')
            const data = await res.json()
            setLoginLink(data.link)
        } catch (err) {
            console.error(err)
        } finally {
            setLinkLoading(false)
        }
    }

    function handleCopyLink() {
        if (loginLink) {
            navigator.clipboard.writeText(loginLink)
            alert('Link copied to clipboard')
        }
    }

    if (!user) return null

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8 pb-4 border-b dark:border-slate-800">
                <div>
                    <h1 className="text-2xl font-bold">Profile</h1>
                    <p className="text-sm text-muted-foreground mt-1">Logged in as <span className="font-semibold text-foreground">{user.username}</span></p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleGenerateLink} disabled={linkLoading}>
                        {linkLoading ? 'Generating...' : 'Get Wallet Login Link'}
                    </Button>
                    <Button variant="outline" onClick={handleLogout}>Logout</Button>
                </div>
            </div>

            {loginLink && (
                <div className="mb-8 p-4 border dark:border-slate-800 rounded-xl bg-card dark:bg-slate-900">
                    <h2 className="text-lg font-semibold mb-2">Wallet Login Link</h2>
                    <p className="text-sm text-muted-foreground mb-4">Copy this link and add it to your Wallet to log in automatically.</p>
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={loginLink}
                            readOnly
                            className="flex-1 px-3 py-2 border dark:border-slate-800 rounded-md bg-muted dark:bg-slate-950 text-sm focus:outline-none"
                        />
                        <Button onClick={handleCopyLink}>Copy</Button>
                    </div>
                </div>
            )}

            <h2 className="text-xl font-semibold mb-4">Order History</h2>

            {loading ? (
                <p className="text-sm text-muted-foreground">Loading orders...</p>
            ) : error ? (
                <p className="text-sm text-destructive">{error}</p>
            ) : transactions.length === 0 ? (
                <p className="text-sm text-muted-foreground">You haven't placed any orders yet.</p>
            ) : (
                <div className="space-y-4">
                    {transactions.map(t => (
                        <div key={t.id} className="p-4 border dark:border-slate-800 rounded-xl bg-card dark:bg-slate-900 flex justify-between items-center">
                            <div>
                                <p className="font-semibold">Order #{t.id}</p>
                                <p className="text-sm text-muted-foreground">{new Date(t.created_at).toLocaleString()}</p>
                                <p className="text-sm text-muted-foreground mt-1">{t.items_count} item{t.items_count !== 1 ? 's' : ''}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-bold">{fmt(t.total_cents)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
