import React from 'react';
import { Search, Filter, Calendar } from 'lucide-react';
import { HandoverFilterOptions } from '../types';

interface ShiftHandoverFiltersProps {
  filters: HandoverFilterOptions;
  onFiltersChange: (filters: HandoverFilterOptions) => void;
}

const ShiftHandoverFilters: React.FC<ShiftHandoverFiltersProps> = ({ filters, onFiltersChange }) => {
  const statusOptions = [
    { value: 'pending', label: 'Ожидает приема' },
    { value: 'completed', label: 'Завершена' },
    { value: 'cancelled', label: 'Отменена' },
  ];

  const shiftTypeOptions = [
    { value: 'day', label: 'Дневная' },
    { value: 'night', label: 'Ночная' },
  ];

  const handleFilterChange = (key: keyof HandoverFilterOptions, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined
    });
  };

  const handleDateChange = (key: 'dateFrom' | 'dateTo', value: string) => {
    const date = value ? new Date(value) : undefined;
    handleFilterChange(key, date);
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const formatDateForInput = (date?: Date) => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== undefined && value !== '');

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-gray-500" />
        <h3 className="text-lg font-semibold text-gray-900">Фильтры</h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="ml-auto text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            Очистить все
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* Первая строка */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Поиск по оператору */}
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск по оператору..."
              value={filters.operator || ''}
              onChange={(e) => handleFilterChange('operator', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Дата от */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={formatDateForInput(filters.dateFrom)}
              onChange={(e) => handleDateChange('dateFrom', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Дата от"
            />
            <label className="absolute -top-2 left-2 bg-white px-1 text-xs text-gray-600">
              Дата от
            </label>
          </div>

          {/* Дата до */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={formatDateForInput(filters.dateTo)}
              onChange={(e) => handleDateChange('dateTo', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Дата до"
            />
            <label className="absolute -top-2 left-2 bg-white px-1 text-xs text-gray-600">
              Дата до
            </label>
          </div>
        </div>

        {/* Вторая строка */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Статус */}
          <select
            value={filters.status || ''}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="">Все статусы</option>
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Тип смены */}
          <select
            value={filters.shift_type || ''}
            onChange={(e) => handleFilterChange('shift_type', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="">Все смены</option>
            {shiftTypeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Быстрые фильтры по дате */}
          <div className="flex gap-2 lg:col-span-2">
            <button
              onClick={() => {
                const today = new Date();
                handleFilterChange('dateFrom', today);
                handleFilterChange('dateTo', today);
              }}
              className="px-3 py-2 text-sm bg-indigo-50 text-indigo-700 rounded-md hover:bg-indigo-100 transition-colors"
            >
              Сегодня
            </button>
            <button
              onClick={() => {
                const today = new Date();
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);
                handleFilterChange('dateFrom', yesterday);
                handleFilterChange('dateTo', yesterday);
              }}
              className="px-3 py-2 text-sm bg-indigo-50 text-indigo-700 rounded-md hover:bg-indigo-100 transition-colors"
            >
              Вчера
            </button>
            <button
              onClick={() => {
                const today = new Date();
                const weekAgo = new Date(today);
                weekAgo.setDate(weekAgo.getDate() - 7);
                handleFilterChange('dateFrom', weekAgo);
                handleFilterChange('dateTo', today);
              }}
              className="px-3 py-2 text-sm bg-indigo-50 text-indigo-700 rounded-md hover:bg-indigo-100 transition-colors"
            >
              Неделя
            </button>
          </div>
        </div>

        {/* Индикатор активных фильтров */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            <span className="text-sm text-gray-600">Активные фильтры:</span>
            {filters.operator && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                Оператор: "{filters.operator}"
                <button
                  onClick={() => handleFilterChange('operator', '')}
                  className="hover:text-blue-900"
                >
                  ×
                </button>
              </span>
            )}
            {filters.dateFrom && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                От: {formatDateForInput(filters.dateFrom)}
                <button
                  onClick={() => handleFilterChange('dateFrom', undefined)}
                  className="hover:text-green-900"
                >
                  ×
                </button>
              </span>
            )}
            {filters.dateTo && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                До: {formatDateForInput(filters.dateTo)}
                <button
                  onClick={() => handleFilterChange('dateTo', undefined)}
                  className="hover:text-green-900"
                >
                  ×
                </button>
              </span>
            )}
            {filters.status && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                Статус: {statusOptions.find(s => s.value === filters.status)?.label}
                <button
                  onClick={() => handleFilterChange('status', '')}
                  className="hover:text-purple-900"
                >
                  ×
                </button>
              </span>
            )}
            {filters.shift_type && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs">
                Смена: {shiftTypeOptions.find(s => s.value === filters.shift_type)?.label}
                <button
                  onClick={() => handleFilterChange('shift_type', '')}
                  className="hover:text-amber-900"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShiftHandoverFilters;