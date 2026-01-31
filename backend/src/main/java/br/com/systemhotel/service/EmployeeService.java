package br.com.systemhotel.service;

import br.com.systemhotel.dto.CreateCustomerDTO;
import br.com.systemhotel.dto.CreateEmployeeDTO;
import br.com.systemhotel.dto.EmployeeResponseDTO;
import br.com.systemhotel.entity.Employee;
import br.com.systemhotel.repository.EmployeeRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class EmployeeService {

    private final EmployeeRepository funcionarioRepository;

    @Autowired
    public EmployeeService(EmployeeRepository funcionarioRepository) {
        this.funcionarioRepository = funcionarioRepository;
    }

    public EmployeeResponseDTO createEmployee (CreateEmployeeDTO dto) {

        if (funcionarioRepository.existsByCpf(dto.cpf())) {
            throw new IllegalStateException("Este CPF já está cadastrado!");
        }
        if (funcionarioRepository.existsByEmail(dto.email())) {
            throw new IllegalStateException("Este email já está cadastrado!");
        }
        Employee employee = new Employee(dto);
        employee.setCreatedAt(LocalDateTime.now());
        funcionarioRepository.save(employee);
        return new EmployeeResponseDTO(employee);


    }

    public List<Employee> findAll() {
        return funcionarioRepository.findAll();
    }

    public boolean existsById(Long id) {
        return funcionarioRepository.existsById(id);
    }

    public Employee updateEmployee(Employee employee) {
        employee.setUpdatedAt(LocalDateTime.now());
        funcionarioRepository.save(employee);
        return new Employee();
    }

    public ResponseEntity<List<Employee>> findByCargo(String cargo) {
        List<Employee> employees = funcionarioRepository.findByCargo(cargo);
        return ResponseEntity.ok(employees);
    }

    public void deleteById(Long id) {
        funcionarioRepository.deleteById(id);
    }
}
