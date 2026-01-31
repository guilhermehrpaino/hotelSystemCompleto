import React from 'react';

interface ChartAreaProps {
  title: string;
  data: Array<{ mes: string; value: number; label?: string }>;
  color: string;
  maxValue: number;
  unit?: string;
  gradientId: string;
}

const ChartArea: React.FC<ChartAreaProps> = ({ 
  title, 
  data, 
  color, 
  maxValue, 
  unit = '', 
  gradientId 
}) => {
  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const formatValue = (value: number) => {
    if (unit === 'BRL') {
      return formatarMoeda(value).split(',')[0];
    }
    if (unit === '%') {
      return `${value.toFixed(1)}%`;
    }
    return value.toString();
  };

  const getGridLabel = (value: number) => {
    if (unit === 'BRL') {
      return formatarMoeda((value / 100) * maxValue).split(',')[0];
    }
    if (unit === '%') {
      return `${value}%`;
    }
    return Math.round((value / 100) * maxValue).toString();
  };

  return (
    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 p-6">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
        <span className={`w-2 h-2 ${color} rounded-full mr-3`}></span>
        {title}
      </h3>
      <div className="h-72 relative">
        <svg className="w-full h-full" viewBox="0 0 320 220" preserveAspectRatio="none">
          {/* Grid */}
          {[0, 25, 50, 75, 100].map((value, index) => (
            <g key={index}>
              <line
                x1="40"
                y1={200 - (value / 100) * 180}
                x2="300"
                y2={200 - (value / 100) * 180}
                stroke="#e5e7eb"
                strokeWidth="1"
                strokeDasharray="2,2"
              />
              <text
                x="35"
                y={200 - (value / 100) * 180 + 4}
                className="text-xs fill-gray-500"
                textAnchor="end"
              >
                {getGridLabel(value)}
              </text>
            </g>
          ))}
          
          {/* Gradient */}
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={color.replace('text-', '').replace('600', '500')} stopOpacity="0.4" />
              <stop offset="100%" stopColor={color.replace('text-', '').replace('600', '500')} stopOpacity="0.05" />
            </linearGradient>
          </defs>
          
          {/* Área preenchida */}
          {data.length > 0 && (
            <path
              d={`M ${data.map((_, index) => {
                const x = 40 + (index / Math.max(data.length - 1, 1)) * 260;
                const y = 200 - ((data[index]?.value || 0) / maxValue) * 180;
                return `${x},${y}`;
              }).join(' L ')} L 300,200 L 40,200 Z`}
              fill={`url(#${gradientId})`}
            />
          )}
          
          {/* Linha do gráfico */}
          {data.length > 0 && (
            <path
              d={`M ${data.map((_, index) => {
                const x = 40 + (index / Math.max(data.length - 1, 1)) * 260;
                const y = 200 - ((data[index]?.value || 0) / maxValue) * 180;
                return `${x},${y}`;
              }).join(' L ')}`}
              fill="none"
              stroke={color.replace('text-', '').replace('600', '500')}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
          
          {/* Pontos */}
          {data.map((item, index) => {
            const x = 40 + (index / Math.max(data.length - 1, 1)) * 260;
            const y = 200 - (item.value / maxValue) * 180;
            return (
              <g key={index}>
                <circle
                  cx={x}
                  cy={y}
                  r="5"
                  fill={color.replace('text-', '').replace('600', '500')}
                  stroke="white"
                  strokeWidth="3"
                />
                <text
                  x={x}
                  y={y - 10}
                  className="text-xs font-semibold fill-gray-700 dark:fill-gray-300"
                  textAnchor="middle"
                >
                  {formatValue(item.value)}
                </text>
              </g>
            );
          })}
          
          {/* Labels */}
          {data.map((item, index) => {
            const x = 40 + (index / Math.max(data.length - 1, 1)) * 260;
            return (
              <text
                key={index}
                x={x}
                y="215"
                className="text-xs fill-gray-600 dark:fill-gray-400"
                textAnchor="middle"
              >
                {item.mes.split(' ')[0]}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

export default ChartArea;
