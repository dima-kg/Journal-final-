import React, { useState } from 'react';
import { Clock, User, CheckCircle, XCircle, AlertCircle, Calendar, MessageSquare } from 'lucide-react';
import { ShiftHandover } from '../types';

interface ShiftHandoverCardProps {
  handover: ShiftHandover;
  onAccept: (id: string, notes?: string) => void;
  onComplete: (id: string) => void;
  onCancel: (id: string) => void;
  currentUserId: string;
}

const ShiftHandoverCard: React.FC<ShiftHandoverCardProps> = ({
  handover,
  onAccept,
  onComplete,
  onCancel,
  currentUserId
}) => {
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [acceptNotes, setAcceptNotes] = useState('');

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  const getStatusColor = () => {
    switch (handover.status) {
      case 'pending':
        return 'border-l-amber-500 bg-amber-50';
      case 'completed':
        return 'border-l-green-500 bg-green-50';
      case 'cancelled':
        return 'border-l-red-500 bg-red-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const getStatusLabel = () => {
    switch (handover.status) {
      case 'pending':
        return 'Ожидает приема';
      case 'completed':
        return 'Завершена';
      case 'cancelled':
        return 'Отменена';
      default:
        return handover.status;
    }
  };

  const getShiftTypeLabel = () => {
    return handover.shift_type === 'day' ? 'Дневная' : 'Ночная';
  };

  const canAccept = handover.status === 'pending' && currentUserId !== handover.outgoing_operator_id;
  const canComplete = handover.status === 'pending' && currentUserId === handover.outgoing_operator_id;
  const canCancel = handover.status === 'pending' && currentUserId === handover.outgoing_operator_id;

  const handleAccept = () => {
    onAccept(handover.id, acceptNotes || undefined);
    setShowAcceptModal(false);
    setAcceptNotes('');
  };

  return (
    <>
      <div className={`bg-white rounded-lg shadow-sm border-l-4 p-6 transition-all duration-200 hover:shadow-md ${getStatusColor()}`}>
        {/* Заголовок */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Clock className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  {getShiftTypeLabel()} смена
                </h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  handover.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                  handover.status === 'completed' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {getStatusLabel()}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(handover.shift_date)}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {canAccept && (
              <button
                onClick={() => setShowAcceptModal(true)}
                className="flex items-center gap-1 px-3 py-1 text-green-700 bg-green-100 rounded-md hover:bg-green-200 transition-colors"
                title="Принять смену"
              >
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Принять</span>
              </button>
            )}
            {canComplete && (
              <button
                onClick={() => onComplete(handover.id)}
                className="flex items-center gap-1 px-3 py-1 text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors"
                title="Завершить сдачу"
              >
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Завершить</span>
              </button>
            )}
            {canCancel && (
              <button
                onClick={() => onCancel(handover.id)}
                className="flex items-center gap-1 px-3 py-1 text-red-700 bg-red-100 rounded-md hover:bg-red-200 transition-colors"
                title="Отменить сдачу"
              >
                <XCircle className="w-4 h-4" />
                <span className="text-sm">Отменить</span>
              </button>
            )}
          </div>
        </div>

        {/* Операторы */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-sm text-gray-600">Сдающий</p>
              <p className="font-medium">{handover.outgoing_operator_name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-sm text-gray-600">Принимающий</p>
              <p className="font-medium">
                {handover.incoming_operator_name || 'Не назначен'}
              </p>
            </div>
          </div>
        </div>

        {/* Дополнительная информация */}
        <div className="space-y-3">
          {handover.ongoing_works && (
            <div>
              <h4 className="text-sm font-medium text-gray-700">Текущие работы</h4>
              <p className="text-sm text-gray-600 mt-1">{handover.ongoing_works}</p>
            </div>
          )}

          {handover.special_instructions && (
            <div>
              <h4 className="text-sm font-medium text-gray-700">Особые указания</h4>
              <p className="text-sm text-gray-600 mt-1">{handover.special_instructions}</p>
            </div>
          )}

          {handover.incidents && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <AlertCircle className="w-4 h-4 text-orange-500" />
                Происшествия
              </h4>
              <p className="text-sm text-gray-600 mt-1">{handover.incidents}</p>
            </div>
          )}

          {handover.handover_notes && (
            <div>
              <h4 className="text-sm font-medium text-gray-700">Примечания при приеме</h4>
              <p className="text-sm text-gray-600 mt-1">{handover.handover_notes}</p>
            </div>
          )}
        </div>

        {/* Временные метки */}
        <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t text-xs text-gray-500">
          <span>Создано: {formatDateTime(handover.created_at)}</span>
          {handover.handed_over_at && (
            <span>Сдано: {formatDateTime(handover.handed_over_at)}</span>
          )}
          {handover.received_at && (
            <span>Принято: {formatDateTime(handover.received_at)}</span>
          )}
        </div>
      </div>

      {/* Модальное окно приема смены */}
      {showAcceptModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Прием смены</h3>
              <button
                onClick={() => setShowAcceptModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <p className="text-gray-700 mb-2">
                  Вы принимаете {getShiftTypeLabel().toLowerCase()} смену от{' '}
                  <strong>{handover.outgoing_operator_name}</strong>
                </p>
                <p className="text-sm text-gray-600">
                  Дата смены: {formatDate(handover.shift_date)}
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Примечания при приеме (необязательно)
                </label>
                <textarea
                  value={acceptNotes}
                  onChange={(e) => setAcceptNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Ваши комментарии или замечания по приему смены"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowAcceptModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={handleAccept}
                  className="flex items-center gap-2 px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Принять смену
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ShiftHandoverCard;
