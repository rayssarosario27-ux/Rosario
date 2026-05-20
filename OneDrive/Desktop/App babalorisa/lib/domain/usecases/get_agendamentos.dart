import '../entities/agendamento.dart';
import '../repositories/agendamento_repository.dart';

/// UseCase: obtém a lista de agendamentos do repositório.
class GetAgendamentos {
  final AgendamentoRepository repository;

  GetAgendamentos(this.repository);

  Future<List<Agendamento>> call() async {
    return await repository.getAgendamentos();
  }
}
