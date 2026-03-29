-- ============================================================
-- REFRAMAX PORTAL - Seed Data
-- ============================================================

-- ============================================================
-- CONTRACTS
-- ============================================================
insert into public.contracts (id, name, client, type, target) values
  ('11111111-1111-1111-1111-111111111111', 'Bateria 3A - Manutenção Refratária', 'Ternium', 'aderencia', 92),
  ('22222222-2222-2222-2222-222222222222', 'Bateria 4B - Disponibilidade Mecânica', 'Ternium', 'disponibilidade', 90),
  ('33333333-3333-3333-3333-333333333333', 'Bateria 5C - Serviços PU', 'Ternium', 'pu', 95)
on conflict do nothing;

-- ============================================================
-- BATTERIES
-- ============================================================
insert into public.batteries (id, name, furnace_count, status) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Bateria 3A', 67, 'operational'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Bateria 4B', 67, 'partial'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Bateria 5C', 67, 'maintenance')
on conflict do nothing;

-- ============================================================
-- TEAMS
-- ============================================================
insert into public.teams (id, name, contract_id, leader_name, member_count) values
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Projeção de Soleira', '11111111-1111-1111-1111-111111111111', 'Carlos Silva', 12),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Quadrante', '11111111-1111-1111-1111-111111111111', 'Roberto Santos', 8),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Reparo de Porta', '11111111-1111-1111-1111-111111111111', 'José Oliveira', 6),
  ('44444444-4444-4444-4444-444444444444', 'Mecânica Industrial', '22222222-2222-2222-2222-222222222222', 'André Costa', 10),
  ('55555555-5555-5555-5555-555555555555', 'Soldagem Especial', '22222222-2222-2222-2222-222222222222', 'Paulo Mendes', 7),
  ('66666666-6666-6666-6666-666666666666', 'Downcomer', '33333333-3333-3333-3333-333333333333', 'Lucas Pereira', 9),
  ('77777777-7777-7777-7777-777777777777', 'Canal Soleflue', '33333333-3333-3333-3333-333333333333', 'Fernando Lima', 8)
on conflict do nothing;

-- ============================================================
-- FURNACES (sample for Bateria 3A)
-- ============================================================
insert into public.furnaces (battery_id, number, status, region) 
select 
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  n,
  case 
    when random() < 0.7 then 'operational'
    when random() < 0.85 then 'repair'
    when random() < 0.95 then 'maintenance'
    else 'idle'
  end,
  case floor(random() * 10)::int
    when 0 then 'Porta'
    when 1 then 'Soleira'
    when 2 then 'Teto'
    when 3 then 'Parede Lateral'
    when 4 then 'Parede Testeira'
    when 5 then 'Canal Ascendente'
    when 6 then 'Canal Soleflue'
    when 7 then 'Downcomer'
    when 8 then 'Primária'
    else 'Quadrante'
  end
from generate_series(1, 67) as n
on conflict do nothing;

-- Furnaces for Bateria 4B
insert into public.furnaces (battery_id, number, status, region)
select 
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  n,
  case 
    when random() < 0.6 then 'operational'
    when random() < 0.8 then 'repair'
    else 'maintenance'
  end,
  case floor(random() * 10)::int
    when 0 then 'Porta'
    when 1 then 'Soleira'
    when 2 then 'Teto'
    when 3 then 'Parede Lateral'
    else 'Quadrante'
  end
from generate_series(1, 67) as n
on conflict do nothing;

-- Furnaces for Bateria 5C
insert into public.furnaces (battery_id, number, status, region)
select 
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  n,
  case 
    when random() < 0.5 then 'operational'
    when random() < 0.7 then 'repair'
    else 'maintenance'
  end,
  case floor(random() * 10)::int
    when 0 then 'Porta'
    when 1 then 'Soleira'
    else 'Downcomer'
  end
from generate_series(1, 67) as n
on conflict do nothing;

-- ============================================================
-- MATERIALS
-- ============================================================
insert into public.materials (id, name, code, unit, quantity, min_quantity, location) values
  ('88888888-8888-8888-8888-888888888888', 'Tijolo Refratário MgO', 'REF-001', 'un', 1200, 500, 'Almoxarifado A1'),
  ('99999999-9999-9999-9999-999999999999', 'Argamassa Refratária', 'REF-002', 'kg', 850, 200, 'Almoxarifado A1'),
  ('aaaaaaaa-1111-1111-1111-111111111111', 'Massa de Projeção', 'REF-003', 'kg', 2500, 1000, 'Almoxarifado A2'),
  ('bbbbbbbb-1111-1111-1111-111111111111', 'Fibra Cerâmica', 'REF-004', 'm²', 450, 150, 'Almoxarifado A2'),
  ('cccccccc-1111-1111-1111-111111111111', 'Aço Especial', 'MEC-001', 'kg', 800, 300, 'Almoxarifado B1'),
  ('dddddddd-1111-1111-1111-111111111111', 'Eletrodo de Solda', 'SOL-001', 'un', 5000, 1500, 'Almoxarifado B1'),
  ('eeeeeeee-1111-1111-1111-111111111111', 'Tubo Andaime', 'AND-001', 'un', 320, 100, 'Pátio Externo')
on conflict do nothing;

-- ============================================================
-- SAMPLE KPIs (current period)
-- ============================================================
insert into public.kpis (contract_id, period_start, period_end, hh_programmed, hh_realized, adherence, activities_planned, activities_completed, deviations, deviations_resolved, availability, workforce, attendance, labor_cost, material_cost, pu_revenue) values
  ('11111111-1111-1111-1111-111111111111', current_date - 14, current_date + 1, 1920, 1824, 95.0, 168, 159, 22, 18, 92.3, 58, 93.5, 245000, 89000, null),
  ('22222222-2222-2222-2222-222222222222', current_date - 14, current_date + 1, 1440, 1368, 95.0, 120, 114, 15, 12, 91.5, 42, 94.2, 180000, 65000, null),
  ('33333333-3333-3333-3333-333333333333', current_date - 14, current_date + 1, 1200, 1140, 95.0, 100, 95, 12, 10, 93.0, 35, 92.8, 150000, 48000, 178000)
on conflict do nothing;

-- ============================================================
-- SAMPLE ACTIVITIES
-- ============================================================
insert into public.activities (contract_id, team_id, region, description, planned_hh, actual_hh, status, scheduled_date) values
  ('11111111-1111-1111-1111-111111111111', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Soleira', 'Projeção de soleira - Forno 12', 8, 7.5, 'completed', current_date - 2),
  ('11111111-1111-1111-1111-111111111111', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Soleira', 'Projeção de soleira - Forno 15', 8, null, 'in_progress', current_date),
  ('11111111-1111-1111-1111-111111111111', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Quadrante', 'Reparo quadrante - Forno 23', 12, 14, 'completed', current_date - 1),
  ('11111111-1111-1111-1111-111111111111', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'Porta', 'Troca de porta - Forno 8', 6, null, 'pending', current_date + 1),
  ('22222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444', 'Porta', 'Manutenção mecânica - Forno 45', 10, 9, 'completed', current_date - 3),
  ('22222222-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555555', 'Parede Lateral', 'Solda estrutural - Forno 32', 8, null, 'in_progress', current_date),
  ('33333333-3333-3333-3333-333333333333', '66666666-6666-6666-6666-666666666666', 'Downcomer', 'Inspeção downcomer - Forno 55', 4, 4.5, 'completed', current_date - 1),
  ('33333333-3333-3333-3333-333333333333', '77777777-7777-7777-7777-777777777777', 'Canal Soleflue', 'Limpeza canal - Forno 61', 6, null, 'pending', current_date + 2)
on conflict do nothing;
