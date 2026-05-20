import '../entities/agendamento.dart';
import '../repositories/agendamento_repository.dart';

/// UseCase: adiciona um agendamento. Contém apenas orquestração da chamada
/// ao repositório — sem lógica de UI.
class AddAgendamento {
  final AgendamentoRepository repository;

  AddAgendamento(this.repository);

  Future<void> call(Agendamento agendamento) async {
    await repository.addAgendamento(agendamento);
  }
}
