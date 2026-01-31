package br.com.systemhotel.service;

import br.com.systemhotel.dto.CreateRoomDTO;
import br.com.systemhotel.dto.RoomResponseDTO;
import br.com.systemhotel.entity.Reserva;
import br.com.systemhotel.entity.Room;
import br.com.systemhotel.repository.ReservaRepository;
import br.com.systemhotel.repository.RoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class RoomService {

    private final RoomRepository roomRepository;
    private final ReservaRepository reservaRepository;

    @Autowired
    public RoomService(RoomRepository roomRepository, ReservaRepository reservaRepository) {
        this.roomRepository = roomRepository;
        this.reservaRepository = reservaRepository;
    }

    public RoomResponseDTO createRoom(CreateRoomDTO dto) {

        if (roomRepository.existsByNumero(dto.numero())) {
            throw new IllegalStateException("Este quarto " + dto.numero() + " já existe!");
        }
                Room room = new Room(dto);
                room.setCreatedAt(LocalDateTime.now());
                roomRepository.save(room);
                return new RoomResponseDTO(room);
    }

    public Optional<Room> findByNumero(Integer numero) {
        return roomRepository.findByNumero(numero);
    }

    public List<Room> findAll() {
        return roomRepository.findAll();
    }

    public boolean existsById(Long id) {
        return roomRepository.existsById(id);
    }

    public Room updateRoom(Room room) {
        room.setUpdatedAt(LocalDateTime.now());
        roomRepository.save(room);
        return new Room();
    }

    public Room findById(Long id) {
        return roomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Quarto não encontrado"));
    }

    public void deleteById(Long id) {
        roomRepository.deleteById(id);
    }
}
