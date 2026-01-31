package br.com.systemhotel.service;

import br.com.systemhotel.dto.UserDTO;
import br.com.systemhotel.entity.User;
import br.com.systemhotel.exception.ConflictException;
import br.com.systemhotel.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;



@Service
public class UserService {
    @Autowired
    private final UserRepository userRepository;

    public void register(UserDTO dto) {
        if (userRepository.existsByUsername(dto.username())) {
            throw new ConflictException("Este usuário já existe!");
        }
        if (userRepository.existsByEmail(dto.email())) {
            throw new ConflictException("Este email já está em uso!");
        }
        userRepository.save(new User(dto));
    }

    public boolean auth(String username, String password) {
        return userRepository
                .findByUsernameAndPassword(username, password)
                .isPresent();
    }

    public boolean checkRole(String username, User.RoleUsuario roleUsuario) {
        return userRepository
                .findByUsernameAndRole(username, roleUsuario)
                .contains("ADMIN");
    }

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
}
