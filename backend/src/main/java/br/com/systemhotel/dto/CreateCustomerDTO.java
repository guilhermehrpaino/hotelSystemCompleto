package br.com.systemhotel.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

import java.time.LocalDateTime;

public record CreateCustomerDTO(

        @NotBlank(message = "Nome é obrigatório")
        @Pattern(regexp = "[A-Za-zÀ-ÿ ]+")
        String nome,

        @Email(message = "Email é obrigatório")
        String email,

        @NotBlank(message = "CPF é obrigatório")
        @Pattern(regexp = "\\d{11}", message = "O CPF deve conter no mínimo 11 dígitos")
        String cpf,


        String telefone,
        Integer idade,
        String endereco,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
){}
