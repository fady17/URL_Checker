import React, { useState } from 'react'
import { Button } from './components/ui/button'
import { Input } from './components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './components/ui/card'
import { AlertCircle, CheckCircle2, Link } from 'lucide-react'
import { sanitizeInput } from './lib/sanitize'
import { urlCheckRateLimiter } from './lib/rateLimiter'
import { urlSchema } from './schemas/urls'
import { useToast } from "@/hooks/use-toast"
import { z } from 'zod';

interface UrlCheckResult {
    error?: string;
    url?: string;
    // Add more fields as necessary based on your API response structure
}

const App: React.FC = () => {
    const [url, setUrl] = useState('')
    const [result, setResult] = useState<UrlCheckResult | null>(null)
    const [loading, setLoading] =useState<boolean>(false)
    const { toast } = useToast()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!urlCheckRateLimiter.canMakeRequest()) {
            toast({
                title: "Rate limit exceeded",
                description: "Please wait before making another request.",
                variant: "destructive",
            })
            return
        }

        setLoading(true)
        const sanitizedUrl = sanitizeInput(url)
        try {
            urlSchema.parse({ url: sanitizedUrl })
            const response = await fetch('https://api.example.com/check-url', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url: sanitizedUrl }),
                credentials: 'include',
            })
            if (!response.ok) {
                    throw new Error('Network response was not ok')
            }
            const data = await response.json()
            setResult(data)
        } catch (error) {
            console.error('Error checking URL:', error)
            if (error instanceof z.ZodError) {
                toast({
                    title: "Invalid URL",
                    description: "Please enter a valid URL.",
                    variant: "destructive",
                })
            } else {
                setResult({ error: 'An error occurred while checking the URL' })
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900 text-cyan-500">
            <Card className="w-full max-w-lg shadow-lg border border-cyan-500 rounded-md p-6">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-bold text-cyan-400">URL Integrity Checker</CardTitle>
                    <CardDescription className="text-cyan-300 mt-2">Quickly verify the safety and integrity of any URL.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="urlInput" className="text-sm text-cyan-300">Enter URL:</label>
                            <Input
                                id="urlInput"
                                type="url"
                                placeholder="https://example.com"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                className="w-full p-3 bg-gray-800 text-cyan-300 border border-cyan-600 rounded-md"
                                required
                                aria-label="URL input field"
                            />
                        </div>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-50"
                            aria-busy={loading ? "true" : "false"}
                            aria-label="Check URL button"
                        >
                            {loading ? 'Checking URL...' : 'Check URL'}
                        </Button>
                    </form>

                    {/* Result Section */}
                    {result && (
                        <div className="mt-6 p-4 bg-gray-800 rounded-md">
                            {result.error ? (
                                <div className="flex items-center text-red-500">
                                    <AlertCircle className="mr-2" />
                                    {result.error}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex items-center">
                                        <CheckCircle2 className="mr-2 text-green-500" />
                                        <span className="text-green-400">URL is safe</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Link className="mr-2 text-cyan-400" />
                                        <span className="text-cyan-300 break-words">{result.url}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
                <CardFooter className="text-center text-xs text-cyan-500">
                    Powered by industry-leading security algorithms
                </CardFooter>
            </Card>
        </div>
    );
};

export default App