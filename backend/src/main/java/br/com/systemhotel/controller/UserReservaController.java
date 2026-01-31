package br.com.systemhotel.controller;

import br.com.systemhotel.dto.CreateReservaDTO;
import br.com.systemhotel.dto.ReservaResponseDTO;
import br.com.systemhotel.entity.Reserva;
import br.com.systemhotel.entity.Room;
import br.com.systemhotel.service.ReservaService;
import br.com.systemhotel.service.RoomService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/reservas")
public class UserReservaController {

    private final ReservaService reservaService;
    private final RoomService roomService;

    @Autowired
    public UserReservaController(ReservaService reservaService, RoomService roomService) {
        this.reservaService = reservaService;
        this.roomService = roomService;
    }


    @PutMapping("/{id}")
    public ResponseEntity<Reserva> atualizarReserva(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String status = body.get("status");
        Reserva reserva = reservaService.findById(id);
        reserva.setStatus(status);
        reservaService.save(reserva);
        return ResponseEntity.ok(reserva);
    }


    @GetMapping
    public List<Reserva> findAllReservas() {
        return reservaService.findAll();
    }

    @PostMapping("/processar-status-quartos")
    public ResponseEntity<List<Room>> processarStatusQuartos(@RequestBody Map<String, List<Long>> request) {
        List<Long> quartosIds = request.get("quartosIds");
        List<Room> quartosAtualizado = new ArrayList<>();



        for (Long quartoId : quartosIds) {
            Room room = roomService.findById(quartoId);

            List<Reserva> reservaHoje = reservaService.findByQuartoIdAndCheckInAndStatus(quartoId, LocalDate.now(), "RESERVADA");

                if (!reservaHoje.isEmpty()) {
                    if (room.getStatus().equals(Room.StatusQuarto.DISPONIVEL)) {
                        room.setStatus(Room.StatusQuarto.RESERVADO);
                    }
                }

            roomService.updateRoom(room);
            quartosAtualizado.add(room);
        }
        return ResponseEntity.ok(quartosAtualizado);
    }

    @PostMapping
    public ReservaResponseDTO createReserva(@Valid @RequestBody CreateReservaDTO dto) {
        return reservaService.createReserva(dto);
    }

    @GetMapping("/disponibilidade")
    public ResponseEntity<Map<String,Boolean>> checarDisponibilidade(@RequestParam Long quartoId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkIn,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOut) {

        Map<String, Boolean> response = new HashMap<>();

        boolean disponivel = reservaService.quartoDisponivel(quartoId, checkIn, checkOut);
        if (checkOut.isBefore(checkIn)) {
            response.put("disponivel", false);
        } else {
            response.put("disponivel", disponivel);
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/cliente/verificar")
    public ResponseEntity<Map<String,Boolean>> checkReservaAtiva(@RequestParam Long clienteId) {
        Map<String, Boolean> response = new HashMap<>();
        boolean reservaAtiva = reservaService.clienteComReserva(clienteId);
        response.put("temReserva", reservaAtiva);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteReserva(@PathVariable Long id) {

        try {
            if (!reservaService.existsById(id)) {
                return ResponseEntity.notFound().build();
            }
            reservaService.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erro Interno do Servidor");
        }
    }
}
