import React, { useState } from 'react';
import { Plus, Edit2, Save, X, MapPin, AlertCircle } from 'lucide-react';
import { useLocations } from '../hooks/useLocations';
import { Location } from '../types';

interface LocationManagerProps {
  onClose: () => void;
}

const LocationManager: React.FC<LocationManagerProps> = ({ onClose }) => {
  const { locations, loading, addLocation, updateLocation } = useLocations();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    if (!formData.name.trim()) {
      setError('Название местоположения обязательно');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await addLocation({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
      });
      setFormData({ name: '', description: '' });
      setShowAddForm(false);
    } catch (error: any) {
      setError(error.message || 'Ошибка при добавлении местоположения');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (id: string, data: { name: string; description: string; is_active: boolean }) => {
    if (!data.name.trim()) {
      setError('Название местоположения обязательно');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await updateLocation(id, {
        name: data.name.trim(),
        description: data.description.trim() || undefined,
        is_active: data.is_active,
      });
      setEditingId(null);
    } catch (error: any) {
      setError(error.message || 'Ошибка при обновлении местоположения');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (item: Location) => {
    setEditingId(item.id);
    setError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setError(null);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Загрузка местоположений...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Заголовок */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <MapPin className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Управление местоположениями</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Кнопка добавления */}
          <div className="mb-6">
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Добавить местоположение
            </button>
          </div>

          {/* Форма добавления */}
          {showAddForm && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Новое местоположение</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Название *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Название местоположения"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Описание
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Описание местоположения"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setFormData({ name: '', description: '' });
                    setError(null);
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={handleAdd}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {saving ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Добавить
                </button>
              </div>
            </div>
          )}

          {/* Список местоположений */}
          <div className="space-y-4">
            {locations.length === 0 ? (
              <div className="text-center py-8">
                <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Местоположения не найдены</h3>
                <p className="text-gray-600">Добавьте первое местоположение в справочник</p>
              </div>
            ) : (
              locations.map(item => (
                <LocationItem
                  key={item.id}
                  item={item}
                  isEditing={editingId === item.id}
                  onEdit={() => startEdit(item)}
                  onSave={(data) => handleUpdate(item.id, data)}
                  onCancel={cancelEdit}
                  saving={saving}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface LocationItemProps {
  item: Location;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (data: { name: string; description: string; is_active: boolean }) => void;
  onCancel: () => void;
  saving: boolean;
}

const LocationItem: React.FC<LocationItemProps> = ({
  item,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  saving
}) => {
  const [formData, setFormData] = useState({
    name: item.name,
    description: item.description || '',
    is_active: item.is_active,
  });

  const handleSave = () => {
    onSave(formData);
  };

  if (isEditing) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Название *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Описание
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            <span className="text-sm text-gray-700">Активно</span>
          </label>
          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="px-3 py-1 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Отмена
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-3 py-1 text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {saving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="w-4 h-4" />
              )}
              Сохранить
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 ${!item.is_active ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
            {!item.is_active && (
              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                Неактивно
              </span>
            )}
          </div>
          {item.description && (
            <p className="text-gray-600 mb-2">{item.description}</p>
          )}
          <p className="text-sm text-gray-500">
            Создано: {new Intl.DateTimeFormat('ru-RU', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }).format(item.created_at)}
          </p>
        </div>
        <button
          onClick={onEdit}
          className="p-2 text-gray-400 hover:text-green-600 transition-colors"
          title="Редактировать"
        >
          <Edit2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default LocationManager;