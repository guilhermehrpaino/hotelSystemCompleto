package br.com.systemhotel.controller;


import br.com.systemhotel.dto.CreatePagamentoDTO;
import br.com.systemhotel.dto.PagamentoResponseDTO;
import br.com.systemhotel.entity.Pagamento;
import br.com.systemhotel.service.PagamentoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pagamentos")
public class UserPagamentoController {

    private final PagamentoService pagamentoService;

    @Autowired
    public UserPagamentoController(PagamentoService pagamentoService) {
        this.pagamentoService = pagamentoService;
    }


    @PostMapping
    public PagamentoResponseDTO createPagamento(@Valid @RequestBody CreatePagamentoDTO create) {
        return pagamentoService.createPagamento(create);
    }

    @GetMapping
    public List<Pagamento> findAllPagamentos() {
        return pagamentoService.findAll();
    }
}
