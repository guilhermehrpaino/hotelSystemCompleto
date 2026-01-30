// Utilitários para tratamento de datas no fuso de Brasília (UTC-3)

/**
 * Converte uma string de data para o fuso de Brasília
 * @param dataString - Data em formato ISO string
 * @returns Date ajustada para fuso de Brasília
 */
export const converterParaBrasilia = (dataString: string): Date => {
  const data = new Date(dataString);
  // Ajustar para fuso de Brasília (UTC-3)
  const offsetBrasil = -3; // Brasília está 3 horas atrás de UTC
  const offsetLocal = data.getTimezoneOffset() / 60; // Offset local em horas
  const diferenca = offsetLocal - offsetBrasil;
  
  data.setHours(data.getHours() + diferenca);
  return data;
};

/**
 * Formata uma data para o padrão de input (YYYY-MM-DD) considerando Brasília
 * @param data - Objeto Date
 * @returns String formatada para input
 */
export const formatarDataInput = (data: Date): string => {
  const dataBrasilia = converterParaBrasilia(data.toISOString());
  return dataBrasilia.toISOString().split('T')[0];
};

/**
 * Formata uma data para exibição no padrão brasileiro (DD/MM/YYYY)
 * @param dataString - Data em formato ISO string
 * @returns String formatada para exibição
 */
export const formatarDataBrasil = (dataString: string): string => {
  return converterParaBrasilia(dataString).toLocaleDateString('pt-BR');
};

/**
 * Obtém a data atual no fuso de Brasília
 * @returns Date atual ajustada para Brasília
 */
export const getDataAtualBrasilia = (): Date => {
  return converterParaBrasilia(new Date().toISOString());
};

/**
 * Obtém a data atual formatada para input (YYYY-MM-DD) no fuso de Brasília
 * @returns String formatada para input
 */
export const getDataAtualInput = (): string => {
  const agora = new Date();
  // Ajustar para Brasília (UTC-3)
  const brasiliaOffset = -3 * 60 * 60 * 1000;
  const dataBrasilia = new Date(agora.getTime() + (agora.getTimezoneOffset() * 60 * 1000) + brasiliaOffset);
  
  // Formatar como YYYY-MM-DD
  const ano = dataBrasilia.getFullYear();
  const mes = String(dataBrasilia.getMonth() + 1).padStart(2, '0');
  const dia = String(dataBrasilia.getDate()).padStart(2, '0');
  
  return `${ano}-${mes}-${dia}`;
};

/**
 * Calcula a diferença em dias entre duas datas considerando Brasília
 * @param dataInicioString - Data de início em formato ISO string
 * @param dataFimString - Data de fim em formato ISO string
 * @returns Número de dias
 */
export const calcularDiferencaDias = (dataInicioString: string, dataFimString: string): number => {
  const dataInicio = converterParaBrasilia(dataInicioString);
  const dataFim = converterParaBrasilia(dataFimString);
  
  const diffTime = Math.abs(dataFim.getTime() - dataInicio.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Adiciona dias a uma data considerando Brasília
 * @param dataString - Data base em formato ISO string
 * @param dias - Número de dias a adicionar
 * @returns Nova data formatada para input
 */
export const adicionarDias = (dataString: string, dias: number): string => {
  const data = converterParaBrasilia(dataString);
  data.setDate(data.getDate() + dias);
  return formatarDataInput(data);
};

/**
 * Verifica se uma data é hoje considerando Brasília (UTC-3)
 * @param dataString - Data a verificar (formato YYYY-MM-DD ou ISO)
 * @returns True se for hoje
 */
export const ehHoje = (dataString: string): boolean => {
  // Extrair apenas a parte da data (YYYY-MM-DD)
  const dataParte = dataString.split('T')[0];
  const [ano, mes, dia] = dataParte.split('-').map(Number);
  
  // Obter data atual em Brasília (UTC-3)
  const agora = new Date();
  const brasiliaOffset = -3 * 60 * 60 * 1000; // -3 horas em ms
  const dataBrasilia = new Date(agora.getTime() + (agora.getTimezoneOffset() * 60 * 1000) + brasiliaOffset);
  
  // Comparar ano, mês e dia
  return ano === dataBrasilia.getFullYear() && 
         mes === (dataBrasilia.getMonth() + 1) && 
         dia === dataBrasilia.getDate();
};

/**
 * Verifica se uma data é anterior a hoje considerando Brasília
 * @param dataString - Data a verificar em formato ISO string
 * @returns True se for anterior
 */
export const ehAnteriorHoje = (dataString: string): boolean => {
  const data = converterParaBrasilia(dataString);
  const hoje = getDataAtualBrasilia();
  
  return data < hoje;
};

/**
 * Verifica se uma data é posterior a hoje considerando Brasília
 * @param dataString - Data a verificar em formato ISO string
 * @returns True se for posterior
 */
export const ehPosteriorHoje = (dataString: string): boolean => {
  const data = converterParaBrasilia(dataString);
  const hoje = getDataAtualBrasilia();
  
  return data > hoje;
};
