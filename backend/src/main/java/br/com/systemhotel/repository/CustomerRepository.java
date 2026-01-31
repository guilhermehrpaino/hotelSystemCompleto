package br.com.systemhotel.repository;

import br.com.systemhotel.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CustomerRepository extends JpaRepository<Customer, Long>{

    boolean existsByCpf(String cpf);

    boolean existsByEmail(String email);

    boolean existsById(Long id);
}
