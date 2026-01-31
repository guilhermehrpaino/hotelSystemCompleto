package br.com.systemhotel.repository;

import br.com.systemhotel.entity.Pagamento;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PagamentoRepository extends JpaRepository<Pagamento, Long> {


    boolean findByStatus(String status);
}
