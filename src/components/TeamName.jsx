import { getSelecaoInfo } from "../utils/teamUtils";

function siglaFallback(nome) {
  if (!nome) return "-";

  return nome
    .split(" ")
    .map((parte) => parte[0])
    .join("")
    .replace(".", "")
    .slice(0, 3)
    .toUpperCase();
}

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
      {info.emoji ? (
        <span className="team-flag emoji" aria-hidden="true">
          {info.emoji}
        </span>
      ) : (
        <span className="team-flag-fallback">
          {siglaFallback(info.nomePt)}
        </span>
      )}

      <span>{nomeExibido}</span>
    </span>
  );
}
