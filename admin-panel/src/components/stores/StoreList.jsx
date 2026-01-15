import React from 'react';
import StoreCard from './StoreCard';

function StoreList({ stores, onEdit, onDelete }) {
  if (!stores || stores.length === 0) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-600">No se encontraron locales</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {stores.map(store => (
        <StoreCard
          key={store.id}
          store={store}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

export default StoreList;