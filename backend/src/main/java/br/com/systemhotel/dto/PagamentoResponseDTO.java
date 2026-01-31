package br.com.systemhotel.dto;

import br.com.systemhotel.entity.Pagamento;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record PagamentoResponseDTO(
        Long id,
        Long clienteId,
        LocalDateTime createdAt,
        LocalDate dataPagamento,
        String metodo,
        String observacoes,
        String status,
        String tipo,
        BigDecimal valor)
{
    public PagamentoResponseDTO(Pagamento pagamento) {
        this(pagamento.getId(),
             pagamento.getClienteId(),
             pagamento.getCreatedAt(),
             pagamento.getDataPagamento(),
             pagamento.getObservacoes(),
             pagamento.getStatus(),
             pagamento.getMetodo(),
             pagamento.getTipo(),
             pagamento.getValor()

        );
    }
}
