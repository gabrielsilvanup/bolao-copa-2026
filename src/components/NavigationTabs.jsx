const ABAS = [
  { id: "resumo", label: "Resumo" },
  { id: "ranking", label: "Tabela" },
  { id: "participantes", label: "Participantes" },
  { id: "palpites", label: "Palpites" },
  { id: "resultados", label: "Resultados" },
  { id: "admin", label: "Admin" },
  { id: "regras", label: "Regras" },
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
            {aba.label}
          </button>
        ))}
      </div>
    </nav>
  );
}