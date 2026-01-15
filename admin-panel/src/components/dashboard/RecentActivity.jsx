import React from 'react';
import { Phone, Clock, CheckCircle, XCircle } from 'lucide-react';

function RecentActivity({ activities }) {
  // Datos de ejemplo si no hay activities
  const defaultActivities = [
    {
      id: 1,
      type: 'call',
      message: 'Llamada entrante de +57 300 123 4567',
      time: 'Hace 2 minutos',
      status: 'success'
    },
    {
      id: 2,
      type: 'transfer',
      message: 'Transferencia exitosa a Almacenes Éxito',
      time: 'Hace 5 minutos',
      status: 'success'
    },
    {
      id: 3,
      type: 'error',
      message: 'Error de detección en intención "buscar_local"',
      time: 'Hace 8 minutos',
      status: 'error'
    },
    {
      id: 4,
      type: 'call',
      message: 'Llamada completada - Duración: 2:15',
      time: 'Hace 12 minutos',
      status: 'success'
    },
    {
      id: 5,
      type: 'timeout',
      message: 'Timeout detectado - Usuario inactivo',
      time: 'Hace 15 minutos',
      status: 'warning'
    }
  ];

  const activityList = activities || defaultActivities;

  const getIcon = (type) => {
    switch (type) {
      case 'call':
      case 'transfer':
        return <Phone className="w-5 h-5" />;
      case 'error':
        return <XCircle className="w-5 h-5" />;
      case 'timeout':
        return <Clock className="w-5 h-5" />;
      default:
        return <CheckCircle className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-600';
      case 'error':
        return 'bg-red-100 text-red-600';
      case 'warning':
        return 'bg-yellow-100 text-yellow-600';
      default:
        return 'bg-blue-100 text-blue-600';
    }
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Actividad Reciente
      </h3>
      <div className="space-y-4">
        {activityList.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${getStatusColor(activity.status)}`}>
              {getIcon(activity.type)}
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-900">{activity.message}</p>
              <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RecentActivity;