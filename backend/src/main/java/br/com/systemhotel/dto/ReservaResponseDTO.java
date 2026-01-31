package br.com.systemhotel.dto;

import br.com.systemhotel.entity.Reserva;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ReservaResponseDTO(
        Long id,

        Long quartoId,

        Long clienteId,

        LocalDate checkIn,

        LocalDate checkOut,

        Integer numeroHospedes,

        BigDecimal valorTotal,

        String observacoes,

        String clienteNome,

        Integer quartoNumero

){
    public ReservaResponseDTO(Reserva reserva) {
        this(reserva.getId(),
             reserva.getClienteId(),
             reserva.getQuartoId(),
             reserva.getCheckIn(),
             reserva.getCheckOut(),
             reserva.getNumeroHospedes(),
             reserva.getValorTotal(),
             reserva.getObservacoes(),
             reserva.getClienteNome(),
             reserva.getQuartoNumero()
        );
    }
}
