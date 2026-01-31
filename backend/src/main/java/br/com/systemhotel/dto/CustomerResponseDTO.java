package br.com.systemhotel.dto;

import br.com.systemhotel.entity.Customer;

import java.time.LocalDateTime;

public record CustomerResponseDTO(
        Long id,
        String nome,
        Integer idade,
        String cpf,
        String telefone,
        String email,
        String endereco,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public CustomerResponseDTO (Customer customer){
        this(
                customer.getId(),
                customer.getNome(),
                customer.getIdade(),
                customer.getCpf(),
                customer.getTelefone(),
                customer.getEmail(),
                customer.getEndereco(),
                customer.getCreatedAt(),
                customer.getUpdatedAt()
        );
    }
}
