package br.com.systemhotel.service;

import br.com.systemhotel.dto.CreateCustomerDTO;
import br.com.systemhotel.dto.CustomerResponseDTO;
import br.com.systemhotel.entity.Customer;
import br.com.systemhotel.repository.CustomerRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;

    @Autowired
    public CustomerService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    public CustomerResponseDTO createCustomer(CreateCustomerDTO dto) {

        if (customerRepository.existsByCpf(dto.cpf())) {
            throw new IllegalStateException("Este CPF já está cadastrado!");
        }
        if (customerRepository.existsByEmail(dto.email())) {
            throw new IllegalStateException("Este email já está cadastrado!");
        }
        Customer customer = new Customer(dto);
        customer.setCreatedAt(LocalDateTime.now());
        customerRepository.save(customer);
        return new CustomerResponseDTO(customer);

    }


    public List<Customer> findAll() {
        return customerRepository.findAll();
    }

    public Optional<Customer> findById(Long id) {
        return customerRepository.findById(id);
    }

    public boolean existsById(Long id) {
        return customerRepository.existsById(id);
    }

    public Customer updateCustomer(Customer customer) {
        customer.setUpdatedAt(LocalDateTime.now());
        customerRepository.save(customer);
        return new Customer();
    }

    public void deleteById(Long id) {
        customerRepository.deleteById(id);
    }
}
