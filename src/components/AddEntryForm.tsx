import React, { useState } from 'react';
import { X, Save, FileText } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useEquipment } from '../hooks/useEquipment';
import { useLocations } from '../hooks/useLocations';
import { useCategories } from '../hooks/useCategories';

interface AddEntryFormProps {
  onSubmit: (entry: {
    categoryId: string;
    title: string;
    description: string;
    author: string;
    status: 'draft' | 'active';
    equipmentId?: string;
    locationId?: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
  }) => Promise<void>;
  onClose: () => void;
}

const AddEntryForm: React.FC<AddEntryFormProps> = ({ onSubmit, onClose }) => {
  const { getUserDisplayName } = useAuth();
  const { equipment, getActiveEquipment } = useEquipment();
  const { locations, getActiveLocations } = useLocations();
  const { categories, getActiveCategories } = useCategories();
  
  const [formData, setFormData] = useState({
    categoryId: '',
    title: '',
    description: '',
    equipmentId: '',
    locationId: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const priorityOptions = [
    { value: 'low', label: 'Низкий' },
    { value: 'medium', label: 'Средний' },
    { value: 'high', label: 'Высокий' },
    { value: 'critical', label: 'Критический' },
  ];

  const handleSubmit = async (e: React.FormEvent, isDraft = false) => {
    e.preventDefault();
    
    if (!formData.categoryId || !formData.title.trim() || !formData.description.trim()) {
      setError('Заполните обязательные поля');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onSubmit({
        ...formData,
        author: getUserDisplayName(),
        status: isDraft ? 'draft' : 'active',
        equipmentId: formData.equipmentId || undefined,
        locationId: formData.locationId || undefined,
      });
      onClose();
    } catch (error: any) {
      setError(error.message || 'Произошла ошибка при сохранении записи');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (error) setError(null);
  };

  const activeEquipment = getActiveEquipment();
  const activeLocations = getActiveLocations();
  const activeCategories = getActiveCategories();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Заголовок */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Новая запись в журнале</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Категория */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Категория события *
            </label>
            <select
              value={formData.categoryId}
              onChange={(e) => handleChange('categoryId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={loading}
            >
              <option value="">Выберите категорию</option>
              {activeCategories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Заголовок */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Заголовок *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Краткое описание события"
              required
              disabled={loading}
            />
          </div>

          {/* Описание */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Подробное описание *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Детальное описание события, выполненных работ или принятых мер"
              required
              disabled={loading}
            />
          </div>

          {/* Приоритет */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Приоритет
            </label>
            <select
              value={formData.priority}
              onChange={(e) => handleChange('priority', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            >
              {priorityOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Оборудование и местоположение */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Оборудование
              </label>
              <select
                value={formData.equipmentId}
                onChange={(e) => handleChange('equipmentId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              >
                <option value="">Выберите оборудование</option>
                {activeEquipment.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Местоположение
              </label>
              <select
                value={formData.locationId}
                onChange={(e) => handleChange('locationId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              >
                <option value="">Выберите местоположение</option>
                {activeLocations.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Автор */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Автор записи
            </label>
            <input
              type="text"
              value={getUserDisplayName()}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              disabled
            />
          </div>

          {/* Кнопки */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              disabled={loading}
            >
              Отмена
            </button>
            <button
              type="button"
              onClick={(e) => handleSubmit(e, true)}
              className="flex items-center gap-2 px-4 py-2 text-amber-700 bg-amber-100 rounded-md hover:bg-amber-200 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-700"></div>
              ) : (
                <FileText className="w-4 h-4" />
              )}
              Сохранить как черновик
            </button>
            <button
              type="submit"
              onClick={(e) => handleSubmit(e, false)}
              className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="w-4 h-4" />
              )}
              Создать запись
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEntryForm;
