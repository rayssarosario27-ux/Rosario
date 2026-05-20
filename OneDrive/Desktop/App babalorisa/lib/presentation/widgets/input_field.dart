import 'package:flutter/material.dart';

/// InputField: campo reutilizável com estilo elegante (bordas arredondadas,
/// fundo translúcido e ícone opcional). Não contém lógica de validação;
/// apenas apresentação e exposição do controller.
class InputField extends StatelessWidget {
  final String hint;
  final TextEditingController controller;
  final bool obscureText;
  final Widget? prefixIcon;

  const InputField({super.key, required this.hint, required this.controller, this.obscureText = false, this.prefixIcon});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(14),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.25), blurRadius: 8, offset: const Offset(0, 4)),
        ],
      ),
      child: TextField(
        controller: controller,
        obscureText: obscureText,
        style: const TextStyle(color: Colors.white),
        decoration: InputDecoration(
          hintText: hint,
          prefixIcon: prefixIcon,
          filled: true,
          fillColor: Colors.white10,
          hintStyle: const TextStyle(color: Colors.white70),
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
        ),
      ),
    );
  }
}
