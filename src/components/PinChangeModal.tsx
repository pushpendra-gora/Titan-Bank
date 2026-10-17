import React, { useState } from 'react';

interface PinChangeModalProps {
  currentPin: string;
  onSave: (newPin: string) => void;
  onClose: () => void;
  showToast: (msg: string) => void;
}

export const PinChangeModal: React.FC<PinChangeModalProps> = ({
  currentPin,
  onSave,
  onClose,
  showToast,
}) => {
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (oldPin !== currentPin) {
      showToast('Current PIN is incorrect');
      return;
    }
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      showToast('New PIN must be 4 digits');
      return;
    }
    if (newPin !== confirmPin) {
      showToast('New PINs do not match');
      return;
    }
    onSave(newPin);
    showToast('PIN changed successfully!');
    onClose();
  };

  return (
    <div className="mask show" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="sheet">
        <h3>Change Security PIN</h3>
        <form onSubmit={handleSubmit}>
          <label htmlFor="oldPin">Current 4-Digit PIN</label>
          <input
            id="oldPin"
            type="password"
            maxLength={4}
            inputMode="numeric"
            value={oldPin}
            onChange={(e) => setOldPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder="****"
            autoFocus
            required
          />

          <label htmlFor="newPin">New 4-Digit PIN</label>
          <input
            id="newPin"
            type="password"
            maxLength={4}
            inputMode="numeric"
            value={newPin}
            onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder="****"
            required
          />

          <label htmlFor="confirmPin">Confirm New PIN</label>
          <input
            id="confirmPin"
            type="password"
            maxLength={4}
            inputMode="numeric"
            value={confirmPin}
            onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder="****"
            required
          />

          <div className="two">
            <button type="button" className="btn ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn">
              Save PIN
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
