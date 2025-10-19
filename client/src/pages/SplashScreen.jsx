import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from '@/components/ui/logo';
import { Progress } from '@/components/ui/progress';

const SplashScreen = ({ onComplete, duration = 3000 }) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const loadingSteps = [
    { label: 'Initializing ominbiz...', duration: 800 },
    { label: 'Loading your workspace...', duration: 600 },
    { label: 'Connecting to services...', duration: 700 },
    { label: 'Preparing dashboard...', duration: 500 },
    { label: 'Almost ready...', duration: 400 }
  ];

  useEffect(() => {
    let progressInterval;
    let stepTimeout;
    let totalElapsed = 0;

    const runLoadingSequence = () => {
      // Progress animation
      progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + (100 / (duration / 50));
          return newProgress >= 100 ? 100 : newProgress;
        });
      }, 50);

      // Step progression
      const progressSteps = () => {
        if (currentStep < loadingSteps.length - 1) {
          stepTimeout = setTimeout(() => {
            setCurrentStep(prev => prev + 1);
            totalElapsed += loadingSteps[currentStep].duration;
            if (totalElapsed < duration - 500) {
              progressSteps();
            }
          }, loadingSteps[currentStep].duration);
        }
      };

      progressSteps();

      // Complete splash screen
      setTimeout(() => {
        setProgress(100);
        setTimeout(() => {
          setIsVisible(false);
          setTimeout(() => {
            onComplete?.();
          }, 500);
        }, 300);
      }, duration);
    };

    runLoadingSequence();

    return () => {
      if (progressInterval) clearInterval(progressInterval);
      if (stepTimeout) clearTimeout(stepTimeout);
    };
  }, [duration, onComplete, currentStep]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23059669' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>

          {/* Main Content */}
          <div className="relative flex flex-col items-center space-y-8 p-8">
            {/* Logo with Animation */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                duration: 0.8,
                ease: "easeOut",
                delay: 0.2
              }}
            >
              <Logo
                size="2xl"
                variant="full"
                animated={true}
                className="mb-4"
              />
            </motion.div>

            {/* Welcome Text */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="text-center space-y-2"
            >
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Welcome to ominbiz
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Your Complete Business Management Solution
              </p>
            </motion.div>

            {/* Loading Progress */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              className="w-full max-w-md space-y-4"
            >
              {/* Progress Bar */}
              <div className="space-y-2">
                <Progress
                  value={progress}
                  className="h-2 bg-gray-200 dark:bg-gray-700"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Loading...</span>
                  <span>{Math.round(progress)}%</span>
                </div>
              </div>

              {/* Current Step */}
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="text-center"
              >
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {loadingSteps[currentStep]?.label}
                </p>
              </motion.div>
            </motion.div>

            {/* Feature Highlights */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.6 }}
              className="grid grid-cols-3 gap-6 mt-8"
            >
              {[
                { icon: '📊', label: 'Analytics' },
                { icon: '🛒', label: 'Orders' },
                { icon: '👥', label: 'Customers' }
              ].map((feature, index) => (
                <motion.div
                  key={feature.label}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    duration: 0.4,
                    delay: 1.8 + (index * 0.1),
                    type: "spring",
                    stiffness: 200
                  }}
                  className="flex flex-col items-center space-y-2 p-4 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
                >
                  <span className="text-2xl">{feature.icon}</span>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    {feature.label}
                  </span>
                </motion.div>
              ))}
            </motion.div>

            {/* Floating Elements */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-green-400 rounded-full opacity-20"
                  style={{
                    left: `${20 + (i * 15)}%`,
                    top: `${30 + (i % 2 * 40)}%`,
                  }}
                  animate={{
                    y: [-10, 10, -10],
                    opacity: [0.2, 0.5, 0.2],
                  }}
                  transition={{
                    duration: 2 + (i * 0.5),
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Bottom Branding */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 2 }}
            className="absolute bottom-8 text-center"
          >
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Powered by ominbiz Technology
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Version 2.0.0
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen