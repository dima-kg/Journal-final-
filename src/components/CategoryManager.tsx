import React, { useState } from 'react';
import { Plus, Edit2, Save, X, Tag, AlertCircle, ArrowUp, ArrowDown } from 'lucide-react';
import { useCategories } from '../hooks/useCategories';
import { Category } from '../types';

interface CategoryManagerProps {
  onClose: () => void;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({ onClose }) => {
  const { categories, loading, addCategory, updateCategory } = useCategories();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ 
    code: '', 
    name: '', 
    description: '', 
    sort_order: 0 
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    if (!formData.code.trim() || !formData.name.trim()) {
      setError('Код и название категории обязательны');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await addCategory({
        code: formData.code.trim(),
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        sort_order: formData.sort_order,
      });
      setFormData({ code: '', name: '', description: '', sort_order: 0 });
      setShowAddForm(false);
    } catch (error: any) {
      setError(error.message || 'Ошибка при добавлении категории');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (id: string, data: { 
    code: string; 
    name: string; 
    description: string; 
    is_active: boolean;
    sort_order: number;
  }) => {
    if (!data.code.trim() || !data.name.trim()) {
      setError('Код и название категории обязательны');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await updateCategory(id, {
        code: data.code.trim(),
        name: data.name.trim(),
        description: data.description.trim() || undefined,
        is_active: data.is_active,
        sort_order: data.sort_order,
      });
      setEditingId(null);
    } catch (error: any) {
      setError(error.message || 'Ошибка при обновлении категории');
    } finally {
      setSaving(false);
    }
  };

  const handleMoveUp = async (category: Category) => {
    const sortedCategories = [...categories].sort((a, b) => a.sort_order - b.sort_order);
    const currentIndex = sortedCategories.findIndex(c => c.id === category.id);
    
    if (currentIndex > 0) {
      const prevCategory = sortedCategories[currentIndex - 1];
      await updateCategory(category.id, { sort_order: prevCategory.sort_order });
      await updateCategory(prevCategory.id, { sort_order: category.sort_order });
    }
  };

  const handleMoveDown = async (category: Category) => {
    const sortedCategories = [...categories].sort((a, b) => a.sort_order - b.sort_order);
    const currentIndex = sortedCategories.findIndex(c => c.id === category.id);
    
    if (currentIndex < sortedCategories.length - 1) {
      const nextCategory = sortedCategories[currentIndex + 1];
      await updateCategory(category.id, { sort_order: nextCategory.sort_order });
      await updateCategory(nextCategory.id, { sort_order: category.sort_order });
    }
  };

  const startEdit = (item: Category) => {
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
            <p className="text-gray-600">Загрузка категорий...</p>
          </div>
        </div>
      </div>
    );
  }

  const sortedCategories = [...categories].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Заголовок */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Tag className="w-6 h-6 text-purple-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Управление категориями</h2>
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
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Добавить категорию
            </button>
          </div>

          {/* Форма добавления */}
          {showAddForm && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Новая категория</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Код *
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="equipment_work"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Название *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Работы на оборудовании"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Порядок
                  </label>
                  <input
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Описание
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Описание категории"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setFormData({ code: '', name: '', description: '', sort_order: 0 });
                    setError(null);
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={handleAdd}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 text-white bg-purple-600 rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50"
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

          {/* Список категорий */}
          <div className="space-y-4">
            {sortedCategories.length === 0 ? (
              <div className="text-center py-8">
                <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Категории не найдены</h3>
                <p className="text-gray-600">Добавьте первую категорию в справочник</p>
              </div>
            ) : (
              sortedCategories.map((item, index) => (
                <CategoryItem
                  key={item.id}
                  item={item}
                  isEditing={editingId === item.id}
                  onEdit={() => startEdit(item)}
                  onSave={(data) => handleUpdate(item.id, data)}
                  onCancel={cancelEdit}
                  onMoveUp={() => handleMoveUp(item)}
                  onMoveDown={() => handleMoveDown(item)}
                  canMoveUp={index > 0}
                  canMoveDown={index < sortedCategories.length - 1}
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

interface CategoryItemProps {
  item: Category;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (data: { 
    code: string; 
    name: string; 
    description: string; 
    is_active: boolean;
    sort_order: number;
  }) => void;
  onCancel: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  saving: boolean;
}

const CategoryItem: React.FC<CategoryItemProps> = ({
  item,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  saving
}) => {
  const [formData, setFormData] = useState({
    code: item.code,
    name: item.name,
    description: item.description || '',
    is_active: item.is_active,
    sort_order: item.sort_order,
  });

  const handleSave = () => {
    onSave(formData);
  };

  if (isEditing) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Код *
            </label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Название *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Порядок
            </label>
            <input
              type="number"
              value={formData.sort_order}
              onChange={(e) => setFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Описание
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <span className="text-sm text-gray-700">Активна</span>
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
              className="flex items-center gap-2 px-3 py-1 text-white bg-purple-600 rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50"
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
            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full font-mono">
              {item.code}
            </span>
            {!item.is_active && (
              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                Неактивна
              </span>
            )}
          </div>
          {item.description && (
            <p className="text-gray-600 mb-2">{item.description}</p>
          )}
          <p className="text-sm text-gray-500">
            Порядок: {item.sort_order} • Создано: {new Intl.DateTimeFormat('ru-RU', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }).format(item.created_at)}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onMoveUp}
            disabled={!canMoveUp}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-30"
            title="Переместить вверх"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
          <button
            onClick={onMoveDown}
            disabled={!canMoveDown}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-30"
            title="Переместить вниз"
          >
            <ArrowDown className="w-4 h-4" />
          </button>
          <button
            onClick={onEdit}
            className="p-2 text-gray-400 hover:text-purple-600 transition-colors"
            title="Редактировать"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryManager;