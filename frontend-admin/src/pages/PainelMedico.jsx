import React, { useState } from 'react';
import PacienteReconhecidoAlerta from '../components/PacienteReconhecidoAlerta';

export default function PainelMedico() {
  // Simulação: paciente reconhecido
  const [pacienteReconhecido, setPacienteReconhecido] = useState({
    nome: 'João da Silva',
    cpf: '123.456.789-00',
    email: 'joao@email.com',
    telefone: '(21) 99999-9999'
  });
  const [motivo, setMotivo] = useState('Consulta de rotina');

  return (
    <div className="painel-medico">
      <h1>Painel do Médico</h1>
      <p>Aqui o médico visualiza pacientes, consultas e biometria facial.</p>
      <PacienteReconhecidoAlerta paciente={pacienteReconhecido} motivo={motivo} />
      {/* Listagem de pacientes, busca, detalhes, etc. */}
    </div>
  );
}
