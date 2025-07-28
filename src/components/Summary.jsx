import React from 'react';

const Summary = ({ userState, onRemoveFavorite }) => {
  return (
    <section className="summary">
      <h2>Your Learning Summary</h2>
      <div className="summary-stats">
        <div className="stat">
          <span className="stat-number">{userState.favorites.length}</span>
          <span className="stat-label">Favorites</span>
        </div>
        <div className="stat">
          <span className="stat-number">{userState.questions.length}</span>
          <span className="stat-label">Questions</span>
        </div>
        <div className="stat">
          <span className="stat-number">{userState.explored.size}</span>
          <span className="stat-label">Explored</span>
        </div>
      </div>
      <div className="favorites-list">
        <h3>Your Favorite Values:</h3>
        {userState.favorites.length === 0 ? (
          <p className="no-favorites">
            No favorites yet. Click the heart icon on any value to add it to your favorites!
          </p>
        ) : (
          userState.favorites.map((favorite) => (
            <div key={favorite.id} className="favorite-item">
              <span className="favorite-name">{favorite.name}</span>
              <button 
                className="remove-favorite"
                onClick={() => onRemoveFavorite(favorite.id)}
                title="Remove from favorites"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default Summary; 