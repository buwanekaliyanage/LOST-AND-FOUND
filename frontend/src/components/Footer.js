import React from 'react';

export default function Footer() {
  return (
    <footer className="footer">
      <p style={{ color: 'rgba(255,255,255,0.8)', fontFamily: "'Fraunces',serif", fontSize: '1.1rem', marginBottom: '0.5rem' }}>
        Lost &amp; Found
      </p>
      <div className="footer-links">
        <a href="#!">Customer Support</a>
        <span style={{ color: '#334155' }}>|</span>
        <a href="#!">Terms &amp; Conditions</a>
        <span style={{ color: '#334155' }}>|</span>
        <a href="#!">Privacy Policy</a>
      </div>
      <p style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
        © 2026 FINDRA - Lost and Found. All Rights Reserved. |{' '}
        <a href="mailto:buwanekaliyanageb@gmail.com">bgenx@gmail.com</a>
        {' '}| +94 779171657
      </p>
    </footer>
  );
}
