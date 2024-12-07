import React from 'react';
import { Menu as HeadlessMenu } from '@headlessui/react';
import { ChevronDownIcon } from 'lucide-react';

export const Menu = ({ value, onChange, options, placeholder = 'Sélectionner' }) => {
  return (
    <HeadlessMenu as="div" className="relative">
      <HeadlessMenu.Button className="w-full px-3 py-2 text-sm bg-white border rounded-md hover:bg-gray-50 flex items-center justify-between">
        {value || placeholder}
        <ChevronDownIcon className="w-5 h-5 text-gray-400" />
      </HeadlessMenu.Button>

      <HeadlessMenu.Items className="absolute w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto z-20">
        {options.map((option) => (
          <HeadlessMenu.Item key={option}>
            {({ active }) => (
              <button
                className={`w-full px-4 py-2 text-sm text-left ${
                  active ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                }`}
                onClick={() => onChange(option)}
              >
                {option}
              </button>
            )}
          </HeadlessMenu.Item>
        ))}
      </HeadlessMenu.Items>
    </HeadlessMenu>
  );
};