import React from 'react';

interface ChartBarProps {
  title: string;
  data: Array<{ mes: string; value: number; label?: string }>;
  color: string;
  maxValue: number;
  unit?: string;
  gradientId: string;
}

const ChartBar: React.FC<ChartBarProps> = ({ 
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

  const getBarColor = () => {
    switch (color) {
      case 'text-blue-600': return '#3b82f6';
      case 'text-emerald-600': return '#10b981';
      case 'text-purple-600': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  return (
    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 p-6">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
        <span className={`w-2 h-2 ${color} rounded-full mr-3`}></span>
        {title}
      </h3>
      <div className="h-72 relative">
        <svg className="w-full h-full" viewBox="0 0 360 220" preserveAspectRatio="none">
          {/* Grid */}
          {[0, 25, 50, 75, 100].map((value, index) => (
            <g key={index}>
              <line
                x1="60"
                x2="320"
                y1={200 - (value / 100) * 180}
                y2={200 - (value / 100) * 180}
                stroke="#e5e7eb"
                strokeWidth="1"
                strokeDasharray="2,2"
              />
              <text
                x="50"
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
              <stop offset="0%" stopColor={getBarColor()} stopOpacity="0.8" />
              <stop offset="100%" stopColor={getBarColor()} stopOpacity="0.3" />
            </linearGradient>
          </defs>
          
          {/* Barras animadas */}
          {data.map((item, index) => {
            const barWidth = Math.max(20, 220 / data.length - 10);
            const x = 60 + (index / Math.max(data.length - 1, 1)) * 260 - barWidth / 2;
            const barHeight = (item.value / maxValue) * 180;
            const y = 200 - barHeight;
            
            return (
              <g key={index}>
                {/* Barra */}
                <rect
                  x={x}
                  y={200}
                  width={barWidth}
                  height={0}
                  fill={`url(#${gradientId})`}
                  rx="4"
                  className="animate-bar-grow"
                  style={{
                    animation: `barGrow 0.8s ease-out ${index * 0.1}s forwards`,
                    transformOrigin: 'bottom'
                  }}
                >
                  <animate
                    attributeName="height"
                    from="0"
                    to={barHeight}
                    dur="0.8s"
                    begin={`${index * 0.1}s`}
                    fill="freeze"
                  />
                  <animate
                    attributeName="y"
                    from="200"
                    to={y}
                    dur="0.8s"
                    begin={`${index * 0.1}s`}
                    fill="freeze"
                  />
                </rect>
                
                {/* Valor no topo da barra */}
                <text
                  x={x + barWidth / 2}
                  y={y - 8}
                  className="text-xs font-semibold fill-gray-700 dark:fill-gray-300"
                  textAnchor="middle"
                  opacity="0"
                >
                  {formatValue(item.value)}
                  <animate
                    attributeName="opacity"
                    from="0"
                    to="1"
                    dur="0.3s"
                    begin={`${index * 0.1 + 0.6}s`}
                    fill="freeze"
                  />
                </text>
                
                {/* Label do mês */}
                <text
                  x={x + barWidth / 2}
                  y="215"
                  className="text-xs fill-gray-600 dark:fill-gray-400"
                  textAnchor="middle"
                >
                  {item.mes.split(' ')[0]}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

export default ChartBar;
