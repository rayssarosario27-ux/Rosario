/// Entidade `Agendamento` representando o modelo de domínio.
class Agendamento {
  final String id;
  final String clienteNome;
  final DateTime dataHora;
  final String tipoServico;
  final double valor;
  final String status; // ex: pendente, confirmado, cancelado

  Agendamento({
    required this.id,
    required this.clienteNome,
    required this.dataHora,
    required this.tipoServico,
    required this.valor,
    required this.status,
  });
}
