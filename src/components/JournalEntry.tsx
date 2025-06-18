import React, { useState } from 'react';
import { Clock, MapPin, Settings, X, Eye, Tag } from 'lucide-react';
import { JournalEntry as JournalEntryType } from '../types';
import CategoryIcon from './CategoryIcon';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import CancelEntryModal from './CancelEntryModal';
import EntryDetailModal from './EntryDetailModal';

interface JournalEntryProps {
  entry: JournalEntryType;
  onCancel: (id: string, reason: string, cancelledBy: string) => void;
}

const JournalEntry: React.FC<JournalEntryProps> = ({ entry, onCancel }) => {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const getCategoryLabel = () => {
    if (entry.categoryData) {
      return entry.categoryData.name;
    }
    
    // Fallback для старых записей
    const labels = {
      equipment_work: 'Работы на оборудовании',
      relay_protection: 'РЗА и телемеханика',
      team_permits: 'Допуски бригад',
      emergency: 'Аварийные сообщения',
      network_outages: 'Отключения в сети',
      other: 'Прочие события'
    };
    return labels[entry.category as keyof typeof labels] || entry.category;
  };

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const handleCancel = (reason: string, cancelledBy: string) => {
    onCancel(entry.id, reason, cancelledBy);
    setShowCancelModal(false);
  };

  return (
    <>
      <div className={`bg-white rounded-lg shadow-sm border-l-4 p-6 transition-all duration-200 hover:shadow-md ${
        entry.status === 'cancelled' ? 'border-l-red-500 opacity-75' :
        entry.status === 'draft' ? 'border-l-amber-500' :
        entry.priority === 'critical' ? 'border-l-red-600' :
        entry.priority === 'high' ? 'border-l-orange-500' : 'border-l-blue-500'
      }`}>
        {/* Заголовок */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3 flex-1">
            <div className={`p-2 rounded-lg ${
              entry.status === 'cancelled' ? 'bg-red-100' :
              entry.status === 'draft' ? 'bg-amber-100' : 'bg-blue-100'
            }`}>
              <CategoryIcon 
                category={entry.category} 
                className={`w-5 h-5 ${
                  entry.status === 'cancelled' ? 'text-red-600' :
                  entry.status === 'draft' ? 'text-amber-600' : 'text-blue-600'
                }`}
              />
            </div>
            <div className="flex-1">
              <h3 className={`text-lg font-semibold mb-1 ${
                entry.status === 'cancelled' ? 'text-gray-600 line-through' : 'text-gray-900'
              }`}>
                {entry.title}
              </h3>
              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                <span>{getCategoryLabel()}</span>
                <span>•</span>
                <span>{entry.author}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDetailModal(true)}
              className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
              title="Подробнее"
            >
              <Eye className="w-4 h-4" />
            </button>
            {entry.status === 'active' && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                title="Отменить запись"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Статусы и приоритет */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <StatusBadge status={entry.status} />
          <PriorityBadge priority={entry.priority} />
        </div>

        {/* Описание */}
        <p className={`text-gray-700 mb-4 line-clamp-3 ${
          entry.status === 'cancelled' ? 'text-gray-500' : ''
        }`}>
          {entry.description}
        </p>

        {/* Дополнительная информация */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{formatDateTime(entry.timestamp)}</span>
          </div>
          {entry.location && (
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{entry.location.name}</span>
            </div>
          )}
          {entry.equipment && (
            <div className="flex items-center gap-1">
              <Settings className="w-4 h-4" />
              <span>{entry.equipment.name}</span>
            </div>
          )}
        </div>

        {/* Информация об отмене */}
        {entry.status === 'cancelled' && entry.cancelledAt && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 mt-4">
            <div className="text-sm text-red-800">
              <div className="font-medium">Запись отменена</div>
              <div className="mt-1">
                {formatDateTime(entry.cancelledAt)} пользователем {entry.cancelledBy}
              </div>
              {entry.cancelReason && (
                <div className="mt-1">
                  <span className="font-medium">Причина:</span> {entry.cancelReason}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Модальные окна */}
      {showCancelModal && (
        <CancelEntryModal
          entry={entry}
          onCancel={handleCancel}
          onClose={() => setShowCancelModal(false)}
        />
      )}

      {showDetailModal && (
        <EntryDetailModal
          entry={entry}
          onClose={() => setShowDetailModal(false)}
        />
      )}
    </>
  );
};

export default JournalEntry;
