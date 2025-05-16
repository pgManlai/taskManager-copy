import React from 'react';

interface ButtonProps {
  type?: 'button' | 'submit' | 'reset';
  label: string;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
}

const Button2: React.FC<ButtonProps> = ({ type = 'button', label, className, onClick, disabled = false }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`${className} disabled:opacity-50 disabled:cursor-not-allowed`}
      disabled={disabled}
    >
      {label}
    </button>
  );
};

export default Button2;
