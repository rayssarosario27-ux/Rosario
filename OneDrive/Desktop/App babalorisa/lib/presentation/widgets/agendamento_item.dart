import 'package:flutter/material.dart';
import '../../domain/entities/agendamento.dart';

class AgendamentoItem extends StatelessWidget {
  final Agendamento agendamento;

  const AgendamentoItem({super.key, required this.agendamento});

  @override
  Widget build(BuildContext context) {
    return ListTile(
      title: Text(agendamento.clienteNome),
      subtitle: Text('${agendamento.tipoServico} • ${agendamento.dataHora.toLocal()}'),
      trailing: Text('R\$ ${agendamento.valor.toStringAsFixed(2)}'),
    );
  }
}
