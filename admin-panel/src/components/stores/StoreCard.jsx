import React from 'react';
import { Edit, Trash2, Phone, MapPin } from 'lucide-react';

function StoreCard({ store, onEdit, onDelete }) {
  const getCategoryColor = (category) => {
    const colors = {
      restaurante: 'bg-green-100 text-green-800',
      ropa: 'bg-blue-100 text-blue-800',
      banco: 'bg-purple-100 text-purple-800',
      farmacia: 'bg-red-100 text-red-800',
      supermercado: 'bg-yellow-100 text-yellow-800',
      cine: 'bg-pink-100 text-pink-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="card hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{store.name}</h3>
          <span className={`badge ${getCategoryColor(store.category)} mt-2`}>
            {store.category}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(store)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(store.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-gray-600">
          <MapPin className="w-4 h-4" />
          <span>{store.floor} - {store.zone} - Local {store.local}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <Phone className="w-4 h-4" />
          <span>{store.phone}</span>
        </div>
      </div>

      {store.description && (
        <p className="text-sm text-gray-600 mt-3 line-clamp-2">
          {store.description}
        </p>
      )}

      {store.hours && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-500">Horario</p>
          <p className="text-sm text-gray-700 mt-1">{store.hours}</p>
        </div>
      )}
    </div>
  );
}

export default StoreCard;