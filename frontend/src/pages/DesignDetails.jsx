import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { designAPI } from '../services/api';
import BookingForm from '../components/BookingForm';

const DesignDetails = () => {
  const { id } = useParams();
  const [design, setDesign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    fetchDesignDetails();
  }, [id]);

  const fetchDesignDetails = async () => {
    try {
      setLoading(true);
      const response = await designAPI.getDesignById(id);
      setDesign(response.data.data);
    } catch (err) {
      setError('Failed to load design details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-xl text-gray-600">Loading design...</div>
      </div>
    );
  }

  if (error || !design) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">{error || 'Design not found'}</p>
          <Link to="/designs" className="text-blue-600 hover:underline">
            Back to Designs
          </Link>
        </div>
      </div>
    );
  }

  // Sample images for demo
  const images = [
    design.image || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80',
    'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&q=80'
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <Link to="/designs" className="text-blue-600 hover:underline">
            ← Back to Designs
          </Link>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="rounded-2xl overflow-hidden shadow-lg">
              <img 
                src={images[selectedImage]} 
                alt={design.title} 
                className="w-full h-96 object-cover"
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === index ? 'border-blue-600' : 'border-transparent'
                  }`}
                >
                  <img 
                    src={img} 
                    alt={`View ${index + 1}`} 
                    className="w-full h-20 object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Design Info */}
          <div>
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-2 mb-2">
                {design.style && (
                  <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
                    {design.style}
                  </span>
                )}
                {design.category && (
                  <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm font-medium">
                    {design.category}
                  </span>
                )}
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{design.title}</h1>
              
              <p className="text-4xl font-bold text-blue-600 mb-6">
                {design.price || '₹30,00,000'}
              </p>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-semibold">{design.bedrooms || 3}</p>
                  <p className="text-gray-600">Bedrooms</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-semibold">{design.bathrooms || 2}</p>
                  <p className="text-gray-600">Bathrooms</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-semibold">{design.area || '2,000'}</p>
                  <p className="text-gray-600">Sq. Ft.</p>
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-3">Description</h2>
                <p className="text-gray-600 leading-relaxed">
                  {design.description || 'This beautiful house design features modern architecture with spacious interiors, natural lighting, and premium finishes. Perfect for families looking for a dream home with contemporary aesthetics and functional layout.'}
                </p>
              </div>

              {design.specifications && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-3">Specifications</h2>
                  <ul className="space-y-2">
                    {design.specifications.map((spec, index) => (
                      <li key={index} className="flex items-center gap-2 text-gray-600">
                        <span className="text-green-500">✓</span>
                        {spec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Booking Form */}
              <div className="mt-8">
                <BookingForm design={design} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesignDetails;

