package br.com.systemhotel.service;

import br.com.systemhotel.dto.CreatePagamentoDTO;
import br.com.systemhotel.dto.PagamentoResponseDTO;
import br.com.systemhotel.entity.Pagamento;
import br.com.systemhotel.repository.PagamentoRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PagamentoService {

    private final PagamentoRepository pagamentoRepository;

    @Autowired
    public PagamentoService(PagamentoRepository pagamentoRepository) {
        this.pagamentoRepository = pagamentoRepository;
    }

    public PagamentoResponseDTO createPagamento(CreatePagamentoDTO create) {
         Pagamento pagamento = new Pagamento(create);
         pagamentoRepository.save(pagamento);
         return new PagamentoResponseDTO(pagamento);
    }

    public List<Pagamento> findAll() {
        return pagamentoRepository.findAll();
    }
}
