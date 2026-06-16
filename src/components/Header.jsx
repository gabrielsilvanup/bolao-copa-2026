export default function Header({ totalParticipantes }) {
  return (
    <header className="hero">
      <div>
        <p className="tag">Bolão da Copa 2026</p>
        <h1>Palpites dos participantes</h1>
        <p>
          Base oficial carregada a partir de{" "}
          <strong>palpites-copa-2026.json</strong>.
        </p>
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
      </div>
    </header>
  );
}