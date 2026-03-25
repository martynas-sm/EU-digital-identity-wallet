import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

let dialogHandler = null;

export function registerWalletDialog(handler) {
    dialogHandler = handler;
}

export function showWalletRequestDialog(payload) {
    if (dialogHandler) return dialogHandler(payload);
    return Promise.reject(new Error("Wallet request dialog is not mounted"));
}

export function WalletRequestDialog() {
    const [open, setOpen] = useState(false)
    const [requestData, setRequestData] = useState(null)
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        const handler = (payload) => {
            setRequestData(payload)
            setOpen(true)
            setCopied(false)
            
            return new Promise((resolve, reject) => {
                const interval = setInterval(async () => {
                    try {
                        const pollRes = await fetch(`/api/wallet/status/${payload.nonce}`);
                        if (pollRes.status === 200) {
                            const data = await pollRes.json();
                            clearInterval(interval);
                            setOpen(false);
                            resolve(data);
                        } else if (pollRes.status === 404) {
                            clearInterval(interval);
                            setOpen(false);
                            reject(new Error('Wallet session not found or expired'));
                        }
                    } catch { }
                }, 1000);
            });
        };

        registerWalletDialog(handler)
        return () => registerWalletDialog(null)
    }, [])

    const handleCopy = () => {
        if (requestData?.requestJson) {
            navigator.clipboard.writeText(requestData.requestJson)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    return (
        <Dialog open={open}>
            <DialogContent className="sm:max-w-md" onInteractOutside={e => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle className="text-xl">Waiting for Wallet Verification</DialogTitle>
                    <DialogDescription>
                        Please copy the request below and paste it into the Wallet Verify page.
                    </DialogDescription>
                </DialogHeader>
                {requestData && (
                    <div className="space-y-4">
                        <pre className="bg-muted p-4 rounded-md overflow-x-auto text-xs text-left">
                            {requestData.requestJson}
                        </pre>
                        <Button className="w-full font-semibold" onClick={handleCopy}>
                            {copied ? 'Copied!' : 'Copy Request'}
                        </Button>
                        <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground mt-6 pt-4 border-t">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                            <p className="text-sm">Polling for proof completion...</p>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
