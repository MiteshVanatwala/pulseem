import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const AILoader = ({ isVisible = true, text = '' }) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const { t } = useTranslation();

  const steps = [
    { text: t('AILoader.step1'), icon: "🎨" },
    { text: t('AILoader.step2'), icon: "📐" },
    { text: t('AILoader.step3'), icon: "✍️" },
    { text: t('AILoader.step4'), icon: "🚀" },
    { text: t('AILoader.step5'), icon: "✨" }
  ];

  useEffect(() => {
    if (!isVisible) {
      setProgress(0);
      setCurrentStep(0);
      return;
    }

    // Progress animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 0.5;
      });
    }, 300);

    // Step animation - calculate based on progress
    const stepInterval = setInterval(() => {
      setProgress(currentProgress => {
        // Calculate which step we should be on based on progress
        const stepIndex = Math.floor((currentProgress / 100) * steps.length);
        if (stepIndex !== currentStep && stepIndex < steps.length) {
          setCurrentStep(stepIndex);
        }
        return currentProgress;
      });
    }, 100);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
    };
  }, [isVisible, currentStep, steps.length]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
        {/* Main Animation Container */}
        <div className="relative mb-8">
          {/* Animated Logo/Icon */}
          <div className="relative w-32 h-32 mx-auto">
            {/* Outer ring */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-500 to-red-500 outer-ring-spin"
              style={{
                clipPath: 'polygon(50% 0%, 50% 50%, 100% 0%)'
              }}>
            </div>

            {/* Middle ring */}
            <div className="absolute inset-2 rounded-full bg-gradient-to-r from-pink-400 to-orange-400 middle-ring-spin"
              style={{
                clipPath: 'polygon(50% 0%, 50% 50%, 100% 50%, 100% 0%)'
              }}>
            </div>

            {/* Inner circle with Pulseem "P" or icon */}
            <div className="absolute inset-4 rounded-full bg-white shadow-inner flex items-center justify-center overflow-hidden">
              {/* Pulsing background effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-pink-100 to-red-100 opacity-50 animate-pulse"></div>

              {/* Either show step icon or Pulseem P */}
              <div className="relative z-10">
                <div className="text-4xl animate-bounce">
                  {steps[currentStep].icon}
                </div>
              </div>
            </div>

            {/* Orbiting dots with Pulseem colors */}
            <div className="absolute inset-0 orbiting-dots">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-pink-500 rounded-full shadow-lg">
                <div className="absolute inset-0 bg-pink-500 rounded-full animate-ping"></div>
              </div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-red-500 rounded-full shadow-lg">
                <div className="absolute inset-0 bg-red-500 rounded-full animate-ping"></div>
              </div>
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-orange-500 rounded-full shadow-lg">
                <div className="absolute inset-0 bg-orange-500 rounded-full animate-ping"></div>
              </div>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-pink-400 rounded-full shadow-lg">
                <div className="absolute inset-0 bg-pink-400 rounded-full animate-ping"></div>
              </div>
            </div>

            {/* Pulse effect rings */}
            <div className="absolute inset-0 rounded-full border-2 border-pink-500 opacity-30 animate-pulse-ring"></div>
            <div className="absolute inset-0 rounded-full border-2 border-pink-500 opacity-20 animate-pulse-ring-delayed"></div>
          </div>
        </div>

        {/* Status Text */}
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            {text}
          </h3>
          <p className="text-gray-600 h-6 transition-all duration-300">
            {steps[currentStep].text}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-4">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-pink-500 to-red-500 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%`, height: 8 }}
          >
            <div className="absolute inset-0 bg-white opacity-30 animate-shimmer"></div>
          </div>
        </div>

        {/* Progress Percentage */}
        <div className="text-center text-sm text-gray-500 mb-2">
          {progress === 100 ? <>Please wait...</> : <>{Math.round(progress)}% {t('AILoader.completed')}</>}
        </div>

        {/* Step Indicators */}
        <div className="flex justify-center mt-6 space-x-2">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 w-8 rounded-full transition-all duration-300 ${index <= currentStep
                ? 'bg-gradient-to-r from-pink-500 to-red-500'
                : 'bg-gray-300'
                }`}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        /* Base animations */
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes spin-reverse {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(200%);
          }
        }

        @keyframes pulse-ring {
          0% {
            transform: scale(0.8);
            opacity: 0.5;
          }
          50% {
            transform: scale(1.2);
            opacity: 0;
          }
          100% {
            transform: scale(1.2);
            opacity: 0;
          }
        }

        @keyframes pulse-ring-delayed {
          0% {
            transform: scale(0.8);
            opacity: 0.5;
          }
          50% {
            transform: scale(1.3);
            opacity: 0;
          }
          100% {
            transform: scale(1.3);
            opacity: 0;
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }

        /* Custom animation classes */
        .outer-ring-spin {
          animation: spin 3s linear infinite;
        }

        .middle-ring-spin {
          animation: spin-reverse 2s linear infinite;
        }

        .orbiting-dots {
          animation: spin 4s linear infinite;
        }

        /* Animation classes */
        .animate-spin {
          animation: spin 1s linear infinite;
        }

        .animate-shimmer {
          animation: shimmer 1.5s infinite;
        }

        .animate-pulse-ring {
          animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .animate-pulse-ring-delayed {
          animation: pulse-ring-delayed 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          animation-delay: 1s;
        }

        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .animate-bounce {
          animation: bounce 1s infinite;
        }

        .animate-ping {
          animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
        }

        /* Utility classes (if not using Tailwind) */
        .fixed {
          position: fixed;
          width: 100%;
          height: 100%;
          right: 0;
          left: 0;
        }

        .inset-0 {
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
        }

        .z-50 {
          z-index: 50;
        }

        .bg-black {
          background-color: #000;
        }

        .bg-white {
          background-color: #fff;
        }

        .bg-opacity-50 {
          background-color: rgba(0, 0, 0, 0.5);
        }

        .backdrop-blur-sm {
          backdrop-filter: blur(4px);
        }

        .flex {
          display: flex;
        }

        .items-center {
          align-items: center;
        }

        .justify-center {
          justify-content: center;
        }

        .rounded-2xl {
          border-radius: 1rem;
        }

        .rounded-lg {
          border-radius: 0.5rem;
        }

        .rounded-full {
          border-radius: 9999px;
        }

        .p-8 {
          padding: 2rem;
        }

        .px-4 {
          padding-left: 1rem;
          padding-right: 1rem;
        }

        .py-2 {
          padding-top: 0.5rem;
          padding-bottom: 0.5rem;
        }

        .mx-auto {
          margin-left: auto;
          margin-right: auto;
        }

        .mx-4 {
          margin-left: 1rem;
          margin-right: 1rem;
        }

        .mb-6 {
          margin-bottom: 1.5rem;
        }

        .mb-8 {
          margin-bottom: 2rem;
        }

        .mb-4 {
          margin-bottom: 1rem;
        }

        .mb-2 {
          margin-bottom: 0.5rem;
        }

        .mt-6 {
          margin-top: 1.5rem;
        }

        .max-w-md {
          max-width: 28rem;
        }

        .w-full {
          width: 100%;
        }

        .w-32 {
          width: 8rem;
        }

        .h-32 {
          height: 8rem;
        }

        .w-3 {
          width: 0.75rem;
        }

        .h-3 {
          height: 0.75rem;
        }

        .h-6 {
          height: 1.5rem;
        }

        .h-2 {
          height: 0.5rem;
        }

        .h-1.5 {
          height: 0.375rem;
        }

        .w-8 {
          width: 2rem;
        }

        .relative {
          position: relative;
        }

        .absolute {
          position: absolute;
        }

        .inset-0 {
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
        }

        .inset-2 {
          top: 0.5rem;
          right: 0.5rem;
          bottom: 0.5rem;
          left: 0.5rem;
        }

        .inset-4 {
          top: 1rem;
          right: 1rem;
          bottom: 1rem;
          left: 1rem;
        }

        .top-0 {
          top: 0;
        }

        .left-0 {
          left: 0;
        }

        .left-1\/2 {
          left: 50%;
        }

        .top-1\/2 {
          top: 50%;
        }

        .bottom-0 {
          bottom: 0;
        }

        .right-0 {
          right: 0;
        }

        .-translate-x-1\/2 {
          transform: translateX(-50%);
        }

        .-translate-y-1\/2 {
          transform: translateY(-50%);
        }

        .shadow-2xl {
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }

        .shadow-lg {
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }

        .shadow-inner {
          box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);
        }

        .overflow-hidden {
          overflow: hidden;
        }

        .text-center {
          text-align: center;
        }

        .text-white {
          color: #fff;
        }

        .text-gray-800 {
          color: #1f2937;
        }

        .text-gray-600 {
          color: #4b5563;
        }

        .text-gray-500 {
          color: #6b7280;
        }

        .text-gray-400 {
          color: #9ca3af;
        }

        .text-gray-300 {
          color: #d1d5db;
        }

        .text-gray-200 {
          color: #e5e7eb;
        }

        .font-bold {
          font-weight: 700;
        }

        .font-semibold {
          font-weight: 600;
        }

        .text-xl {
          font-size: 1.25rem;
          line-height: 1.75rem;
        }

        .text-4xl {
          font-size: 2.25rem;
          line-height: 2.5rem;
        }

        .text-sm {
          font-size: 0.875rem;
          line-height: 1.25rem;
        }

        .text-xs {
          font-size: 0.75rem;
          line-height: 1rem;
        }

        .tracking-wider {
          letter-spacing: 0.05em;
        }

        .space-x-2 > * + * {
          margin-left: 0.5rem;
        }

        .opacity-50 {
          opacity: 0.5;
        }

        .opacity-30 {
          opacity: 0.3;
        }

        .opacity-20 {
          opacity: 0.2;
        }

        .transition-all {
          transition-property: all;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          transition-duration: 150ms;
        }

        .duration-300 {
          transition-duration: 300ms;
        }

        .ease-out {
          transition-timing-function: cubic-bezier(0, 0, 0.2, 1);
        }

        .text-transparent {
          color: transparent;
        }

        .bg-clip-text {
          -webkit-background-clip: text;
          background-clip: text;
        }

        .z-10 {
          z-index: 10;
        }

        .border-2 {
          border-width: 2px;
        }

        .border-pink-500 {
          border-color: #ec4899;
        }

        /* Gradient classes */
        .bg-gradient-to-r {
          background-image: linear-gradient(to right, var(--tw-gradient-stops));
        }

        .from-pink-500 {
          --tw-gradient-from: #ec4899;
          --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
        }

        .to-red-500 {
          --tw-gradient-to: #ef4444;
        }

        .from-pink-400 {
          --tw-gradient-from: #f472b6;
          --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
        }

        .to-orange-400 {
          --tw-gradient-to: #fb923c;
        }

        .from-pink-100 {
          --tw-gradient-from: #fce7f3;
          --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
        }

        .to-red-100 {
          --tw-gradient-to: #fee2e2;
        }

        /* Background colors for dots */
        .bg-pink-500 {
          background-color: #ec4899;
        }

        .bg-red-500 {
          background-color: #ef4444;
        }

        .bg-orange-500 {
          background-color: #f97316;
        }

        .bg-pink-400 {
          background-color: #f472b6;
        }

        .bg-gray-200 {
          background-color: #e5e7eb;
        }

        .bg-gray-300 {
          background-color: #d1d5db;
        }
      `}</style>
    </div>
  );
};

export default AILoader;