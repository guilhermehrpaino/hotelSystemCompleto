# 🏨 Sistema de Gestão de Clientes

## 📋 **Visão Geral**

Sistema completo para gestão de clientes do hotel com funcionalidades de cadastro, listagem, visualização e atualização.

## 🎯 **Funcionalidades**

### **1. 📋 Lista de Clientes**
- **Cards visuais** com foto, nome, email e telefone
- **Seleção interativa** por clique nos cards
- **Contador dinâmico** de clientes cadastrados
- **Fotos geradas automaticamente** com iniciais do nome

### **2. ➕ Cadastro de Clientes**
- **Formulário completo** com validações
- **Máscaras automáticas** (CPF, Telefone, CEP)
- **Validações em tempo real**
- **Modal de sucesso** personalizado

### **3. ✏️ Atualização de Clientes**
- **Carregamento automático** dos dados existentes
- **Formulário pré-preenchido** para edição
- **Endpoint PUT** para atualização no backend
- **Feedback visual** de sucesso

## 🛠️ **Como Funciona**

### **Fluxo Principal:**
```
1. Acessa "Gestão de Clientes"
2. Visualiza lista de clientes cadastrados
3. Clica em "Novo Cliente" para cadastrar
   OU
4. Seleciona um cliente + "Atualizar Cliente"
5. Preenche/Edita os dados
6. Salva as alterações
```

### **Endpoints da API:**

#### **✅ Listar Clientes**
```javascript
GET /api/clientes
Response: ClienteResponse[]
```

#### **✅ Cadastrar Cliente**
```javascript
POST /api/clientes
Body: ClienteRequest
Response: ClienteResponse
```

#### **✅ Buscar Cliente por ID**
```javascript
GET /api/clientes/{id}
Response: ClienteResponse
```

#### **✅ Atualizar Cliente**
```javascript
PUT /api/clientes/{id}
Body: Partial<ClienteRequest>
Response: ClienteResponse
```

## 🏗️ **Estrutura dos Componentes**

### **1. ListaClientes.tsx**
- **Principal:** Gerencia estado e navegação
- **Responsabilidades:**
  - Listar clientes
  - Gerenciar seleção
  - Navegar entre modos
  - Exibir cards visuais

### **2. CadastrarCliente.tsx**
- **Reutilizável:** Funciona em ambos modos
- **Props:**
  - `modo?: 'cadastro' | 'atualizacao'`
  - `onSuccess?: () => void`
  - `clienteParaAtualizar?: ClienteResponse`
- **Responsabilidades:**
  - Formulário com validações
  - Máscaras e formatação
  - Envio para API
  - Feedback ao usuário

## 🎨 **Interface do Usuário**

### **Cards de Clientes:**
- **Foto automática** com iniciais
- **Dados essenciais:** nome, email, telefone
- **Indicador visual** de seleção
- **Hover effects** e transições suaves

### **Formulário:**
- **Layout responsivo** em grid
- **Validações em tempo real**
- **Máscaras automáticas:**
  - CPF: `000.000.000-00`
  - Telefone: `(00) 00000-0000`
  - CEP: `00000-000`
- **Feedback claro** de erros e sucesso

### **Navegação:**
- **Botão "Voltar"** em modo cadastro/atualização
- **Indicador visual** de cliente selecionado
- **Estatísticas** em tempo real

## 📱 **Experiência do Usuário**

### **Cadastro:**
1. **Clica em "Novo Cliente"**
2. **Preenche formulário** com validações
3. **Recebe feedback** imediato
4. **Sucesso** → volta para lista automaticamente

### **Atualização:**
1. **Seleciona cliente** (clica no card)
2. **Clica em "Atualizar Cliente"**
3. **Formulário pré-preenchido** com dados existentes
4. **Edita campos** necessários
5. **Salva alterações**
6. **Sucesso** → volta para lista com dados atualizados

## 🔧 **Validações Implementadas**

### **Frontend:**
- **Nome:** Mínimo 3 caracteres, apenas letras
- **Idade:** 18-100 anos
- **CPF:** 11 dígitos válidos
- **Telefone:** 11 dígitos com DDD
- **Email:** Formato válido
- **Endereço:** Todos os campos obrigatórios
- **CEP:** Formato `00000-000`

### **Backend (esperado):**
- **Validação de duplicidade** (CPF, email)
- **Verificação de integridade** dos dados
- **Tratamento de erros** adequado

## 🌟 **Recursos Especiais**

### **Fotos Automáticas:**
```javascript
// Gera URL com iniciais do cliente
const getFotoUrl = (nome: string) => {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(nome)}&background=4f46e5&color=fff&size=128&bold=true`;
};
```

### **Estatísticas em Tempo Real:**
- **Total de clientes**
- **Clientes selecionados**
- **Clientes disponíveis**

### **Modo Responsivo:**
- **Desktop:** 3 colunas de cards
- **Tablet:** 2 colunas de cards
- **Mobile:** 1 coluna de cards

## 🚀 **Como Usar**

### **1. Importar Componentes:**
```tsx
import ListaClientes from './components/admin/ListaClientes';
import CadastrarCliente from './components/admin/CadastrarCliente';
```

### **2. Adicionar Rotas:**
```tsx
<Route path="/admin/clientes" element={<ListaClientes />} />
<Route path="/admin/clientes/cadastrar" element={<CadastrarCliente modo="cadastro" />} />
<Route path="/admin/clientes/atualizar/:id" element={<CadastrarCliente modo="atualizacao" />} />
```

### **3. Adicionar ao Menu:**
```tsx
<Link to="/admin/clientes">Gestão de Clientes</Link>
```

## 📊 **Estrutura de Dados**

### **ClienteRequest:**
```typescript
interface ClienteRequest {
  nome: string;
  idade: number;
  cpf: string;
  telefone: string;
  email: string;
  endereco: string;
}
```

### **ClienteResponse:**
```typescript
interface ClienteResponse {
  id: number;
  nome: string;
  idade: number;
  cpf: string;
  telefone: string;
  email: string;
  endereco: string;
  createdAt: string;
  updatedAt: string;
}
```

## 🎯 **Próximos Passos**

1. **Implementar backend** com todos os endpoints
2. **Adicionar busca** e filtros na lista
3. **Implementar exclusão** de clientes
4. **Adicionar paginação** para grandes listas
5. **Exportar dados** para CSV/Excel

---

**Sistema completo e pronto para uso!** 🏨
