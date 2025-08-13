"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Clock, DollarSign, ArrowRight, CheckCircle, Heart } from "lucide-react"

interface LandingPageProps {
  onGetStarted: () => void
  onAdminAccess: () => void
}

export function LandingPage({ onGetStarted, onAdminAccess }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Header with Hidden Admin Access */}
      <div className="absolute top-4 right-4 flex items-center space-x-2">
        <Button
          variant="ghost"
          size="icon"
          className="opacity-0 hover:opacity-30 transition-opacity duration-300"
          title="Admin Access"
          onClick={onAdminAccess}
        >
          <Shield className="h-4 w-4" />
        </Button>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-20">
          {/* Logo and Brand */}
          <div className="mb-8">
            <div className="flex items-center justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-full flex items-center justify-center mr-4 shadow-lg">
                <Heart className="h-10 w-10 text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-6xl md:text-7xl font-bold text-slate-900">SAMBA LOANS</h1>
                <p className="text-emerald-700 font-semibold text-xl">Helping Hands</p>
              </div>
            </div>
          </div>

          <h2 className="text-2xl md:text-4xl font-bold mb-6 text-slate-800">
            Financial Support When You <span className="text-emerald-700">Need It Most</span>
          </h2>
          <p className="text-lg text-slate-700 mb-8 max-w-3xl mx-auto leading-relaxed">
            Simple, transparent loans designed to help you through tough times. Quick approval, fair rates, and a team
            that cares about your financial wellbeing.
          </p>

          <Button
            size="lg"
            className="min-w-[200px] bg-emerald-700 hover:bg-emerald-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 mb-8"
            onClick={onGetStarted}
          >
            Get Help Today
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-700" />
              <span className="font-medium">No hidden fees</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-700" />
              <span className="font-medium">Secure process</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-700" />
              <span className="font-medium">Quick approval</span>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-emerald-700" />
              </div>
              <CardTitle className="text-xl text-slate-900">Quick Response</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <CardDescription className="text-slate-700 leading-relaxed">
                Get approved within hours. We understand urgency and work fast to get you the help you need.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="h-8 w-8 text-teal-700" />
              </div>
              <CardTitle className="text-xl text-slate-900">Fair & Clear</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <CardDescription className="text-slate-700 leading-relaxed">
                Transparent 30% interest rate with no surprises. You'll know exactly what you owe from day one.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-slate-700" />
              </div>
              <CardTitle className="text-xl text-slate-900">Personal Care</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <CardDescription className="text-slate-700 leading-relaxed">
                We treat every application with care and understanding. Your financial wellbeing matters to us.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* How It Works Section */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-8 md:p-12 mb-20 border border-emerald-100">
          <h2 className="text-3xl font-bold mb-4 text-center text-slate-900">Simple Process</h2>
          <p className="text-center text-slate-700 mb-12 max-w-2xl mx-auto">
            Getting help shouldn't be complicated. Our straightforward process gets you the support you need quickly.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-700 text-white rounded-full flex items-center justify-center mx-auto font-bold text-xl shadow-lg">
                1
              </div>
              <h3 className="font-semibold text-lg text-slate-900">Sign Up</h3>
              <p className="text-sm text-slate-700 leading-relaxed">
                Create your account quickly and securely with just your email.
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-teal-700 text-white rounded-full flex items-center justify-center mx-auto font-bold text-xl shadow-lg">
                2
              </div>
              <h3 className="font-semibold text-lg text-slate-900">Apply</h3>
              <p className="text-sm text-slate-700 leading-relaxed">
                Fill out our simple form and upload your documents.
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto font-bold text-xl shadow-lg">
                3
              </div>
              <h3 className="font-semibold text-lg text-slate-900">Get Approved</h3>
              <p className="text-sm text-slate-700 leading-relaxed">
                Our team reviews your application with care and speed.
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-teal-600 text-white rounded-full flex items-center justify-center mx-auto font-bold text-xl shadow-lg">
                4
              </div>
              <h3 className="font-semibold text-lg text-slate-900">Receive Help</h3>
              <p className="text-sm text-slate-700 leading-relaxed">
                Funds are sent directly to your bank account securely.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-emerald-700 to-teal-700 rounded-2xl p-8 md:p-12 text-center text-white">
          <div className="flex items-center justify-center mb-4">
            <Heart className="h-8 w-8 mr-3" />
            <h2 className="text-3xl font-bold">We're Here to Help</h2>
          </div>
          <p className="text-xl mb-8 text-emerald-100 max-w-2xl mx-auto">
            Join thousands who have found the financial support they needed. Apply with confidence knowing we care about
            your success.
          </p>
          <Button
            size="lg"
            className="min-w-[200px] bg-white text-emerald-800 hover:bg-emerald-50 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
            onClick={onGetStarted}
          >
            Get Started Today
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
