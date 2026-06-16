const ABAS = [
  { id: "resumo", label: "Resumo", descricao: "visão geral" },
  { id: "ranking", label: "Ranking", descricao: "classificação" },
  { id: "participantes", label: "Participantes", descricao: "desempenho" },
  { id: "palpites", label: "Palpites", descricao: "jogo a jogo" },
  { id: "resultados", label: "Resultados", descricao: "oficiais" },
  { id: "admin", label: "Admin", descricao: "gestão" },
  { id: "regras", label: "Regras", descricao: "pontuação" },
];

function rolarParaTopo() {
  window.requestAnimationFrame(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });
}

export default function NavigationTabs({ abaAtual, onSelecionarAba }) {
  function selecionarAba(id) {
    onSelecionarAba(id);
    rolarParaTopo();
  }

  return (
    <nav className="tabs-card" aria-label="Navegação principal">
      <div className="tabs-scroll">
        {ABAS.map((aba) => (
          <button
            key={aba.id}
            type="button"
            className={abaAtual === aba.id ? "tab ativa" : "tab"}
            onClick={() => selecionarAba(aba.id)}
            aria-current={abaAtual === aba.id ? "page" : undefined}
          >
            <span>{aba.label}</span>
            <small>{aba.descricao}</small>
          </button>
        ))}
      </div>
    </nav>
  );
}
