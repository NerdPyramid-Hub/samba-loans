"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, Lock, Chrome, Heart, AlertCircle } from "lucide-react";

interface LoginFormProps {
  onSwitchToSignup: () => void;
  onLogin: (email: string, password: string) => Promise<void>;
  onGoogleLogin: () => void;
}

export function LoginForm({
  onSwitchToSignup,
  onLogin,
  onGoogleLogin,
}: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await onLogin(email, password);
    } catch (error: any) {
      setError(error.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-full flex items-center justify-center mr-3 shadow-lg">
            <Heart className="h-6 w-6 text-white" />
          </div>
          <div className="text-left">
            <h1 className="text-2xl font-bold text-slate-900">SAMBA LOANS</h1>
            <p className="text-emerald-700 font-semibold text-sm">
              Helping Hands
            </p>
          </div>
        </div>
        <CardTitle className="text-2xl font-bold text-slate-800">
          Welcome Back
        </CardTitle>
        <CardDescription className="text-slate-600">
          Sign in to your account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
                placeholder="Enter your password"
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
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <Separator />

        <Button
          variant="outline"
          className="w-full bg-transparent border-slate-300 text-slate-700 hover:bg-slate-50"
          onClick={async () => {
            try {
              await onGoogleLogin();
            } catch (error: any) {
              alert(
                `Google login error: ${error.message}. Please try regular email login instead.`
              );
            }
          }}
        >
          <Chrome className="mr-2 h-4 w-4" />
          Continue with Google
        </Button>

        <div className="text-center text-sm">
          <span className="text-slate-600">Don't have an account? </span>
          <button
            onClick={onSwitchToSignup}
            className="text-emerald-700 hover:text-emerald-800 font-semibold underline"
          >
            Sign up
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
