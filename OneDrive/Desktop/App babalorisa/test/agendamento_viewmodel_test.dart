import 'package:flutter_test/flutter_test.dart';
import 'package:axe_fadaka_agenda/data/datasources/agendamento_datasource.dart';
import 'package:axe_fadaka_agenda/data/repositories/agendamento_repository_impl.dart';
import 'package:axe_fadaka_agenda/data/models/agendamento_model.dart';
import 'package:axe_fadaka_agenda/domain/usecases/add_agendamento.dart';
import 'package:axe_fadaka_agenda/domain/usecases/get_agendamentos.dart';
import 'package:axe_fadaka_agenda/presentation/viewmodels/agendamento_viewmodel.dart';
import 'package:axe_fadaka_agenda/domain/entities/agendamento.dart';

void main() {
  late AgendamentoDatasource datasource;
  late AgendamentoRepositoryImpl repository;
  late AddAgendamento addUsecase;
  late GetAgendamentos getUsecase;
  late AgendamentoViewModel viewModel;

  setUp(() {
    // Usa um Mock simples em memória para testes (não depende de Hive)
    datasource = _InMemoryDatasource();
    repository = AgendamentoRepositoryImpl(datasource);
    addUsecase = AddAgendamento(repository);
    getUsecase = GetAgendamentos(repository);
    viewModel = AgendamentoViewModel(addAgendamentoUseCase: addUsecase, getAgendamentosUseCase: getUsecase);
  });

  test('initial state is empty', () {
    expect(viewModel.state.agendamentos, isEmpty);
    expect(viewModel.state.loading, isFalse);
  });

  test('loadAgendamentos returns empty list initially', () async {
    await viewModel.loadAgendamentos();
    expect(viewModel.state.agendamentos, isEmpty);
  });

  test('addAgendamento adds a mock and updates state', () async {
    final ag = Agendamento(
      id: '1',
      clienteNome: 'Cliente Teste',
      dataHora: DateTime.now(),
      tipoServico: 'Jogo de Búzios',
      valor: 100.0,
      status: 'pendente',
    );

    await viewModel.addAgendamento(ag);

    expect(viewModel.state.agendamentos, isNotEmpty);
    expect(viewModel.state.agendamentos.first.clienteNome, 'Cliente Teste');
    expect(viewModel.state.agendamentos.first.valor, 100.0);
  });
}

class _InMemoryDatasource implements AgendamentoDatasource {
  final List<AgendamentoModel> _store = [];

  @override
  Future<void> addAgendamento(AgendamentoModel agendamento) async {
    _store.add(agendamento);
  }

  @override
  Future<List<AgendamentoModel>> getAgendamentos() async {
    return List<AgendamentoModel>.from(_store);
  }
}
