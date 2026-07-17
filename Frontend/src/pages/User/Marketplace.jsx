import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { ShoppingCart, Package, Truck, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import materialService from '../../services/materialService';
import cartService from '../../services/cartService';
import { cn } from '../../utils/cn';

const Marketplace = () => {
  const { user } = useAuth();
  const { totalItems } = useCart();
  const [activeCategory, setActiveCategory] = useState('All');
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mockMaterials] = useState([
    { _id: '67a1b2c3d4e5f6g7h8i9j0k1', name: 'Premium Portland Cement', price: 650, images: [{url: 'https://images.unsplash.com/photo-1606890658317-7d4e6e05102d?w=400'}], category: 'cement' },
    { _id: '67a1b2c3d4e5f6g7h8i9j0k2', name: 'High Grade Steel Bars TMT', price: 85000, images: [{url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5ba1a45?w=400'}], category: 'steel' },
    { _id: '67a1b2c3d4e5f6g7h8i9j0k3', name: 'Ceramic Wall Tiles (12x24)', price: 85, images: [{url: 'https://images.unsplash.com/photo-1586672082635-7c25635465ab?w=400'}], category: 'tiles' },
    { _id: '67a1b2c3d4e5f6g7h8i9j0k4', name: 'Asian Paints Premium Emulsion', price: 4200, images: [{url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400'}], category: 'paint' },
    { _id: '67a1b2c3d4e5f6g7h8i9j0k5', name: 'UPVC Windows & Doors', price: 450, images: [{url: 'https://images.unsplash.com/photo-1600566752355-3571b2d143c8?w=400'}], category: 'windows' },
    { _id: '67a1b2c3d4e5f6g7h8i9j0k6', name: 'Modular Kitchen Cabinets', price: 12500, images: [{url: 'https://images.unsplash.com/photo-1558618047-3c8c76bbb17c?w=400'}], category: 'kitchen' },
    { _id: '67a1b2c3d4e5f6g7h8i9j0k7', name: 'RCC Precast Slabs', price: 1250, images: [{url: 'https://images.unsplash.com/photo-1602940784238-9b9a6671dbb2?w=400'}], category: 'slabs' },
    { _id: '67a1b2c3d4e5f6g7h8i9j0k8', name: 'Solar Panels 1kW', price: 55000, images: [{url: 'https://images.unsplash.com/photo-1578662996441-02e9b552aa59?w=400'}], category: 'solar' },
  ]);

  // Load materials from API
  useEffect(() => {
    if (!user) return;
    
    setLoading(true);
    materialService.getFeatured()
      .then((res) => setMaterials(res.data || []))
      .catch(() => {
        toast('Using demo data (backend not running)', { icon: '⚠️' });
        setMaterials(mockMaterials);
      })
      .finally(() => setLoading(false));
  }, [user]);

  const handleAddToCart = async (material) => {
    try {
      await cartService.addItem(material._id, 1);
      toast.success(`${material.name} added to cart!`);
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  const categories = ['All', 'cement', 'steel', 'tiles', 'paint', 'windows', 'kitchen', 'slabs', 'solar'];

  const filteredMaterials = materials.filter(material => 
    activeCategory === 'All' || material.category === activeCategory
  );

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading materials...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-20">
        <div className="inline-flex items-center gap-3 bg-gradient-to-r from-emerald-500 to-blue-500 text-white px-6 py-3 rounded-full mb-6 shadow-xl">
          <ShoppingBag className="w-6 h-6" />
          <span className="font-bold text-lg uppercase tracking-wide">Material Marketplace</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-navy via-slate-800 to-slate-900 bg-clip-text text-transparent mb-6">
          Building Materials
        </h1>
        <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
          Premium construction materials sourced from trusted suppliers.
          <br className="hidden md:block" />
          <span className="font-semibold text-gold">Everything for your dream home - delivered to site.</span>
        </p>
      </div>

      {/* Cart Badge */}
      {totalItems > 0 && (
        <div className="mb-12 p-6 bg-gradient-to-r from-emerald-50 to-emerald-100 border-2 border-emerald-200 rounded-4xl shadow-2xl">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-emerald-500 text-white rounded-3xl flex items-center justify-center shadow-xl">
                <ShoppingCart className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-emerald-800">Cart ({totalItems})</h3>
                <p className="text-emerald-700 font-semibold">Ready to checkout →</p>
              </div>
            </div>
            <Link to="/user/cart" className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-black px-8 py-4 rounded-3xl shadow-2xl hover:shadow-emerald-500/50 transition-all flex items-center gap-2">
              View Cart & Checkout
            </Link>
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div className="flex flex-wrap gap-3 mb-16 justify-center">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={cn(
              "px-8 py-3 rounded-3xl font-bold text-sm uppercase tracking-wide border-2 shadow-lg transition-all hover:shadow-xl hover:scale-[1.02]",
              activeCategory === category
                ? "bg-gradient-to-r from-emerald-500 to-blue-500 text-white border-transparent shadow-emerald-500/50"
                : "bg-white/80 text-slate-700 border-slate-200 hover:border-emerald-300 hover:text-emerald-700"
            )}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      {/* Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-24">
        {filteredMaterials.map((material) => (
          <div key={material._id} className="group bg-white/80 backdrop-blur-sm rounded-4xl overflow-hidden shadow-2xl hover:shadow-emerald-500/25 hover:-translate-y-4 transition-all duration-500 border border-slate-200/50">
            <div className="relative h-64 overflow-hidden">
              <img 
                src={material.images?.[0]?.url || '/images/placeholder-design.jpg'} 
                alt={material.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute top-4 right-4 bg-emerald-500 text-white px-4 py-2 rounded-2xl font-bold text-xs shadow-lg">
                {material.category}
              </div>
            </div>
            
            <div className="p-8">
              <h3 className="text-xl font-bold text-navy mb-3 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                {material.name}
              </h3>
              <div className="flex items-center justify-between mb-6">
                <div className="text-3xl font-black bg-gradient-to-r from-emerald-500 to-blue-500 bg-clip-text text-transparent">
                  ₹{material.price?.toLocaleString() || 0}
                </div>
                <div className="flex items-center gap-1 text-emerald-600 font-semibold">
                  <Truck className="w-4 h-4" />
                  Free Delivery
                </div>
              </div>
              
              <button
                onClick={() => handleAddToCart(material)}
                className="w-full bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white py-4 px-6 rounded-3xl font-bold text-lg shadow-2xl hover:shadow-emerald-500/50 transition-all duration-300 flex items-center justify-center gap-3 hover:scale-[1.02]"
              >
                <ShoppingCart className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="text-center p-12 bg-gradient-to-br from-slate-50 to-slate-100 rounded-4xl border border-slate-200 shadow-xl">
          <div className="text-4xl font-black text-navy mb-4">1000+</div>
          <p className="text-slate-600 font-bold uppercase tracking-wide">Materials Live</p>
        </div>
        <div className="text-center p-12 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-4xl border border-emerald-200 shadow-xl">
          <div className="text-4xl font-black text-emerald-700 mb-4">50+</div>
          <p className="text-emerald-700 font-bold uppercase tracking-wide">Suppliers</p>
        </div>
        <div className="text-center p-12 bg-gradient-to-br from-blue-50 to-blue-100 rounded-4xl border border-blue-200 shadow-xl">
          <div className="text-4xl font-black text-blue-700 mb-4">24 hrs</div>
          <p className="text-blue-700 font-bold uppercase tracking-wide">Delivery</p>
        </div>
        <div className="text-center p-12 bg-gradient-to-br from-gold/20 to-emerald/20 rounded-4xl border border-gold/30 shadow-xl">
          <div className="text-4xl font-black bg-gradient-to-r from-gold to-emerald bg-clip-text text-transparent mb-4">₹1Cr+</div>
          <p className="text-slate-700 font-bold uppercase tracking-wide">Orders</p>
        </div>
      </div>
    </div>
  );
};

export default Marketplace;

