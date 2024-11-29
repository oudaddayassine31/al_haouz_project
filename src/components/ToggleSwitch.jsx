import React from 'react';

const Switch = ({ id, checked, onCheckedChange }) => {
  return (
    <div className="inline-flex">
      <label 
        className="relative inline-block w-11 h-6 cursor-pointer"
        htmlFor={id}
      >
        <input
          type="checkbox"
          id={id}
          className="sr-only peer"
          checked={checked}
          onChange={(e) => onCheckedChange(e.target.checked)}
        />
        <div className={`
          absolute inset-0 rounded-full transition
          peer-checked:bg-blue-600 bg-gray-200
          peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300
        `}>
          <div className={`
            absolute left-[2px] top-[2px] h-5 w-5
            rounded-full bg-white transition-transform duration-200
            peer-checked:translate-x-5
          `}/>
        </div>
      </label>
    </div>
  );
};

const Label = ({ htmlFor, children }) => (
  <label 
    htmlFor={htmlFor}
    className="text-sm font-medium text-gray-700 ml-2 cursor-pointer"
  >
    {children}
  </label>
);

export { Switch, Label };