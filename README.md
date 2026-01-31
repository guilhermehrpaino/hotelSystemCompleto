# Hotel Management API REST

**Hotel Management API REST** é uma API completa desenvolvida em **Java com Spring Boot** para gerenciar as funcionalidades principais de um hotel: cadastro de clientes, quartos, reservas, check-in/check-out, pagamentos e mais.
Esse projeto voltado para portfólio pessoal, praticar boas práticas, estudar Java e suas tecnologias e demonstração de arquitetura real de backend RESTful.

🔗 Repositório: [https://github.com/guilhermehrpaino/hotelSystemCompleto](https://github.com/guilhermehrpaino/hotelSystemCompleto) ([GitHub][1])

---

## ✍ Tecnologias Utilizadas

| Camada             | Tecnologia                       |
| ------------------ | -------------------------------- |
| Backend            | Java 17+                         |
| Framework          | Spring Boot                      |
| Persistência       | Spring Data JPA                  |
| Banco de Dados     | PostgreSQL (configurável)        |
| Validação          | Jakarta Bean Validation          |
| Frontend           | (separado — projeto React/JS/TS) |
| Controle de Versão | Git & GitHub                     |

---

##  Visão Geral

Este projeto é uma API REST para gerenciar os principais recursos de um sistema hoteleiro, como:

* Cadastro e consulta de clientes
* Gerenciamento de quartos (status, reservas, manutenção)
* Criação e validação de reservas
* Fluxo de check-in e check-out
* Pagamentos e valores totais
* Regras de negócio estruturadas (Service layer)

A arquitetura segue os padrões mais usados no mercado:
**Controller → Service → Repository → Database**.

---

## 📂 Estrutura do Projeto

```
hotelSystemCompleto/
├── backend/                  # Backend em Spring Boot
│   ├── src/main/java/...
│   ├── Controller
│   ├── Service
│   ├── Repository
│   ├── DTO
│   ├── Entity
│   └── application.properties
├── frontend/                 # Frontend (separado, em React/Vue/TS)
├── MANUAL_USUARIO.md         # Instruções de uso manual
├── README.md                 # Este arquivo
└── .gitignore
```

---

## 🧠 Endpoints Principais

### 🙎‍♂️ Clientes

```
POST /api/clientes
GET /api/clientes
GET /api/clientes/{id}
PUT /api/clientes/{id}
DELETE /api/clientes/{id}
```

### 🛏 Quartos

```
POST /api/quartos
GET /api/quartos
GET /api/quartos/{id}
PUT /api/quartos/{id}
PUT /api/quartos/{id}/checkin
PUT /api/quartos/{id}/checkout
PUT /api/quartos/{id}/observacao
PUT /api/quartos/{id}/status
DELETE /api/quartos/{id}
```

### 🎫 Reservas

```
POST /api/reservas/processar-status-quartos
POST /api/reservas
GET /api/reservas
GET /api/reservas/{id}
GET /api/reservas/cliente/verificar
GET /api/reservas/disponibilidade
PUT /api/reservas/{id}
DELETE /api/reservas/{id}
```

## Exemplo de Requisição (cURL)

```bash
curl -X POST http://localhost:8080/api/customers \
  -H "Content-Type: application/json" \
  -d '{"nome":"João Silva","idade":30,"cpf":"12345678910","telefone":"11999998888","email":"joao@email.com","endereco":"Rua A"}'
```

---

## Validações Implementadas

* Campos obrigatórios com Bean Validation
* Validação de formato de email
* Proteção contra CPF duplicado no banco
* Respostas de erro via `ConflictException` e `NotFoundException`

---

## Como Rodar

### Pré-requisitos

* JDK 17+
* Maven
* PostgreSQL 

### Passos

1. Clone o repositório:

   ```bash
   git clone https://github.com/guilhermehrpaino/hotelSystemCompleto.git
   ```
2. Vá até o backend:

   ```bash
   cd hotelSystemCompleto/backend
   ```
3. Ajuste o `application.properties` com as suas variaveis de ambiente, ou mude {DB_User}, {DB_Password}, {DB_Server}, {DB_Database} para suas informações de conexão com o Banco de Dados.  
4. Rode a aplicação (Via IntelliJ, ou da forma que preferir):

   ```bash
   mvn spring-boot:run
   ```

Sua API estará disponível em:

```
http://localhost:8080
```

---

## 📚 Melhorias que pretendo fazer no Futuro

- Autenticação com JWT e roles (ADMIN / RECEPÇÃO)
- Testes unitários e de integração (JUnit, Mockito)
- Deploy da API em nuvem (Heroku, AWS, Railway)

---

## 😁 Boas práticas que busquei utilizar: 

✔ Arquitetura em camadas (Controller/Service/Repository)
✔ API RESTful padrão mercado
✔ Tratamento global de erros
✔ Design DTO para cada caso de uso
✔ Pronto para evoluir para produção

---


[1]: https://github.com/guilhermehrpaino/hotelSystemCompleto "GitHub - guilhermehrpaino/hotelSystemCompleto: Hotel Management API REST - API for managing hotel customers, rooms, reservations and staff."
