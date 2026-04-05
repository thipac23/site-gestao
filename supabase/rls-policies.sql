-- ============================================================
-- ROW-LEVEL SECURITY (RLS) POLICIES — PGO Operacional
-- ============================================================
-- IMPORTANTE: Execute no Supabase SQL Editor
-- Isso garante que usuários NÃO autorizados não conseguem inserir/editar dados
-- mesmo que hackeem o frontend ou usem SQL direto
-- ============================================================

-- 1. ENABLE RLS ON ALL TABLES
-- ============================================================
ALTER TABLE programacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE registros_atividade ENABLE ROW LEVEL SECURITY;
ALTER TABLE presenca_diaria ENABLE ROW LEVEL SECURITY;
ALTER TABLE registros_hora_extra ENABLE ROW LEVEL SECURITY;
ALTER TABLE solicitacoes_materiais ENABLE ROW LEVEL SECURITY;
ALTER TABLE financeiro_registros ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE metricas_diaria ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- HELPER FUNCTION: Get current user's profile
-- ============================================================
CREATE OR REPLACE FUNCTION get_user_profile_id()
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT perfil_id
    FROM usuarios
    WHERE email = auth.jwt() ->> 'email'
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql;


-- ============================================================
-- HELPER FUNCTION: Check if user has permission
-- ============================================================
CREATE OR REPLACE FUNCTION has_permission(required_profile_id INTEGER[])
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (get_user_profile_id() = ANY(required_profile_id));
END;
$$ LANGUAGE plpgsql;


-- ============================================================
-- PROGRAMAÇÃO — Apenas Planejamento (ID=2) pode inserir
-- ============================================================
-- Planejamento = ID 2, Admin = ID 1
CREATE POLICY programacao_read_all ON programacao
  FOR SELECT TO authenticated
  USING (true);  -- Todos vêem

CREATE POLICY programacao_create_planejamento ON programacao
  FOR INSERT TO authenticated
  WITH CHECK (
    get_user_profile_id() IN (1, 2)  -- Admin ou Planejamento
  );

CREATE POLICY programacao_update_planejamento ON programacao
  FOR UPDATE TO authenticated
  USING (get_user_profile_id() IN (1, 2))
  WITH CHECK (get_user_profile_id() IN (1, 2));


-- ============================================================
-- REGISTRO DE ATIVIDADE — Planejamento + Lider (ID=2,4)
-- ============================================================
-- Lider = ID 4
CREATE POLICY atividade_read_all ON registros_atividade
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY atividade_create_planejamento_lider ON registros_atividade
  FOR INSERT TO authenticated
  WITH CHECK (
    get_user_profile_id() IN (1, 2, 4)  -- Admin, Planejamento, Lider
  );

CREATE POLICY atividade_update_planejamento_lider ON registros_atividade
  FOR UPDATE TO authenticated
  USING (get_user_profile_id() IN (1, 2, 4))
  WITH CHECK (get_user_profile_id() IN (1, 2, 4));


-- ============================================================
-- PRESENÇA — Apenas Planejamento (ID=2) pode inserir
-- ============================================================
CREATE POLICY presenca_read_all ON presenca_diaria
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY presenca_create_planejamento ON presenca_diaria
  FOR INSERT TO authenticated
  WITH CHECK (
    get_user_profile_id() IN (1, 2)  -- Admin ou Planejamento
  );

CREATE POLICY presenca_update_planejamento ON presenca_diaria
  FOR UPDATE TO authenticated
  USING (get_user_profile_id() IN (1, 2))
  WITH CHECK (get_user_profile_id() IN (1, 2));


-- ============================================================
-- HORA EXTRA — Planejamento + Lider (ID=2,4)
-- ============================================================
CREATE POLICY hora_extra_read_all ON registros_hora_extra
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY hora_extra_create_planejamento_lider ON registros_hora_extra
  FOR INSERT TO authenticated
  WITH CHECK (
    get_user_profile_id() IN (1, 2, 4)
  );

CREATE POLICY hora_extra_update_planejamento_lider ON registros_hora_extra
  FOR UPDATE TO authenticated
  USING (get_user_profile_id() IN (1, 2, 4))
  WITH CHECK (get_user_profile_id() IN (1, 2, 4));


-- ============================================================
-- LOGÍSTICA — Apenas Planejamento (ID=2)
-- ============================================================
CREATE POLICY logistica_read_all ON solicitacoes_materiais
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY logistica_create_planejamento ON solicitacoes_materiais
  FOR INSERT TO authenticated
  WITH CHECK (
    get_user_profile_id() IN (1, 2)
  );

CREATE POLICY logistica_update_planejamento ON solicitacoes_materiais
  FOR UPDATE TO authenticated
  USING (get_user_profile_id() IN (1, 2))
  WITH CHECK (get_user_profile_id() IN (1, 2));


-- ============================================================
-- FINANCEIRO — Apenas Admin (ID=1) + Financeiro (ID=6)
-- ============================================================
-- Financeiro = ID 6 — outros NÃO VEEM
CREATE POLICY financeiro_read_authorized ON financeiro_registros
  FOR SELECT TO authenticated
  USING (
    get_user_profile_id() IN (1, 6)  -- Admin ou Financeiro
  );

CREATE POLICY financeiro_create_authorized ON financeiro_registros
  FOR INSERT TO authenticated
  WITH CHECK (
    get_user_profile_id() IN (1, 6)
  );

CREATE POLICY financeiro_update_authorized ON financeiro_registros
  FOR UPDATE TO authenticated
  USING (get_user_profile_id() IN (1, 6))
  WITH CHECK (get_user_profile_id() IN (1, 6));


-- ============================================================
-- USUÁRIOS — Apenas Admin (ID=1)
-- ============================================================
CREATE POLICY usuarios_read_admin ON usuarios
  FOR SELECT TO authenticated
  USING (
    get_user_profile_id() = 1  -- Apenas Admin vê lista completa
  );

CREATE POLICY usuarios_create_admin ON usuarios
  FOR INSERT TO authenticated
  WITH CHECK (
    get_user_profile_id() = 1
  );

CREATE POLICY usuarios_update_admin ON usuarios
  FOR UPDATE TO authenticated
  USING (get_user_profile_id() = 1)
  WITH CHECK (get_user_profile_id() = 1);


-- ============================================================
-- MÉTRICAS — Todos leem (exceto Cliente)
-- ============================================================
-- Cliente = ID 5 — vê métricas
-- Consulta = ID 7 — vê métricas
CREATE POLICY metricas_read_all ON metricas_diaria
  FOR SELECT TO authenticated
  USING (true);

-- NUNCA deletar ou editar métricas (são calculadas)
CREATE POLICY metricas_no_write ON metricas_diaria
  FOR INSERT TO authenticated
  WITH CHECK (false);

CREATE POLICY metricas_no_update ON metricas_diaria
  FOR UPDATE TO authenticated
  WITH CHECK (false);


-- ============================================================
-- GRANT PERMISSIONS (Necessário para RLS funcionar)
-- ============================================================
GRANT SELECT, INSERT, UPDATE ON programacao TO authenticated;
GRANT SELECT, INSERT, UPDATE ON registros_atividade TO authenticated;
GRANT SELECT, INSERT, UPDATE ON presenca_diaria TO authenticated;
GRANT SELECT, INSERT, UPDATE ON registros_hora_extra TO authenticated;
GRANT SELECT, INSERT, UPDATE ON solicitacoes_materiais TO authenticated;
GRANT SELECT, INSERT, UPDATE ON financeiro_registros TO authenticated;
GRANT SELECT, INSERT, UPDATE ON usuarios TO authenticated;
GRANT SELECT ON metricas_diaria TO authenticated;
