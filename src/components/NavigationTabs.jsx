const ABAS = [
  { id: "resumo", label: "Resumo" },
  { id: "ranking", label: "Ranking" },
  { id: "participantes", label: "Participantes" },
  { id: "palpites", label: "Palpites" },
  { id: "resultados", label: "Resultados" },
  { id: "admin", label: "Admin" },
  { id: "regras", label: "Regras" },
];

export default function NavigationTabs({ abaAtual, onSelecionarAba }) {
  return (
    <nav className="tabs-card">
      <div className="tabs-scroll">
        {ABAS.map((aba) => (
          <button
            key={aba.id}
            className={abaAtual === aba.id ? "tab ativa" : "tab"}
            onClick={() => onSelecionarAba(aba.id)}
          >
            {aba.label}
          </button>
        ))}
      </div>
    </nav>
  );
}