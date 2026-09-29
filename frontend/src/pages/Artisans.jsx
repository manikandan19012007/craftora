import React, { useState, useEffect } from 'react';
import { Search, Sparkles, Filter, Users, MapPin, Award } from 'lucide-react';
import { getArtisans } from '../services/api';
import ArtisanCard from '../components/ArtisanCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import './Artisans.css';

const CRAFT_FILTERS = [
  'All',
  'Clay Pottery',
  'Wood Carving',
  'Handloom Weaving',
  'Brass & Metal',
  'Madhubani Art',
  'Leathercraft',
  'Terracotta',
  'Stone Craft',
  'Bamboo Craft'
];

export default function Artisans() {
  const [artisans, setArtisans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCraft, setSelectedCraft] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchArtisansList = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (selectedCraft && selectedCraft !== 'All') {
        params.craft = selectedCraft;
      }
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      const data = await getArtisans(params);
      setArtisans(data.artisans || []);
    } catch (err) {
      setError(err.message || 'Failed to load artisans directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArtisansList();
  }, [selectedCraft]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchArtisansList();
  };

  const handleResetFilters = () => {
    setSelectedCraft('All');
    setSearchQuery('');
  };

  return (
    <div className="craftora-artisans-page">
      {/* Banner */}
      <section className="artisans-hero-banner">
        <div className="container">
          <div className="artisans-hero-content">
            <span className="artisans-hero-pill">
              <Sparkles size={16} /> Guardians of Indian Heritage
            </span>
            <h1 className="artisans-hero-title">Meet Our Master Artisans</h1>
            <p className="artisans-hero-subtitle">
              Every handcrafted piece tells a generational story. Discover the skilled hands, 
              ancient techniques, and rural craft clusters bringing timeless Indian traditions to life.
            </p>

            {/* Search Box */}
            <form className="artisans-search-form" onSubmit={handleSearchSubmit}>
              <Search className="search-icon" size={20} />
              <input 
                type="text"
                placeholder="Search artisan by name, craft, or city/state (e.g. Khurja, Varanasi)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="artisans-search-input"
              />
              <button type="submit" className="artisans-search-btn">
                Search
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Main Section */}
      <div className="container artisans-main-container">
        {/* Craft filter bar */}
        <div className="craft-filter-bar">
          <div className="craft-filter-heading">
            <Filter size={18} />
            <span>Filter by Craft:</span>
          </div>
          <div className="craft-chips-wrap">
            {CRAFT_FILTERS.map((craft) => (
              <button
                key={craft}
                type="button"
                className={`craft-chip ${selectedCraft === craft ? 'active' : ''}`}
                onClick={() => setSelectedCraft(craft)}
              >
                {craft}
              </button>
            ))}
          </div>
        </div>

        {/* Directory Stats */}
        <div className="artisans-meta-header">
          <div className="artisans-count">
            <Users size={18} />
            <span>
              Showing <strong>{artisans.length}</strong> master {artisans.length === 1 ? 'artisan' : 'artisans'}
              {selectedCraft !== 'All' && ` in ${selectedCraft}`}
            </span>
          </div>
          {(selectedCraft !== 'All' || searchQuery) && (
            <button className="reset-filter-link" onClick={handleResetFilters}>
              Reset filters
            </button>
          )}
        </div>

        {/* Loading / Error / Results */}
        {loading ? (
          <LoadingSpinner text="Connecting with master artisans across India..." />
        ) : error ? (
          <ErrorMessage message={error} onRetry={fetchArtisansList} />
        ) : artisans.length === 0 ? (
          <div className="artisans-empty-state">
            <div className="empty-icon-wrap">
              <Users size={48} />
            </div>
            <h3>No Artisans Found</h3>
            <p>We couldn't find any artisans matching your search or craft criteria.</p>
            <button className="btn btn-primary" onClick={handleResetFilters}>
              View All Artisans
            </button>
          </div>
        ) : (
          <div className="artisans-grid">
            {artisans.map((artisan) => (
              <ArtisanCard key={artisan.id} artisan={artisan} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}