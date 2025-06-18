import React from 'react';
import { Search, Filter, Calendar } from 'lucide-react';
import { FilterOptions, EntryStatus } from '../types';
import { useEquipment } from '../hooks/useEquipment';
import { useLocations } from '../hooks/useLocations';
import { useCategories } from '../hooks/useCategories';

interface JournalFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
}

const JournalFilters: React.FC<JournalFiltersProps> = ({ filters, onFiltersChange }) => {
  const { getActiveEquipment } = useEquipment();
  const { getActiveLocations } = useLocations();
  const { getActiveCategories } = useCategories();

  const statusOptions: { value: EntryStatus; label: string }[] = [
    { value: 'draft', label: 'Черновики' },
    { value: 'active', label: 'Активные' },
    { value: 'cancelled', label: 'Отмененные' },
  ];

  const priorityOptions = [
    { value: 'low', label: 'Низкий' },
    { value: 'medium', label: 'Средний' },
    { value: 'high', label: 'Высокий' },
    { value: 'critical', label: 'Критический' },
  ];

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
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
  const activeEquipment = getActiveEquipment();
  const activeLocations = getActiveLocations();
  const activeCategories = getActiveCategories();

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
        {/* Первая строка - поиск и даты */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Поиск */}
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск по записям..."
              value={filters.searchText || ''}
              onChange={(e) => handleFilterChange('searchText', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Дата от */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={formatDateForInput(filters.dateFrom)}
              onChange={(e) => handleDateChange('dateFrom', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Дата до"
            />
            <label className="absolute -top-2 left-2 bg-white px-1 text-xs text-gray-600">
              Дата до
            </label>
          </div>
        </div>

        {/* Вторая строка - остальные фильтры */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Категория */}
          <select
            value={filters.categoryId || ''}
            onChange={(e) => handleFilterChange('categoryId', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Все категории</option>
            {activeCategories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          {/* Статус */}
          <select
            value={filters.status || ''}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Все статусы</option>
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Приоритет */}
          <select
            value={filters.priority || ''}
            onChange={(e) => handleFilterChange('priority', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Все приоритеты</option>
            {priorityOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Оборудование */}
          <select
            value={filters.equipmentId || ''}
            onChange={(e) => handleFilterChange('equipmentId', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Все оборудование</option>
            {activeEquipment.map(item => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        {/* Третья строка - местоположение */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Местоположение */}
          <select
            value={filters.locationId || ''}
            onChange={(e) => handleFilterChange('locationId', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Все местоположения</option>
            {activeLocations.map(item => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>

          {/* Быстрые фильтры по дате */}
          <div className="flex gap-2 lg:col-span-3">
            <button
              onClick={() => {
                const today = new Date();
                handleFilterChange('dateFrom', today);
                handleFilterChange('dateTo', today);
              }}
              className="px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors"
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
              className="px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors"
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
              className="px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors"
            >
              Неделя
            </button>
            <button
              onClick={() => {
                const today = new Date();
                const monthAgo = new Date(today);
                monthAgo.setMonth(monthAgo.getMonth() - 1);
                handleFilterChange('dateFrom', monthAgo);
                handleFilterChange('dateTo', today);
              }}
              className="px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors"
            >
              Месяц
            </button>
          </div>
        </div>

        {/* Индикатор активных фильтров */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            <span className="text-sm text-gray-600">Активные фильтры:</span>
            {filters.searchText && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                Поиск: "{filters.searchText}"
                <button
                  onClick={() => handleFilterChange('searchText', '')}
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
            {filters.categoryId && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                Категория: {activeCategories.find(c => c.id === filters.categoryId)?.name}
                <button
                  onClick={() => handleFilterChange('categoryId', '')}
                  className="hover:text-purple-900"
                >
                  ×
                </button>
              </span>
            )}
            {filters.status && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs">
                Статус: {statusOptions.find(s => s.value === filters.status)?.label}
                <button
                  onClick={() => handleFilterChange('status', '')}
                  className="hover:text-amber-900"
                >
                  ×
                </button>
              </span>
            )}
            {filters.priority && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs">
                Приоритет: {priorityOptions.find(p => p.value === filters.priority)?.label}
                <button
                  onClick={() => handleFilterChange('priority', '')}
                  className="hover:text-orange-900"
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

export default JournalFilters;
