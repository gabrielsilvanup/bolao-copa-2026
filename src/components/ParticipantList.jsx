export default function ParticipantList({
  participantes,
  participanteSelecionado,
  busca,
  onBuscaChange,
  onSelecionarParticipante,
}) {
  return (
    <aside className="sidebar card">
      <h2>Participantes</h2>

      <input
        className="input"
        type="text"
        placeholder="Buscar participante..."
        value={busca}
        onChange={(event) => onBuscaChange(event.target.value)}
      />

      <div className="lista-participantes">
        {participantes.map((item) => (
          <button
            key={item.participante}
            className={
              participanteSelecionado?.participante === item.participante
                ? "participante ativo"
                : "participante"
            }
            onClick={() => onSelecionarParticipante(item)}
          >
            <span>{item.participante}</span>
            <small>{item.status_extracao}</small>
          </button>
        ))}
      </div>
    </aside>
  );
}