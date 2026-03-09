import React, { useState } from 'react';
import { Link } from 'react-router-dom';

/**
 * DesignCard Component
 * 
 * A visually appealing card component for displaying house designs with:
 * - Smooth hover animations (scale, lift, shadow)
 * - Image zoom effect on hover
 * - Responsive layout
 * - Badge for design style
 * - Property details (beds, baths, area)
 * - Price display with call-to-action button
 */
const DesignCard = ({ design }) => {
  const { _id, title, image, price, description, style, bedrooms, bathrooms, area } = design;
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Fallback image
  const fallbackImage = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80';
  const displayImage = image || fallbackImage;

  // Format price
  const formatPrice = (price) => {
    if (!price) return '₹30,00,000';
    if (typeof price === 'number') {
      return price >= 10000000 
        ? `₹${(price / 10000000).toFixed(1)} Cr`
        : `₹${(price / 100000).toFixed(0)} L`;
    }
    return price;
  };

  return (
    <div 
      className="group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl 
                 transition-all duration-500 ease-out"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transform: isHovered ? 'translateY(-8px)' : 'translateY(0)',
      }}
    >
      {/* Image Container */}
      <div className="relative h-64 overflow-hidden">
        {/* Skeleton Loader */}
        {!isImageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 
                        animate-pulse" />
        )}
        
        {/* Image */}
        <img
          src={displayImage}
          alt={title}
          className={`w-full h-full object-cover transition-transform duration-700 ease-out ${
            isHovered ? 'scale-110' : 'scale-100'
          }`}
          onLoad={() => setIsImageLoaded(true)}
          onError={(e) => {
            e.target.src = fallbackImage;
            setIsImageLoaded(true);
          }}
        />

        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent 
                      opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Style Badge */}
        {style && (
          <div className="absolute top-4 right-4 px-3 py-1.5 bg-secondary/90 backdrop-blur-sm 
                        text-white text-xs font-semibold rounded-full shadow-lg
                        transform transition-all duration-300 hover:scale-105">
            {style}
          </div>
        )}

        {/* Quick View Button (appears on hover) */}
        <div className={`absolute bottom-4 left-4 right-4 transition-all duration-300 
                       transform ${isHovered ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          <Link
            to={`/designs/${_id}`}
            className="block w-full py-3 text-center bg-white/95 backdrop-blur-sm text-gray-900 
                     font-semibold rounded-xl shadow-lg hover:bg-primary hover:text-white 
                     transition-all duration-300"
          >
            View Details
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1 
                      group-hover:text-primary transition-colors duration-300">
          {title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {description || 'Beautiful house design with modern amenities and elegant architecture.'}
        </p>

        {/* Property Features */}
        <div className="flex items-center gap-4 mb-5 text-gray-500 text-sm">
          {bedrooms && (
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>{bedrooms} Beds</span>
            </div>
          )}
          {bathrooms && (
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
              </svg>
              <span>{bathrooms} Baths</span>
            </div>
          )}
          {area && (
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
              <span>{area}</span>
            </div>
          )}
        </div>

        {/* Price & CTA */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div>
            <span className="text-xs text-gray-500 font-medium">Starting from</span>
            <p className="text-2xl font-bold text-primary">
              {formatPrice(price)}
            </p>
          </div>
          <Link
            to={`/designs/${_id}`}
            className="px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl
                     hover:bg-primary-dark hover:shadow-lg hover:-translate-y-0.5
                     transition-all duration-300"
          >
            View Design
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DesignCard;

