import '../entities/agendamento.dart';

/// Interface do repositório no domínio. Define casos de uso que a camada
/// de dados deve implementar. Mantém a regra de negócio independente da
/// implementação externa (Firestore, mock, etc.).
abstract class AgendamentoRepository {
  Future<void> addAgendamento(Agendamento agendamento);
  Future<List<Agendamento>> getAgendamentos();
}
