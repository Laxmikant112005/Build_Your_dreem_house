import React, { useState, useEffect, useCallback } from 'react';
import { ShoppingCart, X, CreditCard, Truck, Minus, Plus, Trash2, ShieldCheck } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn';

const convertToINR = (amount) => `₹${amount.toLocaleString('en-IN')}`;

const Cart = () => {
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCart();
  const [isLoading, setIsLoading] = useState(true);

  const updateCartItem = useCallback((id, quantity) => {
    if (quantity <= 0) {
      removeItem(id);
    } else {
      updateQuantity(id, quantity);
    }
  }, [removeItem, updateQuantity]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 200);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-12 w-64 bg-slate-200 rounded-3xl mb-12"></div>
          <div className="h-72 bg-slate-200 rounded-4xl"></div>
          <div className="h-72 bg-slate-200 rounded-4xl"></div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center py-24 px-4">
        <div className="text-center space-y-6 max-w-md">
          <ShoppingCart className="w-24 h-24 text-slate-400 mx-auto" />
          <h2 className="text-3xl font-bold text-navy">Your cart is empty</h2>
          <p className="text-slate-500 text-lg">Looks like you haven't added anything to your cart yet.</p>
          <Link to="/user/marketplace" className="inline-flex items-center gap-3 bg-gold text-navy font-bold py-4 px-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <ShoppingCart className="w-10 h-10 text-navy" />
          <h1 className="text-4xl font-black text-navy">Shopping Cart</h1>
        </div>
        <div className="bg-slate-50 rounded-3xl p-6">
          <div className="flex items-center justify-between">
            <span className="text-slate-600 font-medium">{items.length} items</span>
            <button 
              onClick={clearCart}
              className="text-red-500 hover:text-red-600 font-medium flex items-center gap-1 text-sm"
            >
              <Trash2 className="w-4 h-4" />
              Clear Cart
            </button>
          </div>
        </div>
      </div>

      {/* Cart Items */}
      <div className="space-y-6 mb-16">
        {items.map((item) => (
          <div key={item.id} className="bg-white rounded-4xl shadow-xl border border-slate-200 overflow-hidden hover:shadow-2xl transition-all">
            <div className="flex gap-6 p-8">
              <div className="relative flex-shrink-0">
                <img 
                  src={item.image} 
                  alt={item.name}
                  className="w-32 h-32 object-cover rounded-2xl shadow-lg"
                  onError={(e) => {
                    e.target.src = '/images/placeholder-design.jpg';
                  }}
                />
                <div className="absolute -top-2 -right-2 bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-xl shadow-lg">
                  {item.category}
                </div>
              </div>

              <div className="flex-grow">
                <h3 className="text-xl font-bold text-navy mb-2">{item.name}</h3>
                <p className="text-slate-600 mb-6">{convertToINR(item.price)} / unit</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 bg-slate-50 px-6 py-3 rounded-3xl">
                    <button 
                      onClick={() => updateCartItem(item.id, item.quantity - 1)}
                      className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm hover:shadow-md transition-all -mx-1"
                    >
                      <Minus className="w-4 h-4 text-slate-600" />
                    </button>
                    <span className="font-bold text-xl text-navy min-w-[3rem] text-center">{item.quantity}</span>
                    <button 
                      onClick={() => updateCartItem(item.id, item.quantity + 1)}
                      className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm hover:shadow-md transition-all -mx-1"
                    >
                      <Plus className="w-4 h-4 text-slate-600" />
                    </button>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-navy">
                      {convertToINR(item.price * item.quantity)}
                    </div>
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-600 font-medium flex items-center gap-1 mt-2 text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Order Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <h3 className="text-2xl font-bold text-navy mb-8 flex items-center gap-3">
            Delivery Details
          </h3>
          <div className="space-y-6">
            <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200">
              <div className="flex items-center gap-3 mb-4">
                <Truck className="w-8 h-8 text-emerald-600" />
                <div>
                  <h4 className="font-bold text-navy">Free Delivery</h4>
                  <p className="text-slate-600 text-sm">3-5 business days</p>
                </div>
              </div>
              <p className="text-slate-500 text-sm">All orders shipped from our warehouses across India. Track your order in real-time.</p>
            </div>

            <div className="bg-emerald-50 rounded-3xl p-6 border-2 border-emerald-200">
              <h4 className="font-bold text-emerald-800 mb-3 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5" />
                Quality Guaranteed
              </h4>
              <ul className="space-y-2 text-sm text-emerald-700">
                <li>• ISO Certified Materials</li>
                <li>• Direct from Manufacturers</li>
                <li>• 30 Day Return Policy</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="lg:sticky lg:top-32 lg:self-start">
          <div className="bg-white rounded-4xl shadow-2xl border border-slate-200 p-8">
            <h3 className="text-2xl font-black text-navy mb-8">Order Summary</h3>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between font-bold text-lg">
                <span>Total ({items.length} items):</span>
                <span>{convertToINR(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-slate-500 text-sm pt-2 border-t">
                <span>Shipping:</span>
                <span>FREE</span>
              </div>
              <div className="flex justify-between text-slate-500 text-sm">
                <span>Tax (GST 18%):</span>
                <span>{convertToINR(totalPrice * 0.18)}</span>
              </div>
            </div>

            <div className="space-y-3 mb-8 p-4 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-3xl">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Subtotal</span>
                <span>{convertToINR(totalPrice)}</span>
              </div>
              <div className="flex justify-between font-bold text-xl text-navy">
                <span>Total Amount</span>
                <span>{convertToINR(totalPrice * 1.18)}</span>
              </div>
            </div>

            <div className="space-y-4">
              <button className="w-full bg-gradient-to-r from-navy to-slate-900 text-white py-5 rounded-3xl font-black text-xl shadow-2xl hover:shadow-3xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3">
                <CreditCard className="w-6 h-6" />
                Proceed to Checkout ₹{convertToINR(totalPrice * 1.18)}
              </button>
              <Link to="/user/marketplace" className="block w-full text-center text-slate-600 font-bold hover:text-navy transition-colors py-3">
                ← Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;

