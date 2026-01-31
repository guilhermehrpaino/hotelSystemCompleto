package br.com.systemhotel.entity;


import br.com.systemhotel.dto.CreatePagamentoDTO;
import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "pagamentos")
public class Pagamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Long clienteId;
    @Column(nullable = false)
    private String metodo;
    @Column(nullable = true)
    private String observacoes;
    @Column(nullable = false)
    private String status;
    @Column(nullable = false)
    private String tipo;
    @Column(nullable = false)
    private BigDecimal valor;

    @Column(name = "data_pagamento")
    @CreatedDate
    private LocalDate dataPagamento;

    @Column(name = "created_at")
    @CreatedDate
    private LocalDateTime createdAt;


    public Pagamento(CreatePagamentoDTO dados) {
        this.id = dados.id();
        this.clienteId = dados.clienteId();
        this.metodo = dados.metodo();
        this.observacoes = dados.observacoes();
        this.status = dados.status();
        this.tipo = dados.tipo();
        this.valor = dados.valor();
        this.dataPagamento = dados.dataPagamento();
        this.createdAt = dados.createdAt();
    }

    public Pagamento() {}


    public LocalDate getDataPagamento() {
        return dataPagamento;
    }

    public void setDataPagamento(LocalDate dataPagamento) {
        this.dataPagamento = dataPagamento;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getClienteId() {
        return clienteId;
    }

    public void setClienteId(Long clienteId) {
        this.clienteId = clienteId;
    }

    public String getMetodo() {
        return metodo;
    }

    public void setMetodo(String metodo) {
        this.metodo = metodo;
    }

    public String getObservacoes() {
        return observacoes;
    }

    public void setObservacoes(String observacoes) {
        this.observacoes = observacoes;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public BigDecimal getValor() {
        return valor;
    }

    public void setValor(BigDecimal valor) {
        this.valor = valor;
    }
}
