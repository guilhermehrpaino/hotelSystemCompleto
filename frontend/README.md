# Sistema Hoteleiro - Frontend

Frontend em React + TypeScript para o sistema de gerenciamento hoteleiro.

## 🚀 Como executar

1. Instale as dependências:
```bash
npm install
```

2. Inicie o servidor de desenvolvimento:
```bash
npm start
```

3. Abra http://localhost:3000 no seu navegador.

## 📱 Funcionalidades

### 🔐 Login
- **Admin**: `admin` / `admin`
- **User**: `user` / `user`

### 👑 Menu ADMIN
1. Cadastrar cliente
2. Cadastrar quarto
3. Cadastrar funcionário
4. Alterar status do quarto
5. Relatórios

### 🧑‍💼 Menu USER
1. Criar reserva
2. Consultar reservas
3. Cancelar reserva
4. Realizar check-in
5. Realizar check-out
6. Ver status dos quartos
7. Solicitar manutenção
8. Registrar pagamento
9. Consultar cliente

## 🛠️ Tecnologias

- React 18
- TypeScript
- Tailwind CSS
- React Router
- React Hook Form
- Zod (validação)
- Axios (API)

## 📁 Estrutura

```
src/
├── components/     # Componentes React
├── contexts/       # Contextos (autenticação)
├── types/          # Tipos TypeScript
├── App.tsx         # Componente principal
├── index.css       # Estilos globais
└── index.tsx       # Ponto de entrada
```

## 🔧 Configuração

O projeto está configurado para conectar ao backend Spring Boot que roda em `http://localhost:8080`.

## 📝 Notas

- Atualmente o login é simulado (mock)
- A conexão com o backend precisa ser implementada
- Os erros de TypeScript/ESLint são normais até instalar as dependências
