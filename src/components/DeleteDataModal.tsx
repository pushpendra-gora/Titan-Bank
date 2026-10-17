import React, { useState } from 'react';

interface DeleteDataModalProps {
  currentPin: string;
  onConfirmDelete: () => void;
  onClose: () => void;
  showToast: (msg: string) => void;
}

export const DeleteDataModal: React.FC<DeleteDataModalProps> = ({
  currentPin,
  onConfirmDelete,
  onClose,
  showToast,
}) => {
  const [pinInput, setPinInput] = useState('');

  const handleDelete = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput !== currentPin) {
      showToast('Incorrect PIN! Data was not deleted.');
      return;
    }
    onConfirmDelete();
    showToast('All data successfully deleted!');
    onClose();
  };

  return (
    <div className="mask show" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="sheet">
        <h3 style={{ color: 'var(--red)' }}>⚠️ Delete All Data?</h3>
        <p style={{ color: 'var(--mute)', fontSize: '13.5px', marginTop: 0, lineHeight: 1.4 }}>
          This will permanently delete all your transactions and credit/debt history. Enter your 4-digit PIN to proceed:
        </p>

        <form onSubmit={handleDelete}>
          <label htmlFor="confirmDeletePin">Enter Security PIN</label>
          <input
            id="confirmDeletePin"
            type="password"
            maxLength={4}
            inputMode="numeric"
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder="****"
            autoFocus
            required
          />

          <div className="two">
            <button type="button" className="btn ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn danger">
              Yes, Delete All
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
