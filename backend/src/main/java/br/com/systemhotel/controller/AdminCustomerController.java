package br.com.systemhotel.controller;


import br.com.systemhotel.dto.CreateCustomerDTO;
import br.com.systemhotel.dto.CustomerResponseDTO;
import br.com.systemhotel.entity.Customer;
import br.com.systemhotel.service.CustomerService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.data.repository.query.Param;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/clientes")
public class AdminCustomerController {


    private final CustomerService service;

    @Autowired
    public AdminCustomerController(CustomerService service) {
        this.service = service;
    }

    @PostMapping
    public CustomerResponseDTO create (@Valid @RequestBody CreateCustomerDTO dto) {
        return service.createCustomer(dto);
    }


    @GetMapping
    public List<Customer> showCustomers() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Customer> showCustomerById(@PathVariable Long id) {
        Optional<Customer> customer = service.findById(id);
        return customer
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCustomer(@PathVariable Long id, @Valid @RequestBody Customer customer) {
        try {
            if (!service.existsById(id)) {
                return ResponseEntity.notFound().build();
            }
            customer.setId(id);
            Customer updatedCustomer = service.updateCustomer(customer);
            return ResponseEntity.ok(updatedCustomer);
        } catch (RuntimeException e) {
            throw new RuntimeException(e.getMessage());
        }

    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCliente(@PathVariable Long id) {

        try {
            if (!service.existsById(id)) {
                return ResponseEntity.notFound().build();
            }
            service.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erro Interno do Servidor");
        }
    }


}
