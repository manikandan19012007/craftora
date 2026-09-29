import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Heart, Sparkles, Users, Award, Truck, ArrowRight } from 'lucide-react';
import './About.css';

export default function About() {
  return (
    <div className="about-page">
      {/* 1. Hero */}
      <section className="about-hero">
        <div className="container about-hero-inner">
          <span className="about-pill">Our Artisan Story</span>
          <h1 className="about-headline">Bridging Traditional Crafts with Modern Homes</h1>
          <p className="about-subtitle">
            CRAFTORA is a curated digital marketplace designed to celebrate, empower, and sustain independent master artisans across India through customized handmade goods.
          </p>
        </div>
      </section>

      {/* 2. Mission & Values */}
      <section className="container about-mission-section">
        <div className="mission-grid">
          <div className="mission-card">
            <div className="mission-icon bg-terracotta"><Heart size={24} /></div>
            <h3>Fair Artisan Compensation</h3>
            <p>
              We eliminate exploitative middlemen so that master craftsmen and craftswomen receive up to 85% of each sale directly.
            </p>
          </div>

          <div className="mission-card">
            <div className="mission-icon bg-sage"><Sparkles size={24} /></div>
            <h3>Personalized Creations</h3>
            <p>
              Every custom engraving, hand-stitched monogram, and bespoke glaze bridges the personal narrative of the buyer with the hand of the creator.
            </p>
          </div>

          <div className="mission-card">
            <div className="mission-icon bg-gold"><ShieldCheck size={24} /></div>
            <h3>Authenticity Guaranteed</h3>
            <p>
              Each product listed on CRAFTORA undergoes rigorous artisan vetting, origin tracing, and comes with an authentic maker certificate.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Story Section */}
      <section className="container about-narrative-section">
        <div className="narrative-grid">
          <div className="narrative-image-frame">
            <img 
              src="https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80" 
              alt="Artisan shaping clay on wheel" 
            />
          </div>
          <div className="narrative-content">
            <span className="section-tag">Craftsmanship Over Mass Production</span>
            <h2>Why We Built CRAFTORA</h2>
            <p>
              In a world flooded with fast manufacturing, generic plastic decor, and factory duplicates, true human touch has become rare. Millions of hereditary artisans in India hold centuries of specialized wisdom in pottery, handlooms, woodwork, and metal casting.
            </p>
            <p>
              CRAFTORA was created as an e-marketing ecosystem where patrons can order personalized, one-of-a-kind handmade artifacts with complete transparency, transparent pricing in Indian Rupees, and direct artisan interaction.
            </p>
            <Link to="/products" className="btn btn-primary story-cta">
              <span>Explore the Collection</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Stats Banner */}
      <section className="about-stats-banner">
        <div className="container stats-flex">
          <div className="stat-unit">
            <strong>100%</strong>
            <span>Handmade & Sourced in India</span>
          </div>
          <div className="stat-unit">
            <strong>30+</strong>
            <span>Master Artisans Supported</span>
          </div>
          <div className="stat-unit">
            <strong>9</strong>
            <span>Heritage Craft Disciplines</span>
          </div>
          <div className="stat-unit">
            <strong>4.9 ★</strong>
            <span>Average Patron Review Score</span>
          </div>
        </div>
      </section>
    </div>
  );
}
