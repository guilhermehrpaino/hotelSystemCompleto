package br.com.systemhotel.dto;

import br.com.systemhotel.entity.User;

public record UserDTO(Long id, String username, String password, String email, User.RoleUsuario roleUsuario) {

    public UserDTO(User user) {
        this(user.getId(), user.getUsername(), user.getPassword(), user.getEmail(), user.getRole());
    }
}
