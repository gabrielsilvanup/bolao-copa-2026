export default function Header({ totalParticipantes, compacto = false }) {
  return (
    <header className={compacto ? "hero hero-compacto" : "hero"}>
      <div className="hero-content">
        <p className="tag">Bolão da Copa 2026</p>
        <h1>Bolão da Copa 2026</h1>

        {!compacto && (
          <>
            <p>
              Ranking, palpites, resultados oficiais e premiação em uma visão
              única para acompanhar a disputa sem perder o contexto das regras.
            </p>

            <div className="hero-rule-strip" aria-label="Resumo das regras">
              <span>Grupos: 10 + 5</span>
              <span>Mata-mata: avanço</span>
              <span>Sem desempate</span>
              <span>Prêmio dividido</span>
            </div>
          </>
        )}
      </div>

      <div className="resumo">
        <div>
          <strong>{totalParticipantes}</strong>
          <span>participantes</span>
        </div>
        <div>
          <strong>104</strong>
          <span>jogos por pessoa</span>
        </div>
        <div>
          <strong>5%</strong>
          <span>organização</span>
        </div>
      </div>
    </header>
  );
}
