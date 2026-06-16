import { useState } from "react";
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
  const [erroImagem, setErroImagem] = useState(false);
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
      {info.bandeiraUrl && !erroImagem ? (
        <img
          className="team-flag"
          src={info.bandeiraUrl}
          alt=""
          loading="lazy"
          onError={() => setErroImagem(true)}
        />
      ) : (
        <span className="team-flag-fallback">
          {siglaFallback(info.nomePt)}
        </span>
      )}

      <span>{nomeExibido}</span>
    </span>
  );
}