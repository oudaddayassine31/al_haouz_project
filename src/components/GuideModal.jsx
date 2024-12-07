import { Dialog } from "@headlessui/react";
import { X } from "lucide-react";
import { useState } from "react";

export default function GuideModal({ steps, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);

  return (
    <Dialog open={true} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto w-full max-w-md rounded-xl bg-white p-6">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-lg font-medium text-gray-900">
              {steps[currentStep].title}
            </Dialog.Title>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <X className="h-5 w-5" />
            </button>
          </div>

          <Dialog.Description className="mt-2 text-sm text-gray-500 whitespace-pre-line">
            {steps[currentStep].description}
          </Dialog.Description>

          <div className="mt-8 flex justify-between items-center">
            <div className="flex gap-2">
              {steps.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-2 w-2 rounded-full ${
                    idx === currentStep ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            <div className="flex gap-2">
              {currentStep > 0 && (
                <button
                  onClick={() => setCurrentStep(prev => prev - 1)}
                  className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900"
                >
                  Précédent
                </button>
              )}
              
              {currentStep < steps.length - 1 ? (
                <button
                  onClick={() => setCurrentStep(prev => prev + 1)}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                >
                  Suivant
                </button>
              ) : (
                <button
                  onClick={onClose}
                  className="px-3 py-1.5 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
                >
                  Commencer l'exploration
                </button>
              )}
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}

{showGuide && (
  <GuideModal 
    steps={guideSteps}
    onClose={() => setShowGuide(false)}
  />
)}