import React, { useState } from 'react';
import logoImg from '../assets/logo.png';

interface PinScreenProps {
  correctPin: string;
  onSuccess: () => void;
}

export const PinScreen: React.FC<PinScreenProps> = ({ correctPin, onSuccess }) => {
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isShaking, setIsShaking] = useState<boolean>(false);

  const handleDigit = (digit: string) => {
    if (pin.length >= 4) return;
    const newPin = pin + digit;
    setPin(newPin);
    setError('');

    if (newPin.length === 4) {
      if (newPin === correctPin) {
        setTimeout(() => {
          onSuccess();
        }, 150);
      } else {
        setIsShaking(true);
        setError('Incorrect PIN! Please try again.');
        setTimeout(() => {
          setPin('');
          setIsShaking(false);
        }, 600);
      }
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
    setError('');
  };

  const handleClear = () => {
    setPin('');
    setError('');
  };

  return (
    <div className="pin-screen">
      <div className="pin-header">
        <div className="logo-wrap">
          <img src={logoImg} alt="Titan Bank" className="pin-logo" />
        </div>
        <h1>Titan Bank</h1>
        <p>Enter your 4-Digit Security PIN</p>

        <div className={`pin-dots-container ${isShaking ? 'shake' : ''}`}>
          {[0, 1, 2, 3].map(i => (
            <div key={i} className={`pin-dot ${i < pin.length ? 'filled' : ''}`} />
          ))}
        </div>

        <div className="pin-error">{error}</div>
      </div>

      <div className="pin-keypad">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
          <button key={num} type="button" className="pin-key" onClick={() => handleDigit(num)}>
            {num}
          </button>
        ))}
        <button type="button" className="pin-key ghost" onClick={handleClear}>
          C
        </button>
        <button type="button" className="pin-key" onClick={() => handleDigit('0')}>
          0
        </button>
        <button type="button" className="pin-key ghost" onClick={handleBackspace} aria-label="Backspace">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 4H8l-7 8 7 8h13a2 2 0 002-2V6a2 2 0 00-2-2z"/>
            <line x1="18" y1="9" x2="12" y2="15"/>
            <line x1="12" y1="9" x2="18" y2="15"/>
          </svg>
        </button>
      </div>

      <div className="security-badge">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0110 0v4"/>
        </svg>
        <span>100% Offline & Secure</span>
      </div>
    </div>
  );
};
