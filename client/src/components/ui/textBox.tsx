import React from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';

interface TextboxProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  className?: string;
  register: UseFormRegisterReturn;
  error?: string;
}

const Textbox: React.FC<TextboxProps> = ({ label, name, type = 'text', placeholder, className, register, error }) => {
  return (
    <div className="flex flex-col">
      <label htmlFor={name} className="mb-1 font-semibold text-gray-700">{label}</label>
      <input
        id={name}
        type={type}
        placeholder={placeholder}
        className={`${className} border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
        {...register}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default Textbox;
