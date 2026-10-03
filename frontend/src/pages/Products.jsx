import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Filter, 
  Search, 
  RotateCcw, 
  SlidersHorizontal, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Check
} from 'lucide-react';
import ProductGrid from '../components/ProductGrid';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { useToast } from '../context/ToastContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { getProducts, getCategories } from '../services/api';
import { initialAllProducts } from '../services/productsData';
import './Products.css';

const PRICE_RANGES = [
  { id: 'all', label: 'All Prices', min: null, max: null },
  { id: 'under-500', label: 'Under ₹500', min: 0, max: 499 },
  { id: '500-1000', label: '₹500 – ₹1,000', min: 500, max: 1000 },
  { id: '1000-2500', label: '₹1,000 – ₹2,500', min: 1000, max: 2500 },
  { id: 'above-2500', label: 'Above ₹2,500', min: 2500, max: null }
];

const RATINGS = [
  { id: 'all', label: 'All Ratings', min: null },
  { id: '4', label: '4★ & Above', min: 4.0 },
  { id: '3', label: '3★ & Above', min: 3.0 }
];

const MATERIALS = [
  { id: 'all', label: 'All Materials' },
  { id: 'Clay', label: 'Clay & Terracotta' },
  { id: 'Silk', label: 'Handloom Silk' },
  { id: 'Cotton', label: 'Organic Cotton' },
  { id: 'Wood', label: 'Sheesham & Teak Wood' },
  { id: 'Brass', label: 'Brass & Bell Metal' },
  { id: 'Silver', label: 'Silver Filigree' },
  { id: 'Leather', label: 'Embossed Leather' },
  { id: 'Jute', label: 'Natural Jute' }
];

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToast } = useToast();

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [selectedGender, setSelectedGender] = useState(searchParams.get('gender') || 'All');
  const [selectedPriceRange, setSelectedPriceRange] = useState('all');
  const [selectedRating, setSelectedRating] = useState('all');
  const [selectedMaterial, setSelectedMaterial] = useState('all');
  const [availability, setAvailability] = useState('all');
  const [sortBy, setSortBy] = useState('popular');

  // Categories loaded from MySQL
  const [categoryList, setCategoryList] = useState(['All']);

  // Products from Backend
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mobile Drawer
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  
  // Real Wishlist & Cart integration
  const { wishlistItems, toggleWishlist, isWishlisted } = useWishlist();
  const { addToCart } = useCart();
  const wishlistIds = wishlistItems.map(item => item.id);

  const handleAddToCart = (product) => {
    addToCart(product, 1, null);
    addToast(`Added "${product.name}" to cart!`, 'success');
  };

  const handleToggleWishlist = (product) => {
    toggleWishlist(product);
    const already = isWishlisted(product.id);
    addToast(already ? `Removed "${product.name}" from wishlist` : `Added "${product.name}" to wishlist!`, already ? 'info' : 'success');
  };

  // Pagination — 12 items for clean 4-col desktop and 2-col mobile
  const ITEMS_PER_PAGE = 12;
  const [currentPage, setCurrentPage] = useState(1);

  // 1. Fetch Categories from Backend on mount
  useEffect(() => {
    getCategories()
      .then((res) => {
        if (res.categories && res.categories.length > 0) {
          const names = ['All', ...res.categories.map((c) => c.name)];
          setCategoryList(names);
        }
      })
      .catch((e) => console.warn('Could not fetch categories:', e));
  }, []);

  // 2. Fetch Products dynamically with query parameters
  const fetchProductCatalog = async () => {
    setLoading(true);
    setError(null);

    const priceObj = PRICE_RANGES.find((p) => p.id === selectedPriceRange);
    const ratingObj = RATINGS.find((r) => r.id === selectedRating);

    const params = {};
    if (selectedCategory && selectedCategory !== 'All') params.category = selectedCategory;
    if (selectedGender && selectedGender !== 'All') params.gender = selectedGender;
    if (selectedMaterial && selectedMaterial !== 'all') params.material = selectedMaterial;
    if (searchQuery.trim()) params.search = searchQuery.trim();
    if (priceObj && priceObj.min !== null) params.min_price = priceObj.min;
    if (priceObj && priceObj.max !== null) params.max_price = priceObj.max;
    if (ratingObj && ratingObj.min !== null) params.min_rating = ratingObj.min;
    if (availability !== 'all') params.availability = availability;
    if (sortBy) params.sort_by = sortBy;

    try {
      const data = await getProducts(params);
      const backendProducts = data.products || [];

      // If backend returns zero products, fall back to local dataset
      if (backendProducts.length === 0) {
        throw new Error('No products from backend — using local data');
      }
      setProducts(backendProducts);
    } catch (err) {
      console.warn('Backend empty/unavailable — using local data:', err.message);

      // Client-side filtering of our local dataset
      let list = [...initialAllProducts];

      // Category filter (exact match on `category` field)
      if (params.category) {
        list = list.filter((p) => p.category === params.category);
      }

      // Material filter
      if (params.material && params.material !== 'all') {
        list = list.filter((p) => (p.material || '').toLowerCase().includes(params.material.toLowerCase()));
      }

      // Gender filter — map gender param to category name
      if (params.gender && params.gender !== 'All') {
        const genderMap = {
          'Men': 'Men',
          'Women': 'Women',
          'Kids': 'Kids',
          'Unisex': null,
        };
        const mappedCat = genderMap[params.gender];
        if (mappedCat) {
          list = list.filter((p) => p.category === mappedCat);
        }
      }

      // Search filter
      if (params.search) {
        const q = params.search.toLowerCase();
        list = list.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            (p.category || '').toLowerCase().includes(q) ||
            (p.artisan_name || '').toLowerCase().includes(q) ||
            (p.material || '').toLowerCase().includes(q)
        );
      }

      // Price filter
      if (params.min_price !== undefined) list = list.filter((p) => p.price >= params.min_price);
      if (params.max_price !== undefined) list = list.filter((p) => p.price <= params.max_price);

      // Rating filter
      if (params.min_rating !== undefined) list = list.filter((p) => (p.rating || 0) >= params.min_rating);

      // Availability filter
      if (params.availability === 'in-stock') list = list.filter((p) => (p.stock_quantity || 0) > 0 || p.is_made_to_order);
      else if (params.availability === 'out-of-stock') list = list.filter((p) => (p.stock_quantity || 0) <= 0 && !p.is_made_to_order);
      else if (params.availability === 'made-to-order') list = list.filter((p) => Boolean(p.is_made_to_order));

      // Sort
      if (params.sort_by === 'price-low') list.sort((a, b) => a.price - b.price);
      else if (params.sort_by === 'price-high') list.sort((a, b) => b.price - a.price);
      else if (params.sort_by === 'highest-rated') list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      else if (params.sort_by === 'newest') list.sort((a, b) => b.id - a.id);
      else list.sort((a, b) => (b.rating || 0) - (a.rating || 0)); // default: popular

      setProducts(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductCatalog();
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedGender, selectedPriceRange, selectedRating, selectedMaterial, availability, sortBy]);

  useEffect(() => {
    const urlCategory = searchParams.get('category');
    const urlSearch = searchParams.get('search');
    const urlGender = searchParams.get('gender');
    const urlMaterial = searchParams.get('material');
    if (urlCategory) setSelectedCategory(urlCategory);
    if (urlSearch) setSearchQuery(urlSearch);
    if (urlGender) setSelectedGender(urlGender);
    if (urlMaterial) setSelectedMaterial(urlMaterial);
  }, [searchParams]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedGender('All');
    setSelectedPriceRange('all');
    setSelectedRating('all');
    setSelectedMaterial('all');
    setAvailability('all');
    setSortBy('popular');
    setCurrentPage(1);
    setSearchParams({});
  };

  // Pagination calculation
  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE) || 1;
  const paginatedProducts = products.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const hasActiveFilters = 
    searchQuery || 
    selectedCategory !== 'All' || 
    selectedPriceRange !== 'all' || 
    selectedRating !== 'all' || 
    selectedMaterial !== 'all' ||
    availability !== 'all';

  return (
    <div className="products-page">
      <div className="container">
        {/* Header */}
        <header className="products-header">
          <div>
            <span className="products-badge">Authentic Handmade Catalog</span>
            <h1 className="products-title">Discover Handcrafted & Custom Creations</h1>
            <p className="products-desc">
              Direct connection to independent master artisans across India with made-to-order personalization.
            </p>
          </div>

          <div className="products-search-box">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search by product, artisan, or material..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search catalog"
            />
            {searchQuery && (
              <button className="clear-search-btn" onClick={() => setSearchQuery('')}>
                <X size={16} />
              </button>
            )}
          </div>
        </header>

        {/* Toolbar */}
        <div className="products-toolbar">
          <div className="toolbar-left">
            <button 
              className="mobile-filter-trigger"
              onClick={() => setMobileFilterOpen(true)}
            >
              <SlidersHorizontal size={18} />
              <span>Filters</span>
            </button>
            <p className="results-count">
              Showing <strong>{products.length}</strong> {products.length === 1 ? 'product' : 'products'} from database
            </p>
          </div>

          <div className="toolbar-right">
            <label htmlFor="sort-select" className="sort-label">Sort by:</label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-dropdown"
            >
              <option value="popular">Popularity & Stock</option>
              <option value="highest-rated">Highest Rated (★ 5 → 1)</option>
              <option value="newest">Newest Arrivals</option>
              <option value="price-low">Price: Low → High</option>
              <option value="price-high">Price: High → Low</option>
            </select>
          </div>
        </div>

        {/* Active Filter Chips */}
        {hasActiveFilters && (
          <div className="active-filter-chips">
            <span className="active-filter-label">Active Filters:</span>
            {searchQuery && (
              <span className="filter-chip">
                Search: "{searchQuery}"
                <button onClick={() => setSearchQuery('')}><X size={14} /></button>
              </span>
            )}
            {selectedCategory !== 'All' && (
              <span className="filter-chip">
                Category: {selectedCategory}
                <button onClick={() => setSelectedCategory('All')}><X size={14} /></button>
              </span>
            )}
            {selectedPriceRange !== 'all' && (
              <span className="filter-chip">
                {PRICE_RANGES.find(p => p.id === selectedPriceRange)?.label}
                <button onClick={() => setSelectedPriceRange('all')}><X size={14} /></button>
              </span>
            )}
            {selectedRating !== 'all' && (
              <span className="filter-chip">
                {RATINGS.find(r => r.id === selectedRating)?.label}
                <button onClick={() => setSelectedRating('all')}><X size={14} /></button>
              </span>
            )}
            {selectedMaterial !== 'all' && (
              <span className="filter-chip">
                Material: {MATERIALS.find(m => m.id === selectedMaterial)?.label || selectedMaterial}
                <button onClick={() => setSelectedMaterial('all')}><X size={14} /></button>
              </span>
            )}
            {availability !== 'all' && (
              <span className="filter-chip">
                {availability === 'in-stock' ? 'In Stock' : availability === 'made-to-order' ? 'Made to Order' : 'Out of Stock'}
                <button onClick={() => setAvailability('all')}><X size={14} /></button>
              </span>
            )}
            <button className="reset-all-btn" onClick={resetFilters}>
              <RotateCcw size={14} />
              <span>Clear All</span>
            </button>
          </div>
        )}

        {/* Layout */}
        <div className="products-layout">
          {/* SIDEBAR FILTERS */}
          <aside className={`filters-sidebar ${mobileFilterOpen ? 'drawer-open' : ''}`}>
            <div className="sidebar-header">
              <h3><Filter size={18} /> Filters</h3>
              <button 
                className="close-drawer-btn" 
                onClick={() => setMobileFilterOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            {/* Category */}
            <div className="filter-group">
              <h4 className="filter-heading">Category</h4>
              <ul className="category-filter-list">
                {categoryList.map((cat) => (
                  <li key={cat}>
                    <button
                      className={`filter-btn-item ${selectedCategory === cat ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedCategory(cat);
                        setMobileFilterOpen(false);
                      }}
                    >
                      <span>{cat}</span>
                      {selectedCategory === cat && <Check size={14} className="check-icon" />}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Craft Material */}
            <div className="filter-group">
              <h4 className="filter-heading">Craft Material</h4>
              <div className="radio-filter-group">
                {MATERIALS.map((mat) => (
                  <label key={mat.id} className="radio-label">
                    <input
                      type="radio"
                      name="material-filter"
                      checked={selectedMaterial === mat.id}
                      onChange={() => setSelectedMaterial(mat.id)}
                    />
                    <span>{mat.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price */}
            <div className="filter-group">
              <h4 className="filter-heading">Price</h4>
              <div className="radio-filter-group">
                {PRICE_RANGES.map((range) => (
                  <label key={range.id} className="radio-label">
                    <input
                      type="radio"
                      name="price-range"
                      checked={selectedPriceRange === range.id}
                      onChange={() => setSelectedPriceRange(range.id)}
                    />
                    <span>{range.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Rating */}
            <div className="filter-group">
              <h4 className="filter-heading">Customer Rating</h4>
              <div className="radio-filter-group">
                {RATINGS.map((rating) => (
                  <label key={rating.id} className="radio-label">
                    <input
                      type="radio"
                      name="rating-filter"
                      checked={selectedRating === rating.id}
                      onChange={() => setSelectedRating(rating.id)}
                    />
                    <span>{rating.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Availability */}
            <div className="filter-group">
              <h4 className="filter-heading">Stock Availability</h4>
              <div className="radio-filter-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="availability"
                    checked={availability === 'all'}
                    onChange={() => setAvailability('all')}
                  />
                  <span>All Items</span>
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="availability"
                    checked={availability === 'in-stock'}
                    onChange={() => setAvailability('in-stock')}
                  />
                  <span>In Stock Only</span>
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="availability"
                    checked={availability === 'made-to-order'}
                    onChange={() => setAvailability('made-to-order')}
                  />
                  <span>Made to Order</span>
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="availability"
                    checked={availability === 'out-of-stock'}
                    onChange={() => setAvailability('out-of-stock')}
                  />
                  <span>Out of Stock Only</span>
                </label>
              </div>
            </div>

            {hasActiveFilters && (
              <button className="sidebar-reset-btn" onClick={resetFilters}>
                <RotateCcw size={16} />
                <span>Reset All Filters</span>
              </button>
            )}
          </aside>

          {mobileFilterOpen && (
            <div className="drawer-backdrop" onClick={() => setMobileFilterOpen(false)} />
          )}

          {/* MAIN GRID */}
          <main className="products-grid-container">
            {loading ? (
              <LoadingSpinner message="Querying Craftora database catalog..." />
            ) : error ? (
              <ErrorMessage title="Catalog Error" message={error} onRetry={fetchProductCatalog} />
            ) : (
              <>
                <ProductGrid
                  products={paginatedProducts}
                  onAddToCart={handleAddToCart}
                  onToggleWishlist={handleToggleWishlist}
                  wishlistIds={wishlistIds}
                  emptyMessage="No products match this combination of filters in the database."
                />

                {totalPages > 1 && (
                  <div className="pagination-wrap">
                    <button
                      className="pagination-btn"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    >
                      <ChevronLeft size={18} />
                      <span>Previous</span>
                    </button>

                    <div className="pagination-numbers">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                        <button
                          key={pageNum}
                          className={`page-num-btn ${currentPage === pageNum ? 'active' : ''}`}
                          onClick={() => setCurrentPage(pageNum)}
                        >
                          {pageNum}
                        </button>
                      ))}
                    </div>

                    <button
                      className="pagination-btn"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    >
                      <span>Next</span>
                      <ChevronRight size={18} />
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}