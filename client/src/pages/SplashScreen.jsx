import React, { useState, useEffect } from 'react'
import { Loader2, CheckCircle, Zap } from 'lucide-react'

function SplashScreen({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const loadingSteps = [
    { id: 1, text: "Initializing OmniBiz...", duration: 1000 },
    { id: 2, text: "Loading your workspace...", duration: 1200 },
    { id: 3, text: "Syncing data...", duration: 800 },
    { id: 4, text: "Preparing dashboard...", duration: 1000 },
    { id: 5, text: "Almost ready...", duration: 600 }
  ]

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentStep < loadingSteps.length - 1) {
        setCurrentStep(currentStep + 1)
      } else {
        setIsLoading(false)
        setTimeout(() => {
          if (onComplete) onComplete()
        }, 1000)
      }
    }, loadingSteps[currentStep]?.duration || 1000)

    return () => clearTimeout(timer)
  }, [currentStep, loadingSteps, onComplete])

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center">
      <div className="text-center space-y-8 p-8">
        {/* Logo and Brand */}
        <div className="space-y-4">
          <div className="relative">
            <div className="w-24 h-24 mx-auto bg-primary rounded-2xl flex items-center justify-center shadow-lg">
              <Zap className="w-12 h-12 text-primary-foreground" />
            </div>
            {!isLoading && (
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center animate-bounce-in">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
            )}
          </div>

          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">OmniBiz</h1>
            <p className="text-muted-foreground text-lg">Business Management Platform</p>
          </div>
        </div>

        {/* Loading Animation */}
        <div className="space-y-6">
          {isLoading ? (
            <>
              <div className="flex items-center justify-center space-x-3">
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
                <span className="text-foreground font-medium">
                  {loadingSteps[currentStep]?.text}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-80 mx-auto">
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${((currentStep + 1) / loadingSteps.length) * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>0%</span>
                  <span>{Math.round(((currentStep + 1) / loadingSteps.length) * 100)}%</span>
                  <span>100%</span>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-center space-x-3 text-green-600">
                <CheckCircle className="w-6 h-6" />
                <span className="font-medium">Ready to go!</span>
              </div>
              <p className="text-muted-foreground">Welcome to your business dashboard</p>
            </div>
          )}
        </div>

        {/* Loading Steps Indicator */}
        <div className="flex justify-center space-x-2">
          {loadingSteps.map((step, index) => (
            <div
              key={step.id}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index <= currentStep
                  ? 'bg-primary'
                  : 'bg-muted'
              }`}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="text-xs text-muted-foreground">
          <p>© 2025 OmniBiz. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}

export default SplashScreen