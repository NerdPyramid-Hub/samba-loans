"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, Lock, User, Chrome, CheckCircle, Heart } from "lucide-react"
import { FcGoogle } from "react-icons/fc";

interface SignupFormProps {
  onSwitchToLogin: () => void
  onSignup: (name: string, email: string, password: string) => void
  onGoogleSignup: () => void
}

export function SignupForm({ onSwitchToLogin, onSignup, onGoogleSignup }: SignupFormProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [showVerification, setShowVerification] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await onSignup(name, email, password)
    setLoading(false)
    setShowVerification(true)
  }

  if (showVerification) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-emerald-700 mb-4" />
          <CardTitle className="text-2xl font-bold text-slate-800">Check Your Email</CardTitle>
          <CardDescription className="text-slate-600">We've sent a verification link to {email}</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="border-emerald-200 bg-emerald-50">
            <AlertDescription className="text-slate-700">
              Please check your email and click the verification link to activate your account. You won't be able to log
              in until your email is verified.
            </AlertDescription>
          </Alert>
          <Button
            variant="outline"
            className="w-full mt-4 bg-transparent border-slate-300 text-slate-700 hover:bg-slate-50"
            onClick={onSwitchToLogin}
          >
            Back to Login
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-full flex items-center justify-center mr-3 shadow-lg">
            <Heart className="h-6 w-6 text-white" />
          </div>
          <div className="text-left">
            <h1 className="text-2xl font-bold text-slate-900">Infinity Lenders</h1>
            <p className="text-emerald-700 font-semibold text-sm">Helping Hands</p>
          </div>
        </div>
        <CardTitle className="text-2xl font-bold text-slate-800">Join Infinity Lenders</CardTitle>
        <CardDescription className="text-slate-600">Create your account to get started</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-slate-700 font-medium">
              Full Name
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-10 border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-700 font-medium">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-700 font-medium">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
              <Input
                id="password"
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
                required
              />
            </div>
          </div>
          <Button
            type="submit"
            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-medium"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </Button>
        </form>

        <Separator />

        <Button
          variant="outline"
          className="w-full bg-transparent border-slate-300 text-slate-700 hover:bg-slate-50"
          onClick={onGoogleSignup}
        >
          <FcGoogle className="mr-2 h-6 w-6" />
          Continue with Google
        </Button>

        <div className="text-center text-sm">
          <span className="text-slate-600">Already have an account? </span>
          <button onClick={onSwitchToLogin} className="text-emerald-700 hover:text-emerald-800 font-semibold underline">
            Sign in
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
