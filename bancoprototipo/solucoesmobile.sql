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
