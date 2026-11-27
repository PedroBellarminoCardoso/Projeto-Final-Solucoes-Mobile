CREATE TYPE tipo_movimento   AS ENUM ('despesa', 'receita');
CREATE TYPE tipo_notificacao AS ENUM ('limite_excedido', 'limite_proximo', 'receita_recebida', 'dica');

CREATE TABLE usuarios (
  id              INTEGER      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nome            VARCHAR(100) NOT NULL,
  email           VARCHAR(150) NOT NULL CHECK (position('@' IN email) > 1),
  senha_hash      VARCHAR(255) NOT NULL,                 -- nunca guardar senha pura (use bcrypt/argon2)
  ocultar_valores BOOLEAN      NOT NULL DEFAULT FALSE,   -- botão "olho" do app
  criado_em       TIMESTAMPTZ  NOT NULL DEFAULT now(),
  atualizado_em   TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX uq_usuarios_email ON usuarios (lower(email));

CREATE TABLE categorias (
  id         INTEGER     GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  usuario_id INTEGER     REFERENCES usuarios (id) ON DELETE CASCADE,  -- NULL = categoria padrão do sistema
  nome       VARCHAR(60) NOT NULL,
  tipo       tipo_movimento NOT NULL,
  icone      VARCHAR(40) NOT NULL DEFAULT 'tag',                      -- nome do ícone Feather
  cor        VARCHAR(7)  NOT NULL DEFAULT '#6D38E8' CHECK (cor ~ '^#[0-9A-Fa-f]{6}$'),
  ativa      BOOLEAN     NOT NULL DEFAULT TRUE,                       -- "excluir" = desativar (preserva histórico)
  criado_em  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_categorias_id_tipo UNIQUE (id, tipo)                  -- permite FK composta (id, tipo)
);

CREATE UNIQUE INDEX uq_categorias_dono_tipo_nome ON categorias (COALESCE(usuario_id, 0), tipo, lower(nome));

CREATE TABLE transacoes (
  id             BIGINT         GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  usuario_id     INTEGER        NOT NULL REFERENCES usuarios (id) ON DELETE CASCADE,
  categoria_id   INTEGER        NOT NULL,
  tipo           tipo_movimento NOT NULL,
  valor          NUMERIC(12,2)  NOT NULL CHECK (valor > 0),
  descricao      VARCHAR(255)   NOT NULL CHECK (length(btrim(descricao)) > 0),
  data_transacao DATE           NOT NULL,
  criado_em      TIMESTAMPTZ    NOT NULL DEFAULT now(),
  atualizado_em  TIMESTAMPTZ    NOT NULL DEFAULT now(),
  -- garante que despesa só use categoria de despesa e receita só de receita
  CONSTRAINT fk_transacoes_categoria FOREIGN KEY (categoria_id, tipo) REFERENCES categorias (id, tipo)
);

CREATE INDEX ix_transacoes_usuario_data  ON transacoes (usuario_id, data_transacao DESC, id DESC);
CREATE INDEX ix_transacoes_usuario_cat   ON transacoes (usuario_id, categoria_id, data_transacao);
CREATE INDEX ix_transacoes_categoria     ON transacoes (categoria_id);

CREATE TABLE orcamentos_mensais (
  id            INTEGER       GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  usuario_id    INTEGER       NOT NULL REFERENCES usuarios (id) ON DELETE CASCADE,
  ano           SMALLINT      NOT NULL CHECK (ano BETWEEN 2000 AND 2100),
  mes           SMALLINT      NOT NULL CHECK (mes BETWEEN 1 AND 12),
  limite_geral  NUMERIC(12,2) CHECK (limite_geral > 0),
  criado_em     TIMESTAMPTZ   NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ   NOT NULL DEFAULT now(),
  CONSTRAINT uq_orcamento_usuario_mes UNIQUE (usuario_id, ano, mes)
);

CREATE TABLE orcamentos_categoria (
  id           INTEGER        GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  orcamento_id INTEGER        NOT NULL REFERENCES orcamentos_mensais (id) ON DELETE CASCADE,
  categoria_id INTEGER        NOT NULL,
  tipo         tipo_movimento NOT NULL DEFAULT 'despesa' CHECK (tipo = 'despesa'),  -- limite só faz sentido p/ despesa
  limite       NUMERIC(12,2)  NOT NULL CHECK (limite > 0),
  CONSTRAINT uq_orcamento_categoria UNIQUE (orcamento_id, categoria_id),
  CONSTRAINT fk_orc_cat_categoria FOREIGN KEY (categoria_id, tipo) REFERENCES categorias (id, tipo)
);

CREATE INDEX ix_orc_cat_categoria ON orcamentos_categoria (categoria_id);

CREATE TABLE notificacoes (
  id           BIGINT           GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  usuario_id   INTEGER          NOT NULL REFERENCES usuarios (id) ON DELETE CASCADE,
  chave        VARCHAR(120)     NOT NULL,
  tipo         tipo_notificacao NOT NULL,
  titulo       VARCHAR(150)     NOT NULL,
  mensagem     VARCHAR(500)     NOT NULL,
  categoria_id INTEGER          REFERENCES categorias (id) ON DELETE SET NULL,
  transacao_id BIGINT           REFERENCES transacoes (id) ON DELETE CASCADE,
  lida         BOOLEAN          NOT NULL DEFAULT FALSE,
  criada_em    TIMESTAMPTZ      NOT NULL DEFAULT now(),
  lida_em      TIMESTAMPTZ,
  CONSTRAINT uq_notificacao_usuario_chave UNIQUE (usuario_id, chave)
);

CREATE INDEX ix_notificacoes_usuario ON notificacoes (usuario_id, lida, criada_em DESC);
CREATE INDEX ix_notificacoes_categoria ON notificacoes (categoria_id);
CREATE INDEX ix_notificacoes_transacao ON notificacoes (transacao_id);

CREATE FUNCTION fn_atualizar_timestamp() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  NEW.atualizado_em := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_usuarios_atualizado  BEFORE UPDATE ON usuarios
  FOR EACH ROW EXECUTE FUNCTION fn_atualizar_timestamp();
CREATE TRIGGER trg_transacoes_atualizado BEFORE UPDATE ON transacoes
  FOR EACH ROW EXECUTE FUNCTION fn_atualizar_timestamp();
CREATE TRIGGER trg_orcamentos_atualizado BEFORE UPDATE ON orcamentos_mensais
  FOR EACH ROW EXECUTE FUNCTION fn_atualizar_timestamp();

CREATE FUNCTION fn_validar_categoria_transacao() RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE
  v_dono INTEGER;
BEGIN
  SELECT usuario_id INTO v_dono FROM categorias WHERE id = NEW.categoria_id;
  IF v_dono IS NOT NULL AND v_dono <> NEW.usuario_id THEN
    RAISE EXCEPTION 'Categoria % não pertence ao usuário %', NEW.categoria_id, NEW.usuario_id
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_transacoes_valida_categoria
  BEFORE INSERT OR UPDATE OF usuario_id, categoria_id ON transacoes
  FOR EACH ROW EXECUTE FUNCTION fn_validar_categoria_transacao();

CREATE FUNCTION fn_validar_categoria_orcamento() RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE
  v_usuario INTEGER;
  v_dono    INTEGER;
BEGIN
  SELECT usuario_id INTO v_usuario FROM orcamentos_mensais WHERE id = NEW.orcamento_id;
  SELECT usuario_id INTO v_dono    FROM categorias         WHERE id = NEW.categoria_id;
  IF v_dono IS NOT NULL AND v_dono <> v_usuario THEN
    RAISE EXCEPTION 'Categoria % não pertence ao usuário do orçamento', NEW.categoria_id
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$;


CREATE TRIGGER trg_orc_cat_valida_categoria
  BEFORE INSERT OR UPDATE OF orcamento_id, categoria_id ON orcamentos_categoria
  FOR EACH ROW EXECUTE FUNCTION fn_validar_categoria_orcamento();

CREATE FUNCTION fn_brl(p_valor NUMERIC) RETURNS TEXT
LANGUAGE sql IMMUTABLE AS $$
  SELECT 'R$ ' || replace(to_char(p_valor, 'FM999999990.00'), '.', ',');
$$;

CREAT VIEW vw_resumo_mensal AS
SELECT
  usuario_id,
  EXTRACT(YEAR  FROM data_transacao)::INTEGER AS ano,
  EXTRACT(MONTH FROM data_transacao)::INTEGER AS mes,
  COALESCE(SUM(valor) FILTER (WHERE tipo = 'receita'), 0) AS receitas,
  COALESCE(SUM(valor) FILTER (WHERE tipo = 'despesa'), 0) AS despesas,
  COALESCE(SUM(valor) FILTER (WHERE tipo = 'receita'), 0)
    - COALESCE(SUM(valor) FILTER (WHERE tipo = 'despesa'), 0) AS saldo,
  COUNT(*) AS qtd_lancamentos
FROM transacoes
GROUP BY usuario_id,
         EXTRACT(YEAR  FROM data_transacao),
         EXTRACT(MONTH FROM data_transacao);
CREATE VIEW vw_gaastos_categoria_mensal AS
WITH base AS (
  SELECT
    usuario_id,
    EXTRACT(YEAR  FROM data_transacao)::INTEGER AS ano,
    EXTRACT(MONTH FROM data_transacao)::INTEGER AS mes,
    categoria_id,
    valor
  FROM transacoes
  WHERE tipo = 'despesa'
  ),
agg AS (
  SELECT usuario_id, ano, mes, categoria_id, SUM(valor) AS total, COUNT(*) AS qtd
  FROM base
  GROUP BY usuario_id, ano, mes, categoria_id
  )
SELECT
  a.usuario_id, a.ano, a.mes,
  a.categoria_id,
  c.nome  AS categoria_id,
  c.icone,
  c.cor,
  a.total,
  a.qtd,
  ROUND(a.total / a.qtd, 2) AS media,
  ROUND(100 * a.total / SUM(a.total) OVER (PARTITION BY a.usuario_id, a.ano, a.mes), 1) AS percentual
FROM agg a
JOIN categorias c ON c.id = a.categoria_id;

CREATE VIEW vw_orcamento_categoria_status_id AS
SELECT
  o.usuario_id, o.ano, o,mes,
  oc.categoria_id,
  c.nome  AS categoria,
  c.icone,
  c.cor,
  oc.limite,
  COALESCE(g.total, 0)                                   AS gasto,
  oc.limite - COALESCE(g.total, 0)                       AS restante,
  ROUND(100 * COALESCE(g.total, 0) / oc.limite, 1)       AS percentual,
  CASE
    WHEN COALESCE(g.total, 0) >  oc.limite        THEN 'excedido'
    WHEN COALESCE(g.total, 0) >= 0.85 * oc.limite THEN 'proximo'
  END AS status
FROM orcamentos_mensais o
JOIN orcamentos_categoria oc ON oc.orcamento_id = o.id
JOIN categorias c            ON c.id = oc.categoria_id
LEFT JOIN vw_gastos_categoria_mensal g
       ON g.usuario_id = o.usuario_id AND g.ano = o.ano AND g.mes = o.mes
      AND g.categoria_id = oc.categoria_id;

CREATE VIEW vw_orcamento_geral_status AS
WITH base AS (
  SELECT
    o.usuario_id, o.ano, o,mes,
    COALESCE(
      o.limite_geral,
      (SELECT SUM(oc.limite) orcamentos_categoria oc WHERE oc.orcamento_id = o.id),
      0
    ) AS limite,
    COALESCE(r.despesas, 0) AS gasto
  FROM orcamentos_mensais o
  LEFT JOIN vw_resumo_mensal r
         ON r.usuario_id = o.usuario_id AND r.ano = o.ano AND r.mes = o.mes
)
SELECT
  usuario_id, ano, mes, limite, gasto,
  limite - gasto AS restante,
  CASE WHEN limite > 0 THEN ROUND(100 * gasto / limite, 1) ELSE 0 END AS percentual
FROM base;  

CREATE FUNCTION fn_garantir_orcamento(p_usuario INTEGER, p_ano INTEGER, p_mes INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql AS $$
DECLARE
  v_id     INTEGER;
  v_origem INTEGER;
BEGIN
  SELECT id INTO v_id
    FROM orcamentos_mensais
   WHERE usuario_id = p_usuario AND ano = p_ano AND mes = p_mes;
  IF v_id IS NOT NULL THEN
    RETURN v_id;
  END IF;

SELECT id INTO v_origem
    FROM orcamentos_mensais
   WHERE usuario_id = p_usuario AND (ano, mes) < (p_ano, p_mes)
   ORDER BY ano DESC, mes DESC
   LIMIT 1;

IF v_origem IS NOT NULL THEN
    INSERT INTO orcamentos_mensais (usuario_id, ano, mes, limite_geral)
    SELECT usuario_id, p_ano, p_mes, limite_geral
      FROM orcamentos_mensais WHERE id = v_origem
    RETURNING id INTO v_id;

INSERT INTO orcamentos_categoria (orcamento_id, categoria_id, limite)
    SELECT v_id, categoria_id, limite
      FROM orcamentos_categoria WHERE orcamento_id = v_origem;
  ELSE
    INSERT INTO orcamentos_mensais (usuario_id, ano, mes)
    VALUES (p_usuario, p_ano, p_mes)
    RETURNING id INTO v_id;

    INSERT INTO orcamentos_categoria (orcamento_id, categoria_id, limite)
    SELECT v_id, c.id, p.limite
      FROM (VALUES ('Moradia', 900), ('Alimentação', 500), ('Estudos', 250),
                   ('Lazer', 150), ('Transporte', 200), ('Assinaturas', 200)) AS p(nome, limite)
      JOIN categorias c
        ON c.usuario_id IS NULL AND c.tipo = 'despesa' AND c.nome = p.nome;
  END IF;

  RETURN v_id;
END;
$$;

CREATE FUNCTION fn_gerar_notificacoes(p_usuario INTEGER, p_ano INTEGER, p_mes INTEGER)
RETURNS VOID
LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO notificacoes (usuario_id, chave, tipo, titulo, mensagem, categoria_id)
  SELECT
    s.usuario_id,
    CASE s.status WHEN 'excedido' THEN 'limite_excedido' ELSE 'limite_proximo' END
      || ':' || s.categoria_id::TEXT || ':' || p_ano::TEXT || '-' || lpad(p_mes::TEXT, 2, '0'),
    CASE s.status WHEN 'excedido' THEN 'limite_excedido'::tipo_notificacao
                  ELSE 'limite_proximo'::tipo_notificacao END,
    CASE s.status
      WHEN 'excedido' THEN s.categoria || ' passou do combinado'
      ELSE 'Só ' || fn_brl(GREATEST(s.restante, 0)) || ' para ' || lower(s.categoria)
    END,
    CASE s.status
      WHEN 'excedido' THEN 'Foram ' || fn_brl(s.gasto) || ' para um limite de ' || fn_brl(s.limite)
                           || '. Que tal rever o plano?'
      ELSE 'Seus gastos chegaram a ' || fn_brl(s.gasto) || ' de ' || fn_brl(s.limite)
           || '. Você usou ' || ROUND(s.percentual)::TEXT || '% do limite.'
    END,
    s.categoria_id
  FROM vw_orcamento_categoria_status s
  WHERE s.usuario_id = p_usuario
    AND s.ano = p_ano
    AND s.mes = p_mes
    AND s.status IN ('proximo', 'excedido')
  ON CONFLICT (usuario_id, chave) DO NOTHING;
INSERT INTO notificacoes (usuario_id, chave, tipo, titulo, mensagem, categoria_id, transacao_id)
  SELECT
    t.usuario_id,
    'receita_recebida:' || t.id::TEXT,
    'receita_recebida'::tipo_notificacao,
    c.nome || ' entrou no saldo!',
    fn_brl(t.valor) || ' registrados em ' || t.descricao || '. Boa hora para separar suas prioridades.',
    t.categoria_id,
    t.id
  FROM transacoes t
  JOIN categorias c ON c.id = t.categoria_id
  WHERE t.usuario_id = p_usuario
    AND t.tipo = 'receita'
    AND t.data_transacao >= make_date(p_ano, p_mes, 1)
    AND t.data_transacao <  make_date(p_ano, p_mes, 1) + INTERVAL '1 month'
  ORDER BY t.data_transacao DESC, t.id DESC
  LIMIT 1
  ON CONFLICT (usuario_id, chave) DO NOTHING;
END;
$$;

CREATE FUNCTION fn_trg_notificar_transacao() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  PERFORM fn_gerar_notificacoes(
    NEW.usuario_id,
    EXTRACT(YEAR  FROM NEW.data_transacao)::INTEGER,
    EXTRACT(MONTH FROM NEW.data_transacao)::INTEGER
  );
  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_transacoes_notificar
  AFTER INSERT OR UPDATE OF valor, categoria_id, tipo, data_transacao ON transacoes
  FOR EACH ROW EXECUTE FUNCTION fn_trg_notificar_transacao();

INSERT INTO categorias (usuario_id, nome, tipo, icone, cor) VALUES
  (NULL, 'Alimentação',   'despesa', 'coffee',      '#9B76F2'),
  (NULL, 'Transporte',    'despesa', 'navigation',  '#4C9990'),
  (NULL, 'Moradia',       'despesa', 'home',        '#6D38E8'),
  (NULL, 'Estudos',       'despesa', 'book-open',   '#E4B15B'),
  (NULL, 'Lazer',         'despesa', 'film',        '#6AB7A2'),
  (NULL, 'Assinaturas',   'despesa', 'refresh-cw',  '#B197FC'),
  (NULL, 'Saúde',         'despesa', 'heart',       '#D96B6B'),
  (NULL, 'Outros',        'despesa', 'grid',        '#7B7992'),
  (NULL, 'Bolsa',         'receita', 'award',       '#1C9B68'),
  (NULL, 'Estágio',       'receita', 'briefcase',   '#6D38E8'),
  (NULL, 'Apoio familiar','receita', 'heart',       '#4C9990'),
  (NULL, 'Freelance',     'receita', 'laptop',      '#E4B15B'),
  (NULL, 'Salário',       'receita', 'dollar-sign', '#1C9B68'),
  (NULL, 'Outros',        'receita', 'plus-circle', '#7B7992');
