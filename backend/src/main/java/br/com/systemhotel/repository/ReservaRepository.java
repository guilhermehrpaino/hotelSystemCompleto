package br.com.systemhotel.repository;

import br.com.systemhotel.entity.Reserva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;

public interface ReservaRepository extends JpaRepository<Reserva, Long> {

    @Query("SELECT COUNT(r) > 0 FROM Reserva r WHERE r.quartoId = :quartoId AND :checkIn < r.checkOut AND :checkOut > r.checkIn")
    boolean existsReserva(Long quartoId, LocalDate checkIn, LocalDate checkOut);

    boolean existsByClienteId(Long clienteId);

    @Query("""
    SELECT r FROM Reserva r
    WHERE r.quartoId = :quartoId
    AND :hoje BETWEEN r.checkIn AND r.checkOut
    AND r.status = 'RESERVADA'
    """)
    List<Reserva> buscarReservaAtivaHoje(Long quartoId, LocalDate hoje, String status);


    List<Reserva> findByClienteId(Long clienteID);

    Reserva findByQuartoId(Long id);
}
