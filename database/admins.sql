-- Tabela de administradores (TI, médico, recepção)
CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(200) NOT NULL,
    tipo VARCHAR(20) NOT NULL, -- 'ti', 'medico', 'recepcao'
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
