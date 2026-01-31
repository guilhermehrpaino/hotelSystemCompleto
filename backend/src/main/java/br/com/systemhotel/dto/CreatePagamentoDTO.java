package br.com.systemhotel.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record CreatePagamentoDTO(
        Long id,
        Long clienteId,
        LocalDateTime createdAt,
        LocalDate dataPagamento,
        String metodo,
        String observacoes,
        String status,
        String tipo,
        BigDecimal valor
) {
}
