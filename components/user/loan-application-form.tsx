"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Upload, ArrowLeft, Calculator } from "lucide-react"
import { format } from "date-fns"

interface LoanApplicationFormProps {
  user: { name: string; email: string }
  onSubmit: (formData: any) => void
  onBack: () => void
}

export function LoanApplicationForm({ user, onSubmit, onBack }: LoanApplicationFormProps) {
  const [phoneNumber, setPhoneNumber] = useState("")
  const [loanAmount, setLoanAmount] = useState("")
  const [dueDate, setDueDate] = useState<Date>()
  const [document, setDocument] = useState<File | null>(null)
  const [repaymentDestination, setRepaymentDestination] = useState("")
  const [loading, setLoading] = useState(false)

  const maxDate = new Date()
  maxDate.setDate(maxDate.getDate() + 40)

  const repaymentAmount = loanAmount ? (Number.parseFloat(loanAmount) * 1.3).toFixed(2) : "0.00"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const formData = {
      fullName: user.name,
      phoneNumber,
      email: user.email,
      loanAmount: Number.parseFloat(loanAmount),
      dueDate: dueDate?.toISOString(),
      document,
      repaymentDestination,
      repaymentAmount: Number.parseFloat(repaymentAmount),
    }

    await onSubmit(formData)
    setLoading(false)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const allowedTypes = ["application/pdf", "image/jpeg", "image/png"]
      if (allowedTypes.includes(file.type)) {
        setDocument(file)
      } else {
        alert("Please upload a PDF, JPEG, or PNG file")
      }
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Button variant="ghost" onClick={onBack} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-slate-800">Loan Application</CardTitle>
            <CardDescription>Fill out the form below to apply for a loan. All fields are required.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-800">Personal Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input id="fullName" value={user.name} readOnly className="bg-slate-50" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      placeholder="Enter your phone number"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" value={user.email} readOnly className="bg-slate-50" />
                </div>
              </div>

              {/* Loan Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-800">Loan Details</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="loanAmount">Loan Amount (ZAR)</Label>
                    <Input
                      id="loanAmount"
                      type="number"
                      placeholder="Enter loan amount"
                      value={loanAmount}
                      onChange={(e) => setLoanAmount(e.target.value)}
                      min="1"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Payment Due Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dueDate ? format(dueDate, "PPP") : "Select due date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={dueDate}
                          onSelect={setDueDate}
                          disabled={(date) => date < new Date() || date > maxDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <p className="text-sm text-slate-600">Must be within 40 days from today</p>
                  </div>
                </div>

                {/* Repayment Estimate */}
                {loanAmount && (
                  <Alert>
                    <Calculator className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Repayment Estimate:</strong> R{repaymentAmount} (includes 30% interest)
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Document Upload */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-800">Documentation</h3>

                <div className="space-y-2">
                  <Label htmlFor="document">Payslip or Bank Statement</Label>
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                    <Upload className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                    <input
                      id="document"
                      type="file"
                      accept=".pdf,.jpeg,.jpg,.png"
                      onChange={handleFileChange}
                      className="hidden"
                      required
                    />
                    <Label htmlFor="document" className="cursor-pointer">
                      <span className="text-emerald-600 hover:text-emerald-700 font-medium">Click to upload</span>
                      <span className="text-slate-600"> or drag and drop</span>
                    </Label>
                    <p className="text-sm text-slate-500 mt-1">PDF, JPEG, PNG up to 10MB</p>
                    {document && <p className="text-sm text-emerald-600 mt-2">Selected: {document.name}</p>}
                  </div>
                </div>
              </div>

              {/* Repayment Destination */}
              <div className="space-y-2">
                <Label htmlFor="repaymentDestination">Repayment Destination Details</Label>
                <Input
                  id="repaymentDestination"
                  placeholder="e.g., Capitec - 123456789 - John Smith"
                  value={repaymentDestination}
                  onChange={(e) => setRepaymentDestination(e.target.value)}
                  required
                />
                <p className="text-sm text-slate-600">Where should we send your approved loan?</p>
              </div>

              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={loading}>
                {loading ? "Submitting Application..." : "Submit Loan Application"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
