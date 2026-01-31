package br.com.systemhotel.controller;


import br.com.systemhotel.dto.CreateEmployeeDTO;
import br.com.systemhotel.dto.EmployeeResponseDTO;
import br.com.systemhotel.entity.Employee;
import br.com.systemhotel.service.EmployeeService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/funcionarios")
public class AdminEmployeeController {

    private final EmployeeService employeeService;

    @Autowired
    public AdminEmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    @PostMapping
    public EmployeeResponseDTO create (@Valid @RequestBody CreateEmployeeDTO dto) {
        return employeeService.createEmployee(dto);
    }

    @GetMapping
    public List<Employee> listAllEmployees() {
        return employeeService.findAll();
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateEmployee(@PathVariable Long id, @Valid @RequestBody Employee employee) {

        try {
            if (!employeeService.existsById(id)) {
                return ResponseEntity.notFound().build();
            }
            employee.setId(id);
            Employee updatedEmployee = employeeService.updateEmployee(employee);
            return ResponseEntity.ok(updatedEmployee);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/cargo/{cargo}")
    public ResponseEntity<List<Employee>> listEmployeeByRole(@PathVariable String cargo) {
        return employeeService.findByCargo(cargo);
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteReserva(@PathVariable Long id) {

        try {
            if (!employeeService.existsById(id)) {
                return ResponseEntity.notFound().build();
            }
            employeeService.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erro Interno do Servidor");
        }
    }


}
