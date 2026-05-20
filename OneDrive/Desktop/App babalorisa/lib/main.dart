import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'presentation/views/home_page.dart';
import 'core/theme.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'data/models/agendamento_model.g.dart';
import 'data/models/agendamento_model.dart';
import 'data/datasources/agendamento_datasource.dart';

// NOTA: A inicialização do Firebase está preparada, mas exige configurações
// reais (google-services) quando for conectado ao projeto real.
Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  // Inicializa Hive para persistência local
  await Hive.initFlutter();
  // Registra adapter (manual ou gerado)
  Hive.registerAdapter(AgendamentoModelAdapter());
  // Abre box onde os agendamentos serão armazenados
  await Hive.openBox<AgendamentoModel>(HiveAgendamentoDatasource.boxName);

  try {
    await Firebase.initializeApp();
  } catch (_) {
    // Sem credenciais locais o Firebase apenas fica preparado.
  }

  runApp(const ProviderScope(child: MyApp()));
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Axé Fadakà – Agenda do Babalorixá',
      theme: AppTheme.theme,
      home: const AgendaPage(),
      routes: {
        '/agenda': (_) => const AgendaPage(),
      },
    );
  }
}
