import React, { useState } from 'react';
import PacienteReconhecidoAlerta from '../components/PacienteReconhecidoAlerta';

export default function PainelRecepcao() {
  // Simulação: paciente reconhecido
  const [pacienteReconhecido, setPacienteReconhecido] = useState({
    nome: 'João da Silva',
    cpf: '123.456.789-00',
    email: 'joao@email.com',
    telefone: '(21) 99999-9999'
  });
  const [motivo, setMotivo] = useState('Consulta de rotina');

  return (
    <div className="painel-recepcao">
      <h1>Painel da Recepção</h1>
      <p>Aqui a recepcionista gerencia cadastros, agendamentos e vê alertas de reconhecimento facial.</p>
      <PacienteReconhecidoAlerta paciente={pacienteReconhecido} motivo={motivo} />
      {/* Listagem de pacientes, busca, alertas, etc. */}
    </div>
  );
}
