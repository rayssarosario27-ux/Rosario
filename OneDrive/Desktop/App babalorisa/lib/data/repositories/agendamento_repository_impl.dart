import '../../domain/entities/agendamento.dart';
import '../../domain/repositories/agendamento_repository.dart';
import '../datasources/agendamento_datasource.dart';
import '../models/agendamento_model.dart';

/// Implementação do repositório no módulo de dados. Faz a tradução entre
/// modelos de dados e entidades de domínio e delega operações ao datasource.
class AgendamentoRepositoryImpl implements AgendamentoRepository {
  final AgendamentoDatasource datasource;

  AgendamentoRepositoryImpl(this.datasource);

  @override
  Future<void> addAgendamento(Agendamento agendamento) async {
    final model = AgendamentoModel(
      id: agendamento.id,
      clienteNome: agendamento.clienteNome,
      dataHora: agendamento.dataHora,
      tipoServico: agendamento.tipoServico,
      valor: agendamento.valor,
      status: agendamento.status,
    );
    await datasource.addAgendamento(model);
  }

  @override
  Future<List<Agendamento>> getAgendamentos() async {
    final models = await datasource.getAgendamentos();
    return models
        .map((m) => Agendamento(
              id: m.id,
              clienteNome: m.clienteNome,
              dataHora: m.dataHora,
              tipoServico: m.tipoServico,
              valor: m.valor,
              status: m.status,
            ))
        .toList();
  }
}
