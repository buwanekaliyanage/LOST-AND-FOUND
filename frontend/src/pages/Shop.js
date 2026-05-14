import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Check, ShoppingCart } from 'lucide-react';
import './Shop.css';

const packs = [
  {
    title: '1 QR Sticker',
    subtitle: 'Perfect for a single item or small accessory',
    price: '350 LKR',
    details: ['One durable QR sticker', 'Instant lost item access', 'Easy to attach'],
  },
  {
    title: '3-Pack QR Stickers',
    subtitle: 'Ideal for multiple items or family use',
    price: '990 LKR',
    details: ['Three QR stickers', 'Saved value bundle', 'Works with all item types'],
  },
  {
    title: '5-Pack QR Stickers',
    subtitle: 'Great for daily essentials and travel gear',
    price: '1,500 LKR',
    details: ['Five QR stickers', 'Bulk discount pricing', 'High-quality printing'],
  },
  {
    title: '12-Pack QR Stickers',
    subtitle: 'Best for offices, clubs, or larger households',
    price: '3,600 LKR',
    details: ['Twelve QR stickers', 'Lowest price per sticker', 'Perfect for many items'],
  },
];

export default function Shop() {
  return (
    <div className="shop-page">
      <Navbar />

      <section className="shop-hero">
        <div className="shop-hero-inner">

          <h1>Find the right QR pack for your items</h1>
          <p>
            Keep your belongings protected with durable QR stickers. Choose from single stickers or
            value bundles, and help lost items return faster through FINDRA's QR tracking.
          </p>
        </div>
      </section>

      <section className="shop-offers">
        <div className="shop-section-header">
          <h2>QR Sticker Packages</h2>
          <p>Simple pricing, easy use, and fast setup for every item you want to protect.</p>
        </div>

        <div className="shop-grid">
          {packs.map((pack) => (
            <div className="shop-card" key={pack.title}>
              <div className="shop-card-top">
                <h3>{pack.title}</h3>
                <p>{pack.subtitle}</p>
              </div>
              <div className="shop-price">{pack.price}</div>
              <ul>
                {pack.details.map((detail) => (
                  <li key={detail} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Check size={16} color="var(--primary)" /> {detail}
                  </li>
                ))}
              </ul>
              <button className="btn btn-green" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <ShoppingCart size={18} /> Order Now
              </button>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
