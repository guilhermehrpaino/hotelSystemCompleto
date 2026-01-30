# Sistema de Gestão Hoteleira - Manual do Usuário

## 📖 Índice

1. [Visão Geral](#visão-geral)
2. [Login e Acesso](#login-e-acesso)
3. [Dashboard Administrativo](#dashboard-administrativo)
4. [Gestão de Reservas](#gestão-de-reservas)
5. [Gestão de Quartos](#gestão-de-quartos)
6. [Gestão de Clientes](#gestão-de-clientes)
7. [Pagamentos](#pagamentos)
8. [Notificações](#notificações)
9. [Dicas e Melhores Práticas](#dicas-e-melhores-práticas)

---

## 🎯 Visão Geral

O Sistema de Gestão Hoteleira é uma plataforma completa para administração de hotéis, oferecendo controle total sobre reservas, quartos, clientes e finanças.

### 🌟 Principais Recursos

- **Gestão Completa de Reservas**: Criação, consulta, cancelamento e check-in/check-out
- **Controle de Quartos**: Status em tempo real, limpeza e manutenção
- **Gestão de Clientes**: Cadastro, consulta e edição de informações
- **Relatórios Financeiros**: Dashboard com métricas e estatísticas
- **Notificações Automáticas**: Alertas e lembretes inteligentes
- **Interface Responsiva**: Acesso em desktop, tablet e mobile

---

## 🔐 Login e Acesso

### Acesso ao Sistema

1. Abra o navegador e acesse a URL do sistema
2. Digite seu **usuário** e **senha**
3. Clique em **"Entrar"**

### Níveis de Acesso

#### 👤 Usuário Comum
- Gestão de reservas
- Consulta de clientes
- Operações de check-in/check-out
- Solicitação de limpeza/manutenção

#### 👨‍💼 Administrador
- Todas as funções do usuário comum
- Gestão de quartos
- Gestão de funcionários
- Relatórios administrativos
- Configurações do sistema

---

## 📊 Dashboard Administrativo

### Visão Geral

O dashboard oferece uma visão completa do desempenho do hotel:

### 📈 Métricas Principais

- **Total Reservas**: Número total de reservas no sistema
- **Taxa Ocupação**: Percentual de quartos ocupados atualmente
- **Receita Total**: Faturamento acumulado
- **Total Clientes**: Número de clientes cadastrados

### 📅 Relatório Mensal

Visualize o desempenho mensal com:
- **Reservas**: Quantidade de reservas por mês
- **Receita**: Faturamento mensal
- **Ocupação Média**: Taxa de ocupação média do mês

### 🔄 Navegação

- Use o seletor de período para filtrar dados (3, 6 ou 12 meses)
- Clique em "Ver todas" para acessar listas completas

---

## 🏨 Gestão de Reservas

### 📝 Criar Reserva

1. Acesse **"Criar Reserva"** no menu lateral
2. **Selecione o Cliente**:
   - Digite o nome ou CPF
   - Se não existir, clique em "Cadastrar Novo Cliente"
3. **Escolha o Quarto**:
   - Verifique disponibilidade nas datas
   - Quartos disponíveis aparecem em verde
4. **Preencha os Dados**:
   - Datas de check-in e check-out
   - Número de hóspedes
   - Observações (opcional)
5. **Confirme** a reserva

### 🔍 Consultar Reservas

1. Acesse **"Consultar Reservas"**
2. **Use os Filtros**:
   - **Busca**: Cliente, quarto ou ID da reserva
   - **Status**: Ativas, Canceladas ou Reservadas
   - **Período**: Intervalo de datas
3. **Ações Disponíveis**:
   - ✅ **Check-in**: Para reservas do dia
   - 🚪 **Check-out**: Para reservas ativas
   - ❌ **Cancelar**: Para reservas ativas/reservadas

### ❌ Cancelar Reserva

1. Na lista de reservas, clique em **"Cancelar"**
2. **Selecione a reserva** desejada
3. **Preencha o motivo** do cancelamento
4. **Confirme** no modal de confirmação

### 🏁 Reservas Finalizadas

1. No card "Finalizadas", clique em **"Ver Reservas Finalizadas"**
2. **Filtre por período** de checkout
3. **Consulte o histórico** completo

---

## 🧹 Gestão de Quartos

### 📊 Ver Status dos Quartos

1. Acesse **"Ver Status Quartos"**
2. **Visualize o status** de todos os quartos:
   - ✅ **Disponível**: Pronto para uso
   - 🏨 **Ocupado**: Com hóspede
   - 📅 **Reservado**: Reservado para futuro
   - 🧹 **Sujo**: Aguardando limpeza
   - 🔧 **Manutenção**: Em manutenção

### 🧹 Solicitar Limpeza

1. Acesse **"Solicitar Limpeza"** no menu
2. **Selecione o quarto** (ou use o pré-selecionado)
3. **Adicione observações** sobre a limpeza necessária
4. **Confirme** a solicitação

### ✅ Confirmar Limpeza

1. Na tela de status, quartos **"Sujo"** mostram **"Confirmar Limpeza"**
2. **Clique no botão** para confirmar
3. **O status** muda automaticamente para "Disponível"

### 🔧 Solicitar Manutenção

1. Acesse **"Solicitar Manutenção"**
2. **Selecione o quarto**
3. **Defina o período** de manutenção
4. **Descreva o problema** nas observações
5. **Confirme** a solicitação

### ✅ Confirmar Manutenção

1. Quartos em **"Manutenção"** mostram **"Confirmar Manutenção"**
2. **Clique para confirmar** quando a manutenção terminar
3. **O status** muda para "Disponível"

---

## 👥 Gestão de Clientes

### ➕ Cadastrar Cliente

1. Acesse **"Consultar Cliente"** → **"Cadastrar Novo Cliente"**
2. **Preencha os dados**:
   - Nome completo
   - Idade
   - CPF
   - Telefone
   - E-mail
   - Endereço
3. **Salve** o cadastro

### 🔍 Consultar Cliente

1. Acesse **"Consultar Cliente"**
2. **Digite o nome ou CPF** para buscar
3. **Visualize os dados** do cliente
4. **Edite informações** se necessário

---

## 💳 Pagamentos

### 📝 Registrar Pagamento

1. Acesse **"Pagamentos"** no menu administrativo
2. **Clique em "Novo Pagamento"**
3. **Preencha os dados**:
   - Cliente
   - Tipo de pagamento
   - Valor
   - Data
   - Método
   - Observações
4. **Confirme** o registro

### 📊 Consultar Pagamentos

1. Na tela de pagamentos, visualize todos os registros
2. **Use os filtros** por período ou cliente
3. **Exporte relatórios** se necessário

---

## 🔔 Notificações

### 📬 Tipos de Notificações

- ℹ️ **Informativas**: Informações gerais
- ✅ **Sucesso**: Ações concluídas
- ⚠️ **Alertas**: Atenção necessária
- ❌ **Erros**: Problemas no sistema

### 🔄 Notificações Automáticas

O sistema monitora automaticamente:

- **Check-ins do dia**: Alerta sobre check-ins pendentes
- **Quartos sujos**: Avisa quando quartos precisam de limpeza
- **Manutenção**: Lembretes de quartos em manutenção

### 📱 Gerenciar Notificações

1. **Clique no ícone de sino** no header
2. **Visualize todas** as notificações
3. **Marque como lida** ou remova
4. **Clique na ação** para ser direcionado à página

---

## 💡 Dicas e Melhores Práticas

### 🏨 Operações Diárias

1. **Verifique check-ins do dia** pela manhã
2. **Monitore status dos quartos** regularmente
3. **Confirme limpezas** assim que terminarem
4. **Atualize manutenções** quando concluídas

### 📊 Gestão Eficiente

1. **Use os filtros** para encontrar informações rapidamente
2. **Mantenha dados atualizados** de clientes
3. **Registre observações** detalhadas
4. **Consulte relatórios** mensalmente

### 🔐 Segurança

1. **Faça logout** ao terminar o expediente
2. **Não compartilhe senhas**
3. **Atualize dados** regularmente
4. **Reporte problemas** imediatamente

### 📱 Atalhos e Navegação

- **Menu lateral**: Acesso rápido a todas as funções
- **Dashboard**: Visão geral do desempenho
- **Botão voltar**: Retorna à página anterior
- **Filtros**: Refine buscas rapidamente

---

## 🆘 Suporte e Ajuda

### 📞 Contato

- **Suporte Técnico**: [email/suporte]
- **Emergências**: [telefone]
- **Horário**: 24/7

### 🐛 Reportar Problemas

1. **Tire print** da tela
2. **Descreva o problema**
3. **Informe o passo a passo**
4. **Envie para o suporte**

### 📚 Recursos Adicionais

- **Tutoriais em vídeo**: [link]
- **FAQ**: [link]
- **Atualizações**: [link]

---

## 🎉 Conclusão

Este sistema foi desenvolvido para simplificar e otimizar a gestão hoteleira. Com prática e uso regular, você se tornará proficiente em todas as funcionalidades.

**Lembre-se**: A chave para uma gestão eficiente é manter os dados sempre atualizados e utilizar as ferramentas de monitoramento disponíveis.

---

*Versão 1.0 | Última atualização: Janeiro 2026*
