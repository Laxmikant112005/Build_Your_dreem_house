import React, { createContext, useContext, useReducer, useEffect } from 'react';


const FavoriteContext = createContext();

const favoriteReducer = (state, action) => {
  switch (action.type) {
    case 'TOGGLE_DESIGN':
      const isSaved = state.savedIds.includes(action.payload);
      if (isSaved) {
        return {
          savedIds: state.savedIds.filter(id => id !== action.payload)
        };
      } else {
        return {
          savedIds: [...state.savedIds, action.payload]
        };
      }
    case 'SET_SAVED':
      return { savedIds: action.payload };
    default:
      return state;
  }
};

export const FavoriteProvider = ({ children }) => {
  const [state, dispatch] = useReducer(favoriteReducer, { savedIds: [] });

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('planovaFavorites');
    if (saved) {
      dispatch({ type: 'SET_SAVED', payload: JSON.parse(saved) });
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('planovaFavorites', JSON.stringify(state.savedIds));
  }, [state.savedIds]);

  const toggleFavorite = (designId) => {
    dispatch({ type: 'TOGGLE_DESIGN', payload: designId });
  };

  const isFavorite = (designId) => state.savedIds.includes(designId);

  const savedDesigns = [];

  return (
    <FavoriteContext.Provider value={{
      toggleFavorite,
      isFavorite,
      savedDesigns,
      savedCount: state.savedIds.length
    }}>
      {children}
    </FavoriteContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoriteContext);
  if (!context) {
    throw new Error('useFavorites must be used within FavoriteProvider');
  }
  return context;
};

