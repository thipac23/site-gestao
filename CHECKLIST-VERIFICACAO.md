# ✅ CHECKLIST DE VERIFICAÇÃO — PGO Operacional

**Data:** 2026-04-05
**Status:** Em Andamento
**Deploy:** https://site-gestao-theta.vercel.app

---

## 📊 FASE 1: DEPLOY VERCEL

- [x] **Código enviado ao GitHub**
  - Commit: `feat: implement INSERT forms and role-based access control`
  - Commit: `docs: add RLS setup instructions and SQL policies`

- [x] **Vercel Deploy Iniciado**
  - URL: https://site-gestao-theta.vercel.app
  - Status: ✅ Build bem-sucedido
  - Site: ✅ Acessível (login page carregando)

- [x] **Build Next.js Validado**
  - ✅ npm run build — OK (sem erros)
  - ✅ TypeScript — OK (todas as páginas compiladas)
  - ✅ Imagens e assets — OK

---

## 🔐 FASE 2: ROW-LEVEL SECURITY (RLS)

### Arquivo RLS Criado ✅
- [x] `supabase/rls-policies.sql` — Pronto
- [x] `docs/SETUP-RLS.md` — Documentação completa

### ⏳ PRÓXIMO: Executar RLS no Supabase

**Instruções:**
1. Vá para: https://app.supabase.com → seu projeto
2. SQL Editor → Cole `supabase/rls-policies.sql`
3. Clique: **Run**
4. Resultado esperado: ✅ Success (sem erros)

**O que RLS vai fazer:**
- Bloquear Financeiro pra quem não é Admin/Financeiro
- Bloquear Usuários pra quem não é Admin
- Bloquear inserts não autorizados no banco
- Proteger contra hacks no frontend

---

## 🧪 FASE 3: TESTES DE PERMISSÕES (após RLS)

### Frontend — Botões Desabilitados
- [ ] Testar: Lider — botão "Nova OS" desabilitado + 🔒 Lock
- [ ] Testar: Supervisor — todos os botões de INSERT desabilitados
- [ ] Testar: Cliente (Ternium) — não vê Financeiro nem Usuários
- [ ] Testar: Admin — todos os botões habilitados

### Backend — RLS Bloqueia (após RLS ativado)
- [ ] Testar: Planejamento tentando inserir em Financeiro → ❌ ERROR
- [ ] Testar: Lider tentando inserir Programação → ❌ ERROR
- [ ] Testar: Supervisor tentando inserir qualquer coisa → ❌ ERROR
- [ ] Testar: Admin inserindo em qualquer tabela → ✅ OK

### Dados Sensíveis
- [ ] Testar: Ternium tentando ler financeiro_registros → ❌ Sem resultados
- [ ] Testar: Lider tentando ler usuarios → ❌ Sem resultados
- [ ] Testar: Admin lendo usuarios → ✅ Lista completa

---

## 📝 FASE 4: TESTES DE FORMULÁRIOS

### Programação
- [ ] Testar: Form carrega corretamente
- [ ] Testar: Validação (campos obrigatórios)
- [ ] Testar: Insert bem-sucedido
- [ ] Testar: Dados aparecem na tabela

### Registro de Atividade
- [ ] Testar: Form carrega
- [ ] Testar: Validação (percentual 0-100)
- [ ] Testar: Insert bem-sucedido

### Presença
- [ ] Testar: Form carrega
- [ ] Testar: Hora automática (HH:MM)
- [ ] Testar: Insert bem-sucedido

### Hora Extra
- [ ] Testar: Form carrega
- [ ] Testar: Cálculo de horas (hora_fim - hora_inicio)
- [ ] Testar: Insert bem-sucedido

### Logística
- [ ] Testar: Form carrega
- [ ] Testar: Validação (quantidade > 0)
- [ ] Testar: Insert bem-sucedido

### Financeiro
- [ ] Testar: Apenas Admin + Financeiro conseguem acessar
- [ ] Testar: Valor apurado NÃO é inserido manualmente
- [ ] Testar: Insert bem-sucedido

### Usuários
- [ ] Testar: Apenas Admin vê a lista
- [ ] Testar: Apenas Admin consegue criar
- [ ] Testar: Form carrega
- [ ] Testar: Insert bem-sucedido

---

## 🔄 FASE 5: MULTI-USER SIMULTÂNEO

- [ ] Testar: 2+ usuários logados ao mesmo tempo
- [ ] Testar: Um registra Programação enquanto outro vê em tempo real
- [ ] Testar: Inserção simultânea de dados na mesma tabela
- [ ] Validar: Dados não ficam duplicados ou corrompidos

---

## 📊 FASE 6: MÉTRICAS E CÁLCULOS

- [ ] Testar: Inserir Programação → verifica se reflete em Métricas
- [ ] Testar: Inserir Registro de Atividade → totalizações corretas
- [ ] Testar: Hora Extra → cálculo de HH:MM
- [ ] Testar: Financeiro → valor_apurado calculado corretamente
- [ ] Validar: Métricas NÃO podem ser inseridas/editadas manualmente

---

## 🎯 FASE 7: VALIDAÇÃO FINAL

- [ ] Site carrega sem erros (console do navegador limpo)
- [ ] Login funciona para todos os perfis
- [ ] Navegação entre páginas funciona
- [ ] Sem infinite loops ou travamentos
- [ ] Performance OK (< 3s load time)
- [ ] Dark mode funciona
- [ ] Responsivo (mobile, tablet, desktop)

---

## 📋 RESUMO POR PERFIL

### ✅ Admin (ID=1)
- [x] Deploy OK
- [ ] Frontend: todos botões habilitados
- [ ] Backend: insere em qualquer tabela
- [ ] Pode gerenciar usuários
- [ ] Vê dados financeiros

### ⏳ Planejamento (ID=2)
- [x] Deploy OK
- [ ] Frontend: botões de Programação/Atividade/Presença/HE/Logística habilitados
- [ ] Frontend: botão Financeiro desabilitado
- [ ] Backend: insere em 5 tabelas
- [ ] Não acessa Usuários

### ⏳ Supervisor (ID=3)
- [x] Deploy OK
- [ ] Frontend: todos botões de INSERT desabilitados (🔒)
- [ ] Backend: não consegue inserir nada
- [ ] Apenas leitura (READ-ONLY)

### ⏳ Lider (ID=4)
- [x] Deploy OK
- [ ] Frontend: botões Programação desabilitado
- [ ] Frontend: botões Atividade + Hora Extra habilitados
- [ ] Backend: insere apenas em 2 tabelas
- [ ] Sem acesso a Financeiro

### ⏳ Cliente/Ternium (ID=5)
- [x] Deploy OK
- [ ] Frontend: todos botões INSERT desabilitados
- [ ] Backend: READ-ONLY
- [ ] Não vê Financeiro
- [ ] Não vê Usuários

### ⏳ Financeiro (ID=6)
- [x] Deploy OK
- [ ] Frontend: botão Financeiro habilitado
- [ ] Frontend: outros botões desabilitados
- [ ] Backend: insere apenas em Financeiro
- [ ] Não vê Usuários

### ⏳ Consulta (ID=7)
- [x] Deploy OK
- [ ] Frontend: todos botões desabilitados (🔒)
- [ ] Backend: READ-ONLY
- [ ] Sem acesso a Financeiro

---

## 🔧 TROUBLESHOOTING

Se algo não funcionar:

### "Botão está habilitado mas não deveria"
- Verificar se `useUserPermissions()` está importado
- Verificar se `canCreate` está declarado corretamente
- Limpar cache do navegador (Ctrl+Shift+Delete)

### "RLS bloqueou corretamente mas usuário não entende"
- Mostrar mensagem amigável na UI
- Adicionar tooltip explicando acesso restrito
- Verificar documentação: `docs/SETUP-RLS.md`

### "Vercel deployment falhou"
- Verificar GitHub Actions
- Ver logs no dashboard Vercel
- Verificar se build local passa: `npm run build`

---

## 📞 CONTATOS

- **GitHub:** https://github.com/thipac23/site-gestao
- **Vercel:** https://vercel.com/dashboard
- **Supabase:** https://app.supabase.com
- **Site Produção:** https://site-gestao-theta.vercel.app

---

## 🎯 META FINAL

✅ = Tudo funcionando
⏳ = Aguardando teste
❌ = Falhou (marcar para fix)

**Target:** Todos os checkboxes ✅
**Roadblock atual:** RLS precisa ser executado no Supabase

**Próximo passo:**
1. Executar RLS SQL no Supabase ← **VOCÊ PRECISA FAZER ISSO**
2. Após RLS ativar: testar permissões
3. Após permissões OK: marcar como "Pronto pra Produção"
