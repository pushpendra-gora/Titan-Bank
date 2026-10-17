import React, { useState, useEffect, useCallback } from 'react';
import { App as CapApp } from '@capacitor/app';
import { BankState, Transaction, Udhar, ActiveTab, FilterType, TxType } from './types';
import { loadInitialState, saveState, savePin, clearAllData } from './storage';
import { exportTransactionsPDF } from './pdfExport';
import { PinScreen } from './components/PinScreen';
import { PinChangeModal } from './components/PinChangeModal';
import { DeleteDataModal } from './components/DeleteDataModal';
import logoImg from './assets/logo.png';

const PLUS = ['in', 'liya', 'diya_back'];
const META: Record<string, [string, string]> = {
  in: ['Income', '+'],
  out: ['Expense', '−'],
  diya: ['Money Lent', '↗'],
  liya: ['Money Borrowed', '↙'],
  diya_back: ['Lent Repaid', '↙'],
  liya_back: ['Debt Repaid', '↗']
};

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const today = () => new Date().toISOString().slice(0, 10);
const inr = (n: number) => '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 2 });
const fdate = (d: string) => {
  try {
    return new Date(d + 'T00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return d;
  }
};

const I = {
  wallet: (
    <svg width="38" height="38" viewBox="0 0 24 24" fill="currentColor">
      <path d="M4 6.5A2.5 2.5 0 016.5 4H18l-.5 2H6.5a.5.5 0 000 1H19a2 2 0 012 2v8a2.5 2.5 0 01-2.5 2.5h-12A2.5 2.5 0 014 15.5v-9zM17 12.5a1.2 1.2 0 100 2.4 1.2 1.2 0 000-2.4z"/>
    </svg>
  ),
  plus: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
      <path d="M12 5v14M5 12h14"/>
    </svg>
  ),
  up: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 17L17 7M8 7h9v9"/>
    </svg>
  ),
  hand: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="6" r="3.5"/>
      <path d="M3 15h4l3 2h5a2 2 0 010 4H9l-6-1"/>
    </svg>
  ),
  arr: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 6l6 6-6 6"/>
    </svg>
  ),
  home: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 3l9 8h-3v9h-5v-6h-2v6H6v-9H3z"/>
    </svg>
  ),
  list: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="3" width="14" height="18" rx="2"/>
      <path d="M9 8h6M9 12h6M9 16h4"/>
    </svg>
  ),
  users: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="8" r="3.5"/>
      <path d="M2.5 20c0-3.5 3-6 6.5-6s6.5 2.5 6.5 6M16 4.5a3.5 3.5 0 010 7M18 14c2.2.6 3.5 2.6 3.5 5"/>
    </svg>
  ),
  settings: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z"/>
    </svg>
  ),
  bankLogo: (
    <img src={logoImg} alt="Titan Bank" className="logo" />
  )
};

export const App: React.FC = () => {
  const [isLocked, setIsLocked] = useState<boolean>(true);
  const [pin, setPin] = useState<string>('1506');
  const [state, setState] = useState<BankState>({ tx: [], ud: [] });
  const [tab, setTab] = useState<ActiveTab>('home');
  const [flt, setFlt] = useState<FilterType>('all');
  const [toastMsg, setToastMsg] = useState<string>('');
  const [showToast, setShowToast] = useState<boolean>(false);

  // Modals state
  const [showPinModal, setShowPinModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [activeModal, setActiveModal] = useState<'tx' | 'udhar' | 'repay' | null>(null);

  // Modal form fields
  const [txModalType, setTxModalType] = useState<'in' | 'out'>('in');
  const [udharKind, setUdharKind] = useState<'diya' | 'liya'>('diya');
  const [selectedUdhar, setSelectedUdhar] = useState<Udhar | null>(null);

  const [formAmount, setFormAmount] = useState<string>('');
  const [formNote, setFormNote] = useState<string>('');
  const [formPerson, setFormPerson] = useState<string>('');
  const [formDate, setFormDate] = useState<string>(today());

  const triggerToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2200);
  }, []);

  // Initialize data on mount
  useEffect(() => {
    loadInitialState().then(({ state: loadedState, pin: loadedPin }) => {
      setState(loadedState);
      setPin(loadedPin);
    });

    // Handle Android hardware back button
    const backListener = CapApp.addListener('backButton', () => {
      if (showPinModal || showDeleteModal || activeModal) {
        setShowPinModal(false);
        setShowDeleteModal(false);
        setActiveModal(null);
      } else if (tab !== 'home') {
        setTab('home');
      } else {
        CapApp.exitApp();
      }
    });

    return () => {
      backListener.then(l => l.remove());
    };
  }, [showPinModal, showDeleteModal, activeModal, tab]);

  // Save changes
  const updateState = (newState: BankState) => {
    setState(newState);
    saveState(newState);
  };

  const handleUpdatePin = (newPin: string) => {
    setPin(newPin);
    savePin(newPin);
  };

  const handleClearAllData = () => {
    clearAllData();
    setState({ tx: [], ud: [] });
    setTab('home');
  };

  // Balance and aggregates calculation
  const eff = (t: Transaction) => (PLUS.includes(t.type) ? t.amt : -t.amt);
  const bal = () => state.tx.reduce((a, t) => a + eff(t), 0);
  const sum = (fn: (t: Transaction) => boolean) => state.tx.filter(fn).reduce((a, t) => a + t.amt, 0);
  const pend = (k: 'diya' | 'liya') => state.ud.filter(u => u.kind === k).reduce((a, u) => a + u.amt - u.paid, 0);

  const numVal = (v: string): number | null => {
    const n = parseFloat(v);
    if (!(n > 0)) {
      triggerToast('Please enter a valid amount');
      return null;
    }
    return Math.round(n * 100) / 100;
  };

  // Modal open helpers
  const openAddTx = (type: 'in' | 'out') => {
    setTxModalType(type);
    setFormAmount('');
    setFormNote('');
    setFormDate(today());
    setActiveModal('tx');
  };

  const openAddUdhar = (k: 'diya' | 'liya') => {
    setUdharKind(k);
    setFormAmount('');
    setFormPerson('');
    setFormNote('');
    setFormDate(today());
    setActiveModal('udhar');
  };

  const openRepay = (u: Udhar) => {
    setSelectedUdhar(u);
    const left = Math.round((u.amt - u.paid) * 100) / 100;
    setFormAmount(left.toString());
    setFormDate(today());
    setActiveModal('repay');
  };

  const handleSaveTx = (e: React.FormEvent) => {
    e.preventDefault();
    const a = numVal(formAmount);
    if (!a) return;

    const newTx: Transaction = {
      id: uid(),
      type: txModalType,
      amt: a,
      note: formNote.trim(),
      date: formDate || today()
    };

    updateState({ ...state, tx: [...state.tx, newTx] });
    setActiveModal(null);
    triggerToast(txModalType === 'in' ? 'Money added successfully' : 'Expense saved successfully');
  };

  const handleSaveUdhar = (e: React.FormEvent) => {
    e.preventDefault();
    const a = numVal(formAmount);
    if (!a) return;
    if (!formPerson.trim()) {
      triggerToast('Please enter a name');
      return;
    }

    const id = uid();
    const date = formDate || today();
    const person = formPerson.trim();
    const note = formNote.trim();

    const newUd: Udhar = {
      id,
      kind: udharKind,
      person,
      amt: a,
      paid: 0,
      note,
      date
    };

    const newTx: Transaction = {
      id: uid(),
      type: udharKind,
      amt: a,
      person,
      note,
      date,
      uid: id
    };

    updateState({
      ...state,
      ud: [...state.ud, newUd],
      tx: [...state.tx, newTx]
    });

    setActiveModal(null);
    triggerToast('Saved successfully');
  };

  const handleSaveRepay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUdhar) return;
    const a = numVal(formAmount);
    if (!a) return;

    const left = Math.round((selectedUdhar.amt - selectedUdhar.paid) * 100) / 100;
    if (a > left + 0.001) {
      triggerToast('Amount cannot exceed remaining balance');
      return;
    }

    const updatedPaid = Math.round((selectedUdhar.paid + a) * 100) / 100;
    const isDiya = selectedUdhar.kind === 'diya';

    const updatedUd = state.ud.map(u => (u.id === selectedUdhar.id ? { ...u, paid: updatedPaid } : u));
    const newTx: Transaction = {
      id: uid(),
      type: (isDiya ? 'diya_back' : 'liya_back') as TxType,
      amt: a,
      person: selectedUdhar.person,
      date: formDate || today(),
      uid: selectedUdhar.id
    };

    updateState({
      ...state,
      ud: updatedUd,
      tx: [...state.tx, newTx]
    });

    setActiveModal(null);
    triggerToast('Updated successfully');
  };

  // If locked, render Lock Screen (PIN verification)
  if (isLocked) {
    return <PinScreen correctPin={pin} onSuccess={() => setIsLocked(false)} />;
  }

  // Calculate stats for views
  const b = bal();
  const inc = sum(t => t.type === 'in');
  const exp = sum(t => t.type === 'out');
  const recent = [...state.tx].sort((x, y) => y.date.localeCompare(x.date) || y.id.localeCompare(x.id)).slice(0, 5);

  const txRow = (t: Transaction) => {
    const p = PLUS.includes(t.type);
    const m = META[t.type] || ['Other', '•'];
    const col = p ? 'pos' : 'neg';
    const bg = p ? '#dcf5e3' : '#fde2e2';

    return (
      <div key={t.id} className="row">
        <div className={`dot ${col}`} style={{ background: bg }}>
          {m[1]}
        </div>
        <div className="t">
          <b>{t.note || t.person || m[0]}</b>
          <span>
            {m[0]}
            {t.person && t.note ? ' • ' + t.person : ''} • {fdate(t.date)}
          </span>
        </div>
        <div className={`v ${col}`}>
          {p ? '+' : '−'}
          {inr(t.amt)}
        </div>
      </div>
    );
  };

  return (
    <div id="app">
      {/* Header */}
      <header>
        {I.bankLogo}
        <div className="grow">
          <h1>Titan Bank</h1>
        </div>
        <button className="icon-btn" onClick={() => setTab('more')} aria-label="Settings">
          {I.settings}
        </button>
      </header>

      {/* Main Content Views */}
      <main id="view">
        {/* Tab 1: HOME */}
        {tab === 'home' && (
          <>
            <section className="card hero">
              <div className="wal">{I.wallet}</div>
              <div className="lbl">Total Balance</div>
              <div className={`amt ${b < 0 ? 'neg' : ''}`}>
                {b < 0 ? '−' : ''}
                {inr(Math.abs(b))}
              </div>
              <div className="sub">All your money in one place</div>
              <div className="stats">
                <div className="stat">
                  Income<b className="pos">{inr(inc)}</b>
                </div>
                <div className="stat">
                  Expenses<b className="neg">{inr(exp)}</b>
                </div>
                <div className="stat">
                  To Receive<b>{inr(pend('diya'))}</b>
                </div>
                <div className="stat">
                  To Pay<b>{inr(pend('liya'))}</b>
                </div>
              </div>
            </section>

            <div className="grid">
              <button className="act a-add" onClick={() => openAddTx('in')}>
                <div className="ic">{I.plus}</div>
                <h3>Add Money</h3>
                <p>Add income to your account</p>
                <span className="go">{I.arr}</span>
              </button>
              <button className="act a-out" onClick={() => openAddTx('out')}>
                <div className="ic">{I.up}</div>
                <h3>Spend Money</h3>
                <p>Track your expenses</p>
                <span className="go">{I.arr}</span>
              </button>
              <button className="act a-diya" onClick={() => setTab('diya')}>
                <div className="ic">{I.hand}</div>
                <h3>Money Lent</h3>
                <p>Money you gave to others</p>
                <span className="go">{I.arr}</span>
              </button>
              <button className="act a-liya" onClick={() => setTab('liya')}>
                <div className="ic">{I.hand}</div>
                <h3>Money Borrowed</h3>
                <p>Money you received from others</p>
                <span className="go">{I.arr}</span>
              </button>
            </div>

            <h2>Recent Transactions</h2>
            <div className="card">
              {recent.length ? (
                recent.map(txRow)
              ) : (
                <div className="empty">No transactions yet. Start by adding money.</div>
              )}
            </div>
          </>
        )}

        {/* Tab 2: TRANSACTIONS */}
        {tab === 'txn' && (
          <>
            <h2 style={{ marginTop: '6px' }}>Transactions</h2>
            <div className="chips">
              {[
                ['all', 'All'],
                ['in', 'Income'],
                ['out', 'Expenses'],
                ['udhar', 'Lent & Borrowed']
              ].map(([k, label]) => (
                <button
                  key={k}
                  className={`chip ${flt === k ? 'on' : ''}`}
                  onClick={() => setFlt(k as FilterType)}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="card">
              {(() => {
                let l = [...state.tx].sort((x, y) => y.date.localeCompare(x.date) || y.id.localeCompare(x.id));
                if (flt === 'in') l = l.filter(t => t.type === 'in');
                else if (flt === 'out') l = l.filter(t => t.type === 'out');
                else if (flt === 'udhar') l = l.filter(t => t.uid);

                return l.length ? l.map(txRow) : <div className="empty">No transactions found.</div>;
              })()}
            </div>
          </>
        )}

        {/* Tab 3 & 4: UDHAR DIYA / UDHAR LIYA */}
        {(tab === 'diya' || tab === 'liya') && (
          <>
            <h2 style={{ marginTop: '6px' }}>{tab === 'diya' ? 'Money Lent (Given)' : 'Money Borrowed (Taken)'}</h2>
            <div className="card" style={{ padding: '16px', marginBottom: '14px' }}>
              <div style={{ color: 'var(--mute)', fontSize: '13px' }}>
                {tab === 'diya' ? 'Pending to receive from others' : 'Pending to return to others'}
              </div>
              <div
                style={{
                  fontSize: '32px',
                  fontWeight: 900,
                  color: tab === 'diya' ? 'var(--blue)' : 'var(--purple)'
                }}
              >
                {inr(pend(tab))}
              </div>
            </div>

            <button
              className="btn"
              style={{
                background: tab === 'diya' ? 'var(--blue)' : 'var(--purple)',
                marginBottom: '14px'
              }}
              onClick={() => openAddUdhar(tab)}
            >
              + Add {tab === 'diya' ? 'Money Lent' : 'Money Borrowed'}
            </button>

            {(() => {
              const list = state.ud
                .filter(u => u.kind === tab)
                .sort(
                  (x, y) =>
                    (x.amt - x.paid <= 0 ? 1 : 0) - (y.amt - y.paid <= 0 ? 1 : 0) ||
                    y.date.localeCompare(x.date)
                );
              const col = tab === 'diya' ? 'var(--blue)' : 'var(--purple)';

              return list.length ? (
                list.map(u => {
                  const left = Math.round((u.amt - u.paid) * 100) / 100;
                  const done = left <= 0;
                  const pc = Math.min(100, (u.paid / u.amt) * 100);

                  return (
                    <div key={u.id} className="card person" style={{ marginBottom: '12px' }}>
                      <div className="top">
                        <div className="dot" style={{ background: col, color: '#fff' }}>
                          {u.person[0]?.toUpperCase() || 'U'}
                        </div>
                        <div className="t grow">
                          <b>{u.person}</b>
                          <span style={{ fontSize: '12px', color: 'var(--mute)' }}>
                            {fdate(u.date)}
                            {u.note ? ' • ' + u.note : ''}
                          </span>
                        </div>
                        <span className={`badge ${done ? 'b-d' : 'b-p'}`}>
                          {done ? 'Settled' : 'Pending'}
                        </span>
                      </div>
                      <div className="bar">
                        <i style={{ width: `${pc}%`, background: col }}></i>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '13px',
                          color: 'var(--mute)'
                        }}
                      >
                        <span>Total {inr(u.amt)}</span>
                        <span>
                          {tab === 'diya' ? 'Received' : 'Paid'} {inr(u.paid)}
                        </span>
                        <b style={{ color: 'var(--ink)' }}>Remaining {inr(left)}</b>
                      </div>
                      <div className="acts" style={{ marginTop: '10px' }}>
                        {!done && (
                          <button
                            className="btn sm"
                            style={{ background: col }}
                            onClick={() => openRepay(u)}
                          >
                            {tab === 'diya' ? 'Receive Payment' : 'Pay Back'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="card empty">
                  {tab === 'diya' ? 'No money lent records yet.' : 'No borrowed money records yet.'}
                </div>
              );
            })()}
          </>
        )}

        {/* Tab 5: MORE / SETTINGS */}
        {tab === 'more' && (
          <>
            <h2 style={{ marginTop: '6px' }}>Settings & More</h2>
            <div className="card menu">
              <button
                onClick={() => {
                  const ok = exportTransactionsPDF(state.tx);
                  if (ok) {
                    triggerToast('PDF downloaded successfully!');
                  } else {
                    triggerToast('No transactions to export');
                  }
                }}
              >
                <span style={{ fontSize: '20px' }}>📄</span>
                <span>Download Transactions PDF</span>
              </button>

              <button onClick={() => setShowPinModal(true)}>
                <span style={{ fontSize: '20px' }}>🔑</span>
                <span>Change Security PIN</span>
              </button>

              <button onClick={() => setIsLocked(true)}>
                <span style={{ fontSize: '20px' }}>🔒</span>
                <span>Lock App Now</span>
              </button>

              <button className="danger-menu" onClick={() => setShowDeleteModal(true)}>
                <span style={{ fontSize: '20px' }}>🗑️</span>
                <span>Delete / Reset All Data</span>
              </button>
            </div>
            <p
              style={{
                textAlign: 'center',
                color: 'var(--mute)',
                fontSize: '12px',
                marginTop: '18px',
                lineHeight: 1.5
              }}
            >
              Titan Bank • {state.tx.length} transactions • 100% Offline Storage
              <br />
              (Data remains completely safe even if device restarts)
            </p>
          </>
        )}
      </main>

      {/* Floating Bottom Nav */}
      <nav id="nav">
        {[
          { key: 'home', label: 'Home', icon: I.home },
          { key: 'txn', label: 'Transactions', icon: I.list },
          { key: 'diya', label: 'Lent', icon: I.users },
          { key: 'liya', label: 'Borrowed', icon: I.hand }
        ].map(item => (
          <button
            key={item.key}
            className={tab === item.key ? 'on' : ''}
            onClick={() => {
              setTab(item.key as ActiveTab);
              window.scrollTo(0, 0);
            }}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      {/* Modals */}
      {/* 1. Add / Spend Money Modal */}
      {activeModal === 'tx' && (
        <div className="mask show" onClick={e => { if (e.target === e.currentTarget) setActiveModal(null); }}>
          <div className="sheet">
            <h3>{txModalType === 'in' ? 'Add Money' : 'Spend Money'}</h3>
            <form onSubmit={handleSaveTx}>
              <label htmlFor="f_amt">Amount (₹)</label>
              <input
                id="f_amt"
                type="number"
                step="0.01"
                inputMode="decimal"
                value={formAmount}
                onChange={e => setFormAmount(e.target.value)}
                placeholder="0"
                autoFocus
                required
              />

              <label htmlFor="f_note">
                {txModalType === 'in' ? 'Source (Salary, Gift, etc.)' : 'Expense Category (Food, Bills, etc.)'}
              </label>
              <input
                id="f_note"
                type="text"
                value={formNote}
                onChange={e => setFormNote(e.target.value)}
                placeholder={txModalType === 'in' ? 'Salary' : 'Groceries / Bills'}
              />

              <label htmlFor="f_date">Date</label>
              <input
                id="f_date"
                type="date"
                value={formDate}
                onChange={e => setFormDate(e.target.value)}
                required
              />

              <div className="two">
                <button type="button" className="btn ghost" onClick={() => setActiveModal(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Udhar Diya / Liya Modal */}
      {activeModal === 'udhar' && (
        <div className="mask show" onClick={e => { if (e.target === e.currentTarget) setActiveModal(null); }}>
          <div className="sheet">
            <h3>{udharKind === 'diya' ? 'Add Money Lent' : 'Add Money Borrowed'}</h3>
            <form onSubmit={handleSaveUdhar}>
              <label htmlFor="f_person">{udharKind === 'diya' ? 'Given To (Person Name)' : 'Borrowed From (Person Name)'}</label>
              <input
                id="f_person"
                type="text"
                value={formPerson}
                onChange={e => setFormPerson(e.target.value)}
                placeholder="Person Name"
                autoFocus
                required
              />

              <label htmlFor="f_amt">Amount (₹)</label>
              <input
                id="f_amt"
                type="number"
                step="0.01"
                inputMode="decimal"
                value={formAmount}
                onChange={e => setFormAmount(e.target.value)}
                placeholder="0"
                required
              />

              <label htmlFor="f_note">Note (optional)</label>
              <input
                id="f_note"
                type="text"
                value={formNote}
                onChange={e => setFormNote(e.target.value)}
                placeholder="Details"
              />

              <label htmlFor="f_date">Date</label>
              <input
                id="f_date"
                type="date"
                value={formDate}
                onChange={e => setFormDate(e.target.value)}
                required
              />

              <div className="two">
                <button type="button" className="btn ghost" onClick={() => setActiveModal(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Repay Udhar Modal */}
      {activeModal === 'repay' && selectedUdhar && (
        <div className="mask show" onClick={e => { if (e.target === e.currentTarget) setActiveModal(null); }}>
          <div className="sheet">
            <h3>
              {selectedUdhar.kind === 'diya'
                ? `Received back from ${selectedUdhar.person}`
                : `Paid back to ${selectedUdhar.person}`}
            </h3>
            <form onSubmit={handleSaveRepay}>
              <label htmlFor="f_amt">
                Amount (₹) — Remaining {inr(Math.round((selectedUdhar.amt - selectedUdhar.paid) * 100) / 100)}
              </label>
              <input
                id="f_amt"
                type="number"
                step="0.01"
                inputMode="decimal"
                value={formAmount}
                onChange={e => setFormAmount(e.target.value)}
                autoFocus
                required
              />

              <label htmlFor="f_date">Date</label>
              <input
                id="f_date"
                type="date"
                value={formDate}
                onChange={e => setFormDate(e.target.value)}
                required
              />

              <div className="two">
                <button type="button" className="btn ghost" onClick={() => setActiveModal(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. PIN Change Modal */}
      {showPinModal && (
        <PinChangeModal
          currentPin={pin}
          onSave={handleUpdatePin}
          onClose={() => setShowPinModal(false)}
          showToast={triggerToast}
        />
      )}

      {/* 5. Delete Data with PIN Modal */}
      {showDeleteModal && (
        <DeleteDataModal
          currentPin={pin}
          onConfirmDelete={handleClearAllData}
          onClose={() => setShowDeleteModal(false)}
          showToast={triggerToast}
        />
      )}

      {/* Toast Notification */}
      <div className={`toast ${showToast ? 'show' : ''}`}>{toastMsg}</div>
    </div>
  );
};
