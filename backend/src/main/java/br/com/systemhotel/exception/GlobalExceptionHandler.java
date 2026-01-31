package br.com.systemhotel.exception;


import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler  {


    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleBadRequest(RuntimeException ex) {
      return ResponseEntity
              .badRequest()
              .body(ex.getMessage());
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<String> handleConflict(RuntimeException ex) {
      return  ResponseEntity
              .status(HttpStatus.CONFLICT)
              .body(ex.getMessage());
    }
}
