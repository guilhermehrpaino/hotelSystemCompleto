package br.com.systemhotel.entity;

import br.com.systemhotel.dto.CreateRoomDTO;
import jakarta.persistence.*;

import java.time.LocalDateTime;


@Entity
@Table (name = "rooms")
public class Room {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private Integer numero;

    @Column(nullable = false)
    private Integer diaria;


    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusQuarto status;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(nullable = true)
    private String observacoes;


    public Room(CreateRoomDTO dados) {
        this.numero = dados.numero();
        this.diaria = dados.diaria();
        this.status = StatusQuarto.DISPONIVEL;
    }


    public Room() {}


    public String getObservacoes() {
        return observacoes;
    }

    public void setObservacoes(String observacoes) {
        this.observacoes = observacoes;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getNumero() {
        return numero;
    }

    public void setNumero(Integer numero) {
        this.numero = numero;
    }

    public Integer getDiaria() {
        return diaria;
    }

    public void setDiaria(Integer diaria) {
        this.diaria = diaria;
    }

    public StatusQuarto getStatus() {
        return status;
    }

    public void setStatus(StatusQuarto status) {
        this.status = status;
    }

    public enum StatusQuarto {
        DISPONIVEL,
        OCUPADO,
        SUJO,
        RESERVADO,
        MANUTENCAO
    }
}
