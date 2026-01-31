package br.com.systemhotel.repository;

import br.com.systemhotel.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);

    Optional<User> findByUsernameAndPassword(String username, String password);

    Optional<User> findByEmail(String email);

    List<User> findByUsernameAndRole(String username, User.RoleUsuario role);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

}
