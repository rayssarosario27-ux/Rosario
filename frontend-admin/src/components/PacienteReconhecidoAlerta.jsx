import React from 'react';

export default function PacienteReconhecidoAlerta({ paciente, motivo }) {
  if (!paciente) return null;
  return (
    <div className="paciente-alerta">
      <h2>Paciente Reconhecido!</h2>
      <p><strong>Nome:</strong> {paciente.nome}</p>
      <p><strong>CPF:</strong> {paciente.cpf}</p>
      <p><strong>Email:</strong> {paciente.email}</p>
      <p><strong>Telefone:</strong> {paciente.telefone}</p>
      <p><strong>Motivo da Consulta:</strong> {motivo || 'Não informado'}</p>
      {/* Adicione outros campos relevantes aqui */}
    </div>
  );
}
