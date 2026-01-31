package br.com.systemhotel.dto;

import br.com.systemhotel.entity.Room;

import java.time.LocalDateTime;


public record CreateRoomDTO(

        Integer numero,

        Integer diaria,

        Room.StatusQuarto status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,

        String observacoes
) {}
