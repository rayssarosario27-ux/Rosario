-- Estrutura da tabela de pacientes com biometria facial
CREATE TABLE IF NOT EXISTS pacientes (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cpf VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    telefone VARCHAR(30),
    data_nascimento DATE,
    genero VARCHAR(20),
    convenio VARCHAR(100),
    carteirinha VARCHAR(50),
    senha VARCHAR(200) NOT NULL,
    facial_biometria BYTEA, -- Armazena template biométrico (ex: base64, vetor, etc)
    facial_ultima_atualizacao TIMESTAMP,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de logs de reconhecimento facial
CREATE TABLE IF NOT EXISTS facial_logs (
    id SERIAL PRIMARY KEY,
    paciente_id INTEGER REFERENCES pacientes(id),
    data_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    local VARCHAR(100),
    motivo_consulta VARCHAR(200)
);
