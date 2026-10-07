import React from 'react';

export default function LoadingPage() {
  return (
    <div
      style={{
        minHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        fontFamily: 'var(--font-bengali), var(--font-english), sans-serif',
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          border: '4px solid #e2e8f0',
          borderTop: '4px solid #1b365d',
          borderRadius: '50%',
          animation: 'spin 0.85s linear infinite',
          marginBottom: '20px',
        }}
      />
      <h3
        style={{
          fontSize: '18px',
          fontWeight: 700,
          color: '#0f1d38',
          margin: '0 0 6px',
        }}
      >
        পৃষ্ঠাটি প্রস্তুত হচ্ছে...
      </h3>
      <p
        style={{
          fontSize: '13.5px',
          color: '#64748b',
          margin: 0,
        }}
      >
        সাহেরা নায়েব ল্যাবরেটরি হাই স্কুল ওয়েব পোর্টাল
      </p>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
