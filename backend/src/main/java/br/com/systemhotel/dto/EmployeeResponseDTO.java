package br.com.systemhotel.dto;

import br.com.systemhotel.entity.Employee;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record EmployeeResponseDTO(
        Long id,
        String nome,
        Integer idade,
        String email,
        String endereco,
        String telefone,
        String cpf,
        BigDecimal salario,
        String cargo,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public EmployeeResponseDTO (Employee employee){
      this(
                employee.getId(),
                employee.getNome(),
                employee.getIdade(),
                employee.getEmail(),
                employee.getEndereco(),
                employee.getTelefone(),
                employee.getCpf(),
                employee.getSalario(),
                employee.getCargo(),
                employee.getCreatedAt(),
                employee.getUpdatedAt()
      );
    }
}
