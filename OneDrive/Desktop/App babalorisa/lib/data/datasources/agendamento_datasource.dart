import 'package:hive/hive.dart';
import '../models/agendamento_model.dart';

/// DataSource abstrato. Pode ter implementações: Firestore, REST, Mock, Hive.
abstract class AgendamentoDatasource {
  Future<void> addAgendamento(AgendamentoModel agendamento);
  Future<List<AgendamentoModel>> getAgendamentos();
}

/// Implementação usando Hive para persistência local.
/// A Box chamada `agendamentos` armazena os objetos `AgendamentoModel`.
class HiveAgendamentoDatasource implements AgendamentoDatasource {
  static const String boxName = 'agendamentos';

  Box<AgendamentoModel> get _box => Hive.box<AgendamentoModel>(boxName);

  @override
  Future<void> addAgendamento(AgendamentoModel agendamento) async {
    // Salva usando a chave do id para facilitar atualizações/remover futuramente
    await _box.put(agendamento.id, agendamento);
  }

  @override
  Future<List<AgendamentoModel>> getAgendamentos() async {
    return _box.values.toList();
  }
}

