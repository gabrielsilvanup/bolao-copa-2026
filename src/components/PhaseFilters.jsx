import { FASES } from "../utils/gameUtils";

export default function PhaseFilters({ faseSelecionada, onSelecionarFase }) {
  return (
    <div className="card filtros">
      {FASES.map((fase) => (
        <button
          key={fase.valor}
          className={faseSelecionada === fase.valor ? "filtro ativo" : "filtro"}
          onClick={() => onSelecionarFase(fase.valor)}
        >
          {fase.label}
        </button>
      ))}
    </div>
  );
}