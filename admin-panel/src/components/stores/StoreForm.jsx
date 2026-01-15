import React, { useState } from 'react';

function StoreForm({ store, onClose, onSave }) {
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
      await onSave(formData);
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

export default StoreForm;