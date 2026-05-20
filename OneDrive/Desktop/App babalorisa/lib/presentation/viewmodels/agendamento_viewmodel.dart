import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/entities/agendamento.dart';
import '../../domain/repositories/agendamento_repository.dart';
import '../../domain/usecases/add_agendamento.dart';
import '../../domain/usecases/get_agendamentos.dart';

/// Estado simples para a tela de lista de agendamentos.
class AgendamentoState {
  final bool loading;
  final List<Agendamento> agendamentos;

  AgendamentoState({required this.loading, required this.agendamentos});

  AgendamentoState.initial() : loading = false, agendamentos = [];

  AgendamentoState copyWith({bool? loading, List<Agendamento>? agendamentos}) {
    return AgendamentoState(
      loading: loading ?? this.loading,
      agendamentos: agendamentos ?? this.agendamentos,
    );
  }
}

/// ViewModel usando StateNotifier. Contém lógica de orquestração entre
/// UseCases e estado da UI. Nenhuma lógica de UI aqui.
class AgendamentoViewModel extends StateNotifier<AgendamentoState> {
  final AddAgendamento addAgendamentoUseCase;
  final GetAgendamentos getAgendamentosUseCase;

  AgendamentoViewModel({required this.addAgendamentoUseCase, required this.getAgendamentosUseCase}) : super(AgendamentoState.initial());

  Future<void> loadAgendamentos() async {
    state = state.copyWith(loading: true);
    final list = await getAgendamentosUseCase();
    state = state.copyWith(loading: false, agendamentos: list);
  }

  Future<void> addAgendamento(Agendamento agendamento) async {
    state = state.copyWith(loading: true);
    await addAgendamentoUseCase(agendamento);
    await loadAgendamentos();
  }
}
