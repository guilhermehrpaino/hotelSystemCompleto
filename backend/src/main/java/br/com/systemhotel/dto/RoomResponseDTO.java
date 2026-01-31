package br.com.systemhotel.dto;

import br.com.systemhotel.entity.Room;

import java.time.LocalDateTime;

public record RoomResponseDTO(
        Long id,
        Integer numero,
        Integer diaria,
        Room.StatusQuarto status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        String observacoes
) {

    public RoomResponseDTO(Room room) {
        this(

                room.getId(),
                room.getNumero(),
                room.getDiaria(),
                room.getStatus(),
                room.getCreatedAt(),
                room.getUpdatedAt(),
                room.getObservacoes()
    );
    }
}
