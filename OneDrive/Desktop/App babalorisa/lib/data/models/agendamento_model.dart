import 'package:hive/hive.dart';
import '../../domain/entities/agendamento.dart';

/// Model usado na camada de dados. Esta implementação possui um Hive
/// TypeAdapter fornecido no arquivo `agendamento_model.g.dart` (não gerado
/// automaticamente aqui; incluímos a versão manual para evitar dependência
/// imediata de codegen).
@HiveType(typeId: 0)
class AgendamentoModel extends Agendamento {
  @HiveField(0)
  final String _id;

  @HiveField(1)
  final String _clienteNome;

  @HiveField(2)
  final String _dataHoraIso;

  @HiveField(3)
  final String _tipoServico;

  @HiveField(4)
  final double _valor;

  @HiveField(5)
  final String _status;

  AgendamentoModel({
    required String id,
    required String clienteNome,
    required DateTime dataHora,
    required String tipoServico,
    required double valor,
    required String status,
  })  : _id = id,
        _clienteNome = clienteNome,
        _dataHoraIso = dataHora.toIso8601String(),
        _tipoServico = tipoServico,
        _valor = valor,
        _status = status,
        super(id: id, clienteNome: clienteNome, dataHora: dataHora, tipoServico: tipoServico, valor: valor, status: status);

  Map<String, dynamic> toMap() {
    return {
      'id': _id,
      'clienteNome': _clienteNome,
      'dataHora': _dataHoraIso,
      'tipoServico': _tipoServico,
      'valor': _valor,
      'status': _status,
    };
  }

  factory AgendamentoModel.fromMap(Map<String, dynamic> map) {
    return AgendamentoModel(
      id: map['id']?.toString() ?? '',
      clienteNome: map['clienteNome'] ?? '',
      dataHora: DateTime.parse(map['dataHora']),
      tipoServico: map['tipoServico'] ?? '',
      valor: (map['valor'] is int) ? (map['valor'] as int).toDouble() : (map['valor'] ?? 0.0),
      status: map['status'] ?? '',
    );
  }
}

/// NOTE: The generated adapter `agendamento_model.g.dart` would normally be
/// produced by `build_runner` + `hive_generator`. For portability we keep
/// the generated file path (`part`) — if you run codegen, it will appear.
