# Configurando Row-Level Security (RLS) no Supabase

## 🔐 Por que RLS?

Sem RLS, qualquer pessoa que:
- Hackeia o frontend
- Acessa o Supabase direto
- Usa ferramentas como Insomnia/Postman

**Consegue inserir dados que não deveria.**

Com RLS, o **banco de dados** bloqueia inserts indevidos automaticamente.

---

## 📋 Checklist Rápido

1. Vá para: https://app.supabase.com
2. Selecione seu projeto (site-gestao)
3. Vá para **SQL Editor**
4. Cole o conteúdo de `supabase/rls-policies.sql`
5. Execute (**Run** ou Ctrl+Enter)
6. Pronto! RLS está ativo

---

## 🔍 Como Funciona

### Estrutura de Permissões:

| Perfil | ID | Programação | Atividades | Presença | Hora Extra | Logística | Financeiro | Usuários |
|--------|----|----|----|----|----|----|----|----|
| Admin | 1 | ✓ INSERT | ✓ INSERT | ✓ INSERT | ✓ INSERT | ✓ INSERT | ✓ INSERT | ✓ INSERT |
| Planejamento | 2 | ✓ INSERT | ✓ INSERT | ✓ INSERT | ✓ INSERT | ✓ INSERT | ✗ | ✗ |
| Supervisor | 3 | ✓ READ | ✓ READ | ✓ READ | ✓ READ | ✓ READ | ✗ | ✗ |
| Lider | 4 | ✗ | ✓ INSERT | ✗ | ✓ INSERT | ✗ | ✗ | ✗ |
| Cliente | 5 | ✓ READ | ✓ READ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Financeiro | 6 | ✓ READ | ✓ READ | ✗ | ✗ | ✗ | ✓ INSERT | ✗ |
| Consulta | 7 | ✓ READ | ✓ READ | ✗ | ✗ | ✗ | ✗ | ✗ |

### RLS Policies Criadas:

1. **Programação**
   - `programacao_read_all`: Todos leem
   - `programacao_create_planejamento`: Apenas Admin (1) + Planejamento (2) inserem

2. **Registros de Atividade**
   - `atividade_read_all`: Todos leem
   - `atividade_create_planejamento_lider`: Admin (1) + Planejamento (2) + Lider (4) inserem

3. **Presença**
   - `presenca_read_all`: Todos leem
   - `presenca_create_planejamento`: Admin (1) + Planejamento (2) inserem

4. **Hora Extra**
   - `hora_extra_read_all`: Todos leem
   - `hora_extra_create_planejamento_lider`: Admin (1) + Planejamento (2) + Lider (4) inserem

5. **Logística**
   - `logistica_read_all`: Todos leem
   - `logistica_create_planejamento`: Admin (1) + Planejamento (2) inserem

6. **Financeiro** ⚠️
   - `financeiro_read_authorized`: APENAS Admin (1) + Financeiro (6) leem
   - `financeiro_create_authorized`: APENAS Admin (1) + Financeiro (6) inserem
   - Outros perfis: **NÃO VEEM dados financeiros**

7. **Usuários** ⚠️
   - `usuarios_read_admin`: APENAS Admin (1) vê a lista
   - `usuarios_create_admin`: APENAS Admin (1) cria usuários

8. **Métricas**
   - `metricas_read_all`: Todos leem
   - `metricas_no_write`: NUNCA podem ser inseridas/editadas (são calculadas)

---

## ✅ Testando RLS

### Teste 1: Usuário Planejamento tentando inserir em Financeiro

```sql
-- Como Planejamento (ID 2), tente inserir em financeiro_registros
-- Resultado: ERROR — RLS Policy bloqueou!
INSERT INTO financeiro_registros (registros_atividade_id, quantidade_apurada, status_financeiro)
VALUES (1, 100, 'pendente');
-- ❌ ERROR: new row violates row-level security policy "financeiro_create_authorized" on table "financeiro_registros"
```

### Teste 2: Admin inserindo em qualquer tabela

```sql
-- Como Admin (ID 1), inserir em qualquer lugar funciona
INSERT INTO financeiro_registros (registros_atividade_id, quantidade_apurada, status_financeiro)
VALUES (1, 100, 'pendente');
-- ✅ OK — Admin tem acesso!
```

### Teste 3: Lider tentando inserir Programação

```sql
-- Como Lider (ID 4), tente inserir em programacao
INSERT INTO programacao (data, os_numero, bateria, bloco, forno, lado, atividade_id, equipe_id, status_programacao)
VALUES ('2026-04-05', 'OS-123', 'B1', 'BL1', 'F1', 'E', 1, 1, 'Programado');
-- ❌ ERROR — RLS Policy bloqueou!
```

---

## 🚨 Importante: Ordem de Execução

1. **Primeiro** execute este script RLS
2. **Depois** faça login com cada tipo de usuário e teste
3. Se algo quebrar, você pode remover RLS com:

```sql
-- ⚠️ CUIDADO: Remove RLS (volta ao anterior)
ALTER TABLE programacao DISABLE ROW LEVEL SECURITY;
ALTER TABLE registros_atividade DISABLE ROW LEVEL SECURITY;
-- ... etc para outras tabelas
```

---

## 📞 Troubleshooting

### "RLS Policy on <table> conflicts with user's role"
- Verifique se o usuário logado tem o `perfil_id` correto na tabela `usuarios`
- Confirme que a função `get_user_profile_id()` consegue encontrar o email do usuário

### "ERROR: permission denied for schema public"
- Pode estar faltando GRANT de permissões
- Re-execute a seção `GRANT PERMISSIONS` do script

### "Alguns usuários não conseguem ler dados"
- Verifique qual perfil eles têm (veja na tabela `usuarios`)
- Confirme se a RLS policy daquela tabela permite READ para esse perfil

---

## 🎯 Próximos Passos

Depois de configurar RLS:
1. ✅ Teste cada tipo de usuário
2. ✅ Confirme que dados financeiros NÃO são vistos por Lider/Planejamento
3. ✅ Confirme que Supervisor não consegue inserir nada
4. ✅ Deploy final na Vercel

---

## 📚 Referência

- [Supabase RLS Docs](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
