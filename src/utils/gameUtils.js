export const FASES = [
  { valor: "todos", label: "Todos os jogos" },
  { valor: "grupos", label: "Fase de grupos" },
  { valor: "dezesseis_avos", label: "16 avos" },
  { valor: "oitavas", label: "Oitavas" },
  { valor: "quartas", label: "Quartas" },
  { valor: "semifinal", label: "Semifinais" },
  { valor: "terceiro_lugar", label: "3º lugar" },
  { valor: "final", label: "Final" },
];

export function formatarFase(fase) {
  const item = FASES.find((f) => f.valor === fase);
  return item ? item.label : fase;
}

export function temPenaltisValidos(jogo) {
  return (
    jogo.gols_a !== null &&
    jogo.gols_b !== null &&
    jogo.gols_a === jogo.gols_b &&
    jogo.penaltis_a !== null &&
    jogo.penaltis_b !== null
  );
}

export function placarTexto(jogo) {
  if (jogo.gols_a === null || jogo.gols_b === null) {
    return "Não preenchido";
  }

  return `${jogo.gols_a} x ${jogo.gols_b}`;
}

export function vencedorTexto(jogo) {
  if (!jogo.vencedor_previsto) {
    if (jogo.resultado_previsto === "EMPATE") return "Empate";
    return "Não preenchido";
  }

  return jogo.vencedor_previsto;
}