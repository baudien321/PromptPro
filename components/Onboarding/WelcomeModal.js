import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Button from '../Button'; // Assuming Button component exists

const ONBOARDING_STEPS = [
  {
    title: "Welcome to PromptPro!",
    text: "Save time and improve your AI results by organizing and sharing your prompts effectively.",
    buttons: ["start", "skip"]
  },
  {
    title: "1. Create & Save Prompts",
    text: "Click 'Create New Prompt' to write or paste your prompt text. Add a title and tags to keep things organized.",
    buttons: ["next", "skip"]
    // Optional: Add icon/image identifier
  },
  {
    title: "2. Copy & Use Anywhere",
    text: "Find your saved prompts in 'My Prompts'. Click the 'Copy' button to instantly grab the text and use it in ChatGPT, Claude, or any other AI tool.",
    buttons: ["next", "previous", "skip"]
    // Optional: Add icon/image identifier
  },
  {
    title: "3. Search & Filter Easily",
    text: "Use the search bar in the navigation or the filters in 'My Prompts' to quickly find the exact prompt you need by keyword or tag.",
    buttons: ["finish", "previous"]
    // Optional: Add icon/image identifier
  }
];

const WelcomeModal = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    setCurrentStep(0); // Reset step if closed midway
    onClose(); // Call the original onClose prop (which should mark onboarding complete)
  };

  const step = ONBOARDING_STEPS[currentStep];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative mx-auto p-6 sm:p-8 border w-full max-w-lg shadow-lg rounded-md bg-white">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          aria-label="Close onboarding modal"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        <div className="mt-3 text-center">
          {/* Progress Indicator (Optional but recommended) */}
          <div className="flex justify-center space-x-2 mb-4">
            {ONBOARDING_STEPS.slice(1).map((_, index) => ( // Slice(1) to exclude welcome step from dots
              <span
                key={index}
                className={`block h-2 w-2 rounded-full ${
                  currentStep === index + 1 ? 'bg-primary-600' : 'bg-gray-300'
                }`}
              ></span>
            ))}
          </div>

          <h3 className="text-xl sm:text-2xl leading-6 font-bold text-gray-900 mb-4">{step.title}</h3>
          <div className="mt-2 px-4 sm:px-7 py-3">
            <p className="text-sm sm:text-base text-gray-600">
              {step.text}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="items-center px-4 py-3 mt-4 space-y-3 sm:space-y-0 sm:flex sm:space-x-4 sm:justify-center">
            {step.buttons.includes("previous") && (
              <Button variant="secondary" onClick={handlePrevious} className="w-full sm:w-auto">Previous</Button>
            )}
            {step.buttons.includes("start") && (
              <Button onClick={handleNext} className="w-full sm:w-auto">Start Quick Tutorial</Button>
            )}
             {step.buttons.includes("next") && (
              <Button onClick={handleNext} className="w-full sm:w-auto">Next</Button>
            )}
            {step.buttons.includes("finish") && (
              <Button onClick={handleClose} className="w-full sm:w-auto">Finish</Button>
            )}
             {step.buttons.includes("skip") && (
              <Button variant="secondary" onClick={handleClose} className="w-full sm:w-auto">Skip Tutorial</Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeModal; 