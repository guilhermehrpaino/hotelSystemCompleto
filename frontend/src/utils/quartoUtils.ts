/**
 * Utilitário para padronizar tipos de quartos baseado no número
 */

export const getTipoQuarto = (numero: number): string => {
  if ((numero >= 100 && numero <= 105) || (numero >= 106 && numero <= 110)) {
    return 'Standard';
  } else if (numero >= 200 && numero <= 210) {
    return 'Superior';
  } else if (numero >= 300 && numero <= 310) {
    return 'Superior Premium';
  } else if ((numero >= 400 && numero <= 410) || (numero >= 500 && numero <= 510)) {
    return 'Suite Luxo';
  }
  return 'Standard'; // Padrão para quartos fora das faixas
};

/**
 * Retorna a cor do tipo do quarto para exibição
 */
export const getTipoQuartoColor = (tipo: string): string => {
  switch (tipo) {
    case 'Standard':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    case 'Superior':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'Superior Premium':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    case 'Suite Luxo':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
};

/**
 * Retorna o ícone do tipo do quarto
 */
export const getTipoQuartoIcon = (tipo: string): string => {
  switch (tipo) {
    case 'Standard':
      return '🛏️';
    case 'Superior':
      return '⭐';
    case 'Superior Premium':
      return '💎';
    case 'Suite Luxo':
      return '👑';
    default:
      return '🛏️';
  }
};
