import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Phone, MapPin } from 'lucide-react';
import { storesAPI } from '../api/client';

function Stores() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingStore, setEditingStore] = useState(null);

  const categories = [
    { value: 'all', label: 'Todas' },
    { value: 'restaurante', label: 'Restaurantes' },
    { value: 'ropa', label: 'Ropa' },
    { value: 'banco', label: 'Bancos' },
    { value: 'farmacia', label: 'Farmacias' },
    { value: 'supermercado', label: 'Supermercados' },
    { value: 'cine', label: 'Cine' }
  ];

  useEffect(() => {
    loadStores();
  }, [selectedCategory]);

  const loadStores = async () => {
    try {
      setLoading(true);
      const params = selectedCategory !== 'all' ? { category: selectedCategory } : {};
      const { data } = await storesAPI.getAll(params);
      setStores(data.data);
    } catch (error) {
      console.error('Error loading stores:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este local?')) return;

    try {
      await storesAPI.delete(id);
      await loadStores();
    } catch (error) {
      console.error('Error deleting store:', error);
      alert('Error al eliminar el local');
    }
  };

  const handleEdit = (store) => {
    setEditingStore(store);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingStore(null);
  };

  const filteredStores = stores.filter(store =>
    store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    store.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (showForm) {
    return <StoreForm store={editingStore} onClose={handleCloseForm} onSuccess={loadStores} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Locales</h1>
          <p className="text-gray-600 mt-1">
            Gestiona todos los locales del centro comercial
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nuevo Local
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o categoría..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10 w-full"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="input"
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-sm text-gray-600">Total Locales</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stores.length}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Restaurantes</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {stores.filter(s => s.category === 'restaurante').length}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Tiendas</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {stores.filter(s => s.category === 'ropa').length}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Servicios</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {stores.filter(s => ['banco', 'farmacia'].includes(s.category)).length}
          </p>
        </div>
      </div>

      {/* Store List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : filteredStores.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-600">No se encontraron locales</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStores.map(store => (
            <StoreCard
              key={store.id}
              store={store}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================
// STORE CARD COMPONENT
// ============================================
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

// ============================================
// STORE FORM COMPONENT
// ============================================
function StoreForm({ store, onClose, onSuccess }) {
  const [formData, setFormData] = useState(store || {
    id: '',
    name: '',
    category: 'restaurante',
    floor: '',
    zone: '',
    local: '',
    phone: '',
    hours: '',
    description: ''
  });

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (store) {
        await storesAPI.update(store.id, formData);
      } else {
        await storesAPI.create(formData);
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving store:', error);
      alert('Error al guardar el local');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {store ? 'Editar Local' : 'Nuevo Local'}
          </h1>
          <p className="text-gray-600 mt-1">
            Completa la información del local
          </p>
        </div>
        <button onClick={onClose} className="btn-secondary">
          Cancelar
        </button>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ID *
            </label>
            <input
              type="text"
              name="id"
              value={formData.id}
              onChange={handleChange}
              disabled={!!store}
              required
              className="input w-full"
              placeholder="ej: crepes-waffles"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="input w-full"
              placeholder="ej: Crepes & Waffles"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoría *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="input w-full"
            >
              <option value="restaurante">Restaurante</option>
              <option value="ropa">Ropa</option>
              <option value="banco">Banco</option>
              <option value="farmacia">Farmacia</option>
              <option value="supermercado">Supermercado</option>
              <option value="cine">Cine</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Piso *
            </label>
            <input
              type="text"
              name="floor"
              value={formData.floor}
              onChange={handleChange}
              required
              className="input w-full"
              placeholder="ej: Segundo piso"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Zona *
            </label>
            <input
              type="text"
              name="zone"
              value={formData.zone}
              onChange={handleChange}
              required
              className="input w-full"
              placeholder="ej: Zona norte"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Local *
            </label>
            <input
              type="text"
              name="local"
              value={formData.local}
              onChange={handleChange}
              required
              className="input w-full"
              placeholder="ej: 201"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Teléfono *
            </label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="input w-full"
              placeholder="ej: 607-724-5000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Horario *
            </label>
            <input
              type="text"
              name="hours"
              value={formData.hours}
              onChange={handleChange}
              required
              className="input w-full"
              placeholder="ej: Lun-sáb 10AM-9PM"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descripción
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="input w-full"
            placeholder="Descripción del local..."
          />
        </div>

        <div className="flex justify-end gap-4">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancelar
          </button>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Guardando...' : (store ? 'Actualizar' : 'Crear')}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Stores;