import React, { useState } from 'react';
import { X, Save, Clock, User, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface ShiftHandoverFormProps {
  onSubmit: (data: {
    shift_date: Date;
    shift_type: 'day' | 'night';
    ongoing_works?: string;
    special_instructions?: string;
    incidents?: string;
  }) => Promise<void>;
  onClose: () => void;
}

const ShiftHandoverForm: React.FC<ShiftHandoverFormProps> = ({ onSubmit, onClose }) => {
  const { getUserDisplayName } = useAuth();
  
  const [formData, setFormData] = useState({
    shift_date: new Date().toISOString().split('T')[0],
    shift_type: 'day' as 'day' | 'night',
    ongoing_works: '',
    special_instructions: '',
    incidents: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    setError(null);

    try {
      await onSubmit({
        shift_date: new Date(formData.shift_date),
        shift_type: formData.shift_type,
        ongoing_works: formData.ongoing_works || undefined,
        special_instructions: formData.special_instructions || undefined,
        incidents: formData.incidents || undefined,
      });
      onClose();
    } catch (error: any) {
      setError(error.message || 'Произошла ошибка при создании сдачи смены');
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Заголовок */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Clock className="w-6 h-6 text-indigo-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Сдача смены</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Основная информация */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Дата смены *
              </label>
              <input
                type="date"
                value={formData.shift_date}
                onChange={(e) => handleChange('shift_date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Тип смены *
              </label>
              <select
                value={formData.shift_type}
                onChange={(e) => handleChange('shift_type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
                disabled={loading}
              >
                <option value="day">Дневная</option>
                <option value="night">Ночная</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Сдающий оператор
              </label>
              <div className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-gray-700">{getUserDisplayName()}</span>
              </div>
            </div>
          </div>

          {/* Текущие работы */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Текущие работы
            </label>
            <textarea
              value={formData.ongoing_works}
              onChange={(e) => handleChange('ongoing_works', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Опишите текущие работы, которые будут продолжены на следующей смене"
              disabled={loading}
            />
          </div>

          {/* Особые указания */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Особые указания
            </label>
            <textarea
              value={formData.special_instructions}
              onChange={(e) => handleChange('special_instructions', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Особые указания для принимающего смену оператора"
              disabled={loading}
            />
          </div>

          {/* Происшествия */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Происшествия за смену
            </label>
            <textarea
              value={formData.incidents}
              onChange={(e) => handleChange('incidents', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Опишите все происшествия, аварии или нештатные ситуации за смену"
              disabled={loading}
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
              type="submit"
              className="flex items-center gap-2 px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="w-4 h-4" />
              )}
              Создать сдачу смены
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShiftHandoverForm;
