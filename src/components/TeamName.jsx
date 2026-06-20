import { getSelecaoInfo } from "../utils/teamUtils";

export default function TeamName({ selecao, mostrarOriginal = false }) {
  const info = getSelecaoInfo(selecao);

  if (!info) {
    return <span className="team-name muted">-</span>;
  }

  const nomeExibido = info.nomePt;
  const titulo =
    mostrarOriginal && info.nomeOriginal !== info.nomePt
      ? `${info.nomePt} — ${info.nomeOriginal}`
      : info.nomePt;

  return (
    <span className="team-name" title={titulo}>
      {info.emoji && (
        <span className="team-flag emoji" aria-hidden="true">
          {info.emoji}
        </span>
      )}

      <span>{nomeExibido}</span>
    </span>
  );
}
