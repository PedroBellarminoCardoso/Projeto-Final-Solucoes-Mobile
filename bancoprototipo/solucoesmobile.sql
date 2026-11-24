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
