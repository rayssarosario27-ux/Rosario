import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers.dart';
import '../widgets/agendamento_item.dart';
import '../../domain/entities/agendamento.dart';
import 'dart:math';

/// `AgendaPage` exibe a lista de agendamentos e delega toda a lógica para o
/// `AgendamentoViewModel`. A view não contém lógica de negócio.
class AgendaPage extends ConsumerStatefulWidget {
  const AgendaPage({super.key});

  @override
  ConsumerState<AgendaPage> createState() => _AgendaPageState();
}

class _AgendaPageState extends ConsumerState<AgendaPage> {
  @override
  void initState() {
    super.initState();
    // Carrega agendamentos ao iniciar a view
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(agendamentoViewModelProvider.notifier).loadAgendamentos();
    });
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(agendamentoViewModelProvider);
    final vm = ref.read(agendamentoViewModelProvider.notifier);

    return Scaffold(
      appBar: AppBar(title: const Text('Axé Fadakà – Agendamentos')),
      body: RefreshIndicator(
        onRefresh: () => vm.loadAgendamentos(),
        child: state.loading
            ? const Center(child: CircularProgressIndicator())
            : state.agendamentos.isEmpty
                ? ListView(
                    children: const [
                      SizedBox(height: 120),
                      Center(child: Text('Nenhum agendamento encontrado', style: TextStyle(color: Colors.white70))),
                    ],
                  )
                : ListView.builder(
                    itemCount: state.agendamentos.length,
                    itemBuilder: (context, index) {
                      final a = state.agendamentos[index];
                      return AgendamentoItem(agendamento: a);
                    },
                  ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () async {
          // Gera mock de agendamento conforme requisito
          final id = Random().nextInt(100000).toString();
          final agora = DateTime.now();
          final novo = Agendamento(
            id: id,
            clienteNome: 'Cliente Teste',
            dataHora: agora,
            tipoServico: 'Jogo de Búzios',
            valor: 100.0,
            status: 'pendente',
          );
          await vm.addAgendamento(novo);
        },
        child: const Icon(Icons.add),
      ),
    );
  }
}
