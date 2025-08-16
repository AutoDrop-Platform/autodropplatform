"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Copy, CheckCircle, AlertCircle } from "lucide-react"

interface SetupAuthDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SetupAuthDialog({ open, onOpenChange }: SetupAuthDialogProps) {
  const [copiedStep, setCopiedStep] = useState<number | null>(null)

  const copyToClipboard = (text: string, step: number) => {
    navigator.clipboard.writeText(text)
    setCopiedStep(step)
    setTimeout(() => setCopiedStep(null), 2000)
  }

  const envVars = `NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            Setup Supabase Authentication
          </DialogTitle>
          <DialogDescription>
            Configure Supabase to enable user authentication for your AutoDrop AI dashboard.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Step 1 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Badge variant="outline">1</Badge>
                Create Supabase Project
              </CardTitle>
              <CardDescription>Set up a new Supabase project for your AutoDrop dashboard</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Go to Supabase and create a new project for your AutoDrop AI dashboard.
              </p>
              <Button variant="outline" size="sm" asChild>
                <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open Supabase Dashboard
                </a>
              </Button>
            </CardContent>
          </Card>

          {/* Step 2 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Badge variant="outline">2</Badge>
                Get Project Credentials
              </CardTitle>
              <CardDescription>Copy your project URL and anon key from Supabase settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                In your Supabase project dashboard, go to <strong>Settings → API</strong> and copy:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>
                  • <strong>Project URL</strong> (under "Project URL")
                </li>
                <li>
                  • <strong>anon public key</strong> (under "Project API keys")
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Step 3 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Badge variant="outline">3</Badge>
                Configure Environment Variables
              </CardTitle>
              <CardDescription>Add the credentials to your Vercel project settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                In your Vercel project dashboard, go to <strong>Settings → Environment Variables</strong> and add:
              </p>
              <div className="relative">
                <pre className="bg-slate-100 p-3 rounded-md text-sm overflow-x-auto">
                  <code>{envVars}</code>
                </pre>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(envVars, 3)}
                >
                  {copiedStep === 3 ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <Button variant="outline" size="sm" asChild>
                <a href="https://vercel.com/dashboard" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open Vercel Dashboard
                </a>
              </Button>
            </CardContent>
          </Card>

          {/* Step 4 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Badge variant="outline">4</Badge>
                Enable Authentication
              </CardTitle>
              <CardDescription>Configure authentication settings in Supabase</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                In your Supabase project, go to <strong>Authentication → Settings</strong> and:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Enable email authentication</li>
                <li>• Set your site URL to your Vercel deployment URL</li>
                <li>• Configure redirect URLs if needed</li>
              </ul>
            </CardContent>
          </Card>

          {/* Final Step */}
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-green-700">
                <CheckCircle className="h-5 w-5" />
                Deploy & Test
              </CardTitle>
              <CardDescription className="text-green-600">
                Redeploy your project and test the authentication
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-green-700">
                After adding the environment variables, redeploy your Vercel project. The authentication system will
                automatically activate and you'll see login/signup options.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={() => onOpenChange(false)}>Got it, thanks!</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
