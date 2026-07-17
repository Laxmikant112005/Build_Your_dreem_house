import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { bookingService } from '../services/bookingService';
import { useAuth } from './AuthContext';

const BookingContext = createContext();

const bookingReducer = (state, action) => {
  switch (action.type) {
    case 'SET_BOOKINGS':
      return { ...state, bookings: action.payload, loading: false };
    case 'ADD_BOOKING':
      return { ...state, bookings: [action.payload, ...state.bookings] };
    case 'UPDATE_BOOKING':
      return {
        ...state,
        bookings: state.bookings.map(b => b.id === action.payload.id ? action.payload : b)
      };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

export const BookingProvider = ({ children }) => {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(bookingReducer, {
    bookings: [],
    loading: false,
    error: null
  });

  const fetchBookings = async () => {
    if (!user?.id) return;
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const bookings = await bookingService.getByUser(user.id);
      dispatch({ type: 'SET_BOOKINGS', payload: bookings });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const createBooking = async (bookingData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const newBooking = await bookingService.create({ ...bookingData, userId: user.id });
      dispatch({ type: 'ADD_BOOKING', payload: newBooking });
      return newBooking;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const updateBookingStatus = async (bookingId, status) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const updated = await bookingService.updateStatus(bookingId, status);
      dispatch({ type: 'UPDATE_BOOKING', payload: updated });
      return updated;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  useEffect(() => {
    if (user) fetchBookings();
  }, [user]);

  return (
    <BookingContext.Provider value={{
      ...state,
      createBooking,
      updateBookingStatus,
      refetch: fetchBookings,
      clearError: () => dispatch({ type: 'CLEAR_ERROR' })
    }}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBookings = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBookings must be used within BookingProvider');
  }
  return context;
};

