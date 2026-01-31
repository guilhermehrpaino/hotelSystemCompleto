package br.com.systemhotel.dto;

import jakarta.persistence.Column;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CreateReservaDTO(
        Long quartoId,

        LocalDate checkIn,

        LocalDate checkOut,

        Long clienteId,

        Integer numeroHospedes,

        BigDecimal valorTotal,

        String observacoes,

        String clienteNome,

        Integer quartoNumero,

        String status

) {}
