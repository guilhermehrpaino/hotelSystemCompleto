package br.com.systemhotel.controller;

import br.com.systemhotel.dto.CreateRoomDTO;
import br.com.systemhotel.dto.RoomResponseDTO;
import br.com.systemhotel.entity.Room;
import br.com.systemhotel.service.RoomService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/quartos")
public class AdminRoomController {

    private final RoomService roomService;

    @Autowired
    public AdminRoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    @PostMapping
    public RoomResponseDTO create(@Valid @RequestBody CreateRoomDTO dto) {
        return roomService.createRoom(dto);
    }

    @GetMapping
    public List<Room> showAllRooms() {
        return roomService.findAll();
    }


    @PutMapping("/{id}")
    public ResponseEntity<?> updateRoom(@PathVariable Long id, @Valid @RequestBody Room room) {
        try {
            if (!roomService.existsById(id)) {
                return ResponseEntity.notFound().build();
            }
            room.setId(id);
            room.setStatus(Room.StatusQuarto.DISPONIVEL);
            Room updatedRoom = roomService.updateRoom(room);
            return ResponseEntity.ok(updatedRoom);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }

    }


    @PutMapping("/{id}/checkin")
    public ResponseEntity<Room> atualizarStatusQuarto(
            @PathVariable Long id,
            @RequestBody Map<String, Room.StatusQuarto> requestBody
    ) {
        Room.StatusQuarto novoStatus = requestBody.get("status");
        Room room = roomService.findById(id);
        room.setId(id);
        room.setStatus(novoStatus);
        room = roomService.updateRoom(room);
        return ResponseEntity.ok(room);
    }

    @GetMapping("/{id}")
    public Room findRoomDataById(@PathVariable Long id) {
        return roomService.findById(id);
    }


    @PutMapping("/{id}/checkout")
    public ResponseEntity<Room> atualizarStatusOcupado(
            @PathVariable Long id,
            @RequestBody Map<String, Room.StatusQuarto> requestBody
    ) {

        Room.StatusQuarto novoStatus = requestBody.get("status");
        Room room = roomService.findById(id);
        room.setId(id);
        room.setStatus(novoStatus);
        room = roomService.updateRoom(room);
        return ResponseEntity.ok(room);
    }

    @PutMapping("/{id}/observacao")
    public ResponseEntity<Room> updateObservacao(
            @PathVariable Long id,
            @RequestBody Map<String, String> requestBody
    ) {

        String novaObservacao = requestBody.get("observacoes");
        Room room = roomService.findById(id);
        room.setId(id);
        room.setObservacoes(novaObservacao);
        room = roomService.updateRoom(room);
        return ResponseEntity.ok(room);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @Valid @RequestBody Room room) {
        try {
            if (!roomService.existsById(id)) {
                return ResponseEntity.notFound().build();
            }
            room = roomService.findById(id);
            room.setId(id);
            Room updatedStatus = roomService.updateRoom(room);
            return ResponseEntity.ok(updatedStatus);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteReserva(@PathVariable Long id) {

        try {
            if (!roomService.existsById(id)) {
                return ResponseEntity.notFound().build();
            }
            roomService.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erro Interno do Servidor");
        }
    }

}






