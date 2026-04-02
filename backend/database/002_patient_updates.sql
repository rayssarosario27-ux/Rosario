-- ============================================================
-- 002 — Patient table improvements
-- Run this AFTER 001_initial_schema.sql
-- ============================================================

-- pacientes table (patient portal users)
CREATE TABLE IF NOT EXISTS pacientes (
  id                      SERIAL PRIMARY KEY,
  nome                    VARCHAR(200) NOT NULL,
  cpf                     VARCHAR(14) UNIQUE NOT NULL,
  email                   VARCHAR(200) UNIQUE NOT NULL,
  celular                 VARCHAR(30),
  telefone                VARCHAR(30),
  data_nascimento         DATE,
  genero                  VARCHAR(20),
  cep                     VARCHAR(10),
  logradouro              VARCHAR(200),
  numero                  VARCHAR(20),
  complemento             VARCHAR(200),
  sem_complemento         BOOLEAN DEFAULT false,
  bairro                  VARCHAR(100),
  cidade                  VARCHAR(100),
  estado                  VARCHAR(2),
  convenio                VARCHAR(100),
  carteirinha             VARCHAR(100),
  senha_hash              TEXT NOT NULL,
  codigo_verificacao      VARCHAR(10),
  verificado              BOOLEAN DEFAULT false,
  reset_token             VARCHAR(100),
  reset_token_expiry      TIMESTAMPTZ,
  biometria_face_data     TEXT,        -- base64 last captured frame
  biometria_atualizada_em TIMESTAMPTZ,
  ultimo_acesso           TIMESTAMPTZ,
  criado_em               TIMESTAMPTZ DEFAULT NOW()
);

-- Idempotent column additions (in case table already exists without these columns)
ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS celular VARCHAR(30);
ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS complemento VARCHAR(200);
ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS sem_complemento BOOLEAN DEFAULT false;
ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS cep VARCHAR(10);
ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS logradouro VARCHAR(200);
ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS numero VARCHAR(20);
ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS bairro VARCHAR(100);
ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS cidade VARCHAR(100);
ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS estado VARCHAR(2);
ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS reset_token VARCHAR(100);
ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS reset_token_expiry TIMESTAMPTZ;
ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS biometria_face_data TEXT;
ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS biometria_atualizada_em TIMESTAMPTZ;
