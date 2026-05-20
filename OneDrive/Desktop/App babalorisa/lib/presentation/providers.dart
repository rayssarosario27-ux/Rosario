import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/datasources/agendamento_datasource.dart';
import '../data/repositories/agendamento_repository_impl.dart';
import '../domain/repositories/agendamento_repository.dart';
import '../domain/usecases/add_agendamento.dart';
import '../domain/usecases/get_agendamentos.dart';
import 'viewmodels/agendamento_viewmodel.dart';

/// Provider do datasource (injeção simples). Troque por FirestoreDatasource
/// quando estiver pronto.
final agendamentoDatasourceProvider = Provider<AgendamentoDatasource>((ref) {
  return HiveAgendamentoDatasource();
});

final agendamentoRepositoryProvider = Provider<AgendamentoRepository>((ref) {
  final ds = ref.read(agendamentoDatasourceProvider);
  return AgendamentoRepositoryImpl(ds);
});

final addAgendamentoUseCaseProvider = Provider((ref) {
  return AddAgendamento(ref.read(agendamentoRepositoryProvider));
});

final getAgendamentosUseCaseProvider = Provider((ref) {
  return GetAgendamentos(ref.read(agendamentoRepositoryProvider));
});

final agendamentoViewModelProvider = StateNotifierProvider<AgendamentoViewModel, AgendamentoState>((ref) {
  return AgendamentoViewModel(
    addAgendamentoUseCase: ref.read(addAgendamentoUseCaseProvider),
    getAgendamentosUseCase: ref.read(getAgendamentosUseCaseProvider),
  );
});
