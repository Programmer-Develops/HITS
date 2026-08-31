import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function Privacy() {
  const { lang } = useLanguage();

  return (
    <div className="page" style={{ padding: '40px 32px', maxWidth: '800px', margin: '0 auto' }}>
      <div className="page-header" style={{ padding: 0, marginBottom: '24px' }}>
        <h1 className="page-title">Privacy Policy — HITS Sanitation Bot</h1>
        <p className="page-sub">Last updated: August 2026</p>
      </div>

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '24px', lineHeight: '1.7', fontSize: '14px', color: 'var(--text-secondary)' }}>
        <h3 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>1. Introduction</h3>
        <p style={{ marginBottom: '16px' }}>
          HITS Sanitation Bot ("we", "our") is designed exclusively for monitoring school cleanliness and hygiene management in Delhi Government Schools. We are committed to protecting the privacy of sanitation staff and school administrators.
        </p>

        <h3 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>2. Data We Collect</h3>
        <p style={{ marginBottom: '16px' }}>
          We collect only the minimum necessary data to function:
          <br />• Phone numbers of registered sanitation workers.
          <br />• Cleanliness proof photos sent by staff via WhatsApp.
          <br />• Timestamps and toilet block location logs.
        </p>

        <h3 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>3. How We Use Data</h3>
        <p style={{ marginBottom: '16px' }}>
          Data is used solely for maintaining school hygiene logs, updating real-time admin dashboards for Head of Schools (Principals), and generating internal cleanliness compliance reports.
        </p>

        <h3 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>4. Data Protection</h3>
        <p style={{ marginBottom: '16px' }}>
          Photos and records are securely stored on encrypted cloud databases. We never share, sell, or disclose personal data to third parties or commercial entities.
        </p>

        <h3 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>5. Contact Us</h3>
        <p>
          For privacy inquiries regarding HITS Sanitation System, contact: <strong>shantanupandya3@gmail.com</strong>
        </p>
      </div>
    </div>
  );
}
