// GENERATED CODE - manual Hive TypeAdapter for AgendamentoModel
// DO NOT EDIT BY HAND if using codegen. This file is provided so the
// project can run without invoking code generation in this environment.

import 'package:hive/hive.dart';
import 'agendamento_model.dart';

class AgendamentoModelAdapter extends TypeAdapter<AgendamentoModel> {
  @override
  final int typeId = 0;

  @override
  AgendamentoModel read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{};
    for (var i = 0; i < numOfFields; i++) {
      final field = reader.readByte();
      fields[field] = reader.read();
    }
    final id = fields[0] as String;
    final clienteNome = fields[1] as String;
    final dataHoraIso = fields[2] as String;
    final tipoServico = fields[3] as String;
    final valor = fields[4] as double;
    final status = fields[5] as String;
    return AgendamentoModel(
      id: id,
      clienteNome: clienteNome,
      dataHora: DateTime.parse(dataHoraIso),
      tipoServico: tipoServico,
      valor: valor,
      status: status,
    );
  }

  @override
  void write(BinaryWriter writer, AgendamentoModel obj) {
    writer
      ..writeByte(6)
      ..writeByte(0)
      ..write(obj.id)
      ..writeByte(1)
      ..write(obj.clienteNome)
      ..writeByte(2)
      ..write(obj.dataHora.toIso8601String())
      ..writeByte(3)
      ..write(obj.tipoServico)
      ..writeByte(4)
      ..write(obj.valor)
      ..writeByte(5)
      ..write(obj.status);
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) || (other is AgendamentoModelAdapter && runtimeType == other.runtimeType && typeId == other.typeId);
}
