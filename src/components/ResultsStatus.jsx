export default function ResultsStatus({ resultados }) {
  const totalJogos = resultados?.jogos?.length ?? 0;
  const jogosEncerrados =
    resultados?.jogos?.filter((jogo) => jogo.encerrado).length ?? 0;

  const statusTexto =
    resultados?.status === "NAO_INICIADO"
      ? "Copa ainda não iniciada"
      : resultados?.status || "Status não informado";

  return (
    <div className="card status-resultados">
      <div>
        <p className="tag">Resultados oficiais</p>
        <h2>{statusTexto}</h2>
        <p>
          O site já está preparado para carregar{" "}
          <strong>resultados-oficiais.json</strong>.
        </p>
      </div>

      <div className="status-grid">
        <div>
          <span>Jogos oficiais cadastrados</span>
          <strong>{totalJogos}</strong>
        </div>

        <div>
          <span>Jogos encerrados</span>
          <strong>{jogosEncerrados}</strong>
        </div>

        <div>
          <span>Última atualização</span>
          <strong>{resultados?.ultima_atualizacao || "-"}</strong>
        </div>
      </div>
    </div>
  );
}