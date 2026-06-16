import { useEffect, useMemo, useState } from "react";
import "./index.css";

import AdminArea from "./components/AdminArea";
import GamesTable from "./components/GamesTable";
import Header from "./components/Header";
import NavigationTabs from "./components/NavigationTabs";
import OfficialResults from "./components/OfficialResults";
import ParticipantDetails from "./components/ParticipantDetails";
import ParticipantList from "./components/ParticipantList";
import PhaseFilters from "./components/PhaseFilters";
import PrizeDistribution from "./components/PrizeDistribution";
import RankingTable from "./components/RankingTable";
import ResultsStatus from "./components/ResultsStatus";
import RulesAndPrizes from "./components/RulesAndPrizes";
import ParticipantOverview from "./components/ParticipantOverview";

const STORAGE_KEY = "bolao-copa-2026-resultados-oficiais";

export default function App() {
  const [participantes, setParticipantes] = useState([]);
  const [resultadosOficiais, setResultadosOficiais] = useState(null);
  const [participanteSelecionado, setParticipanteSelecionado] = useState(null);
  const [busca, setBusca] = useState("");
  const [faseSelecionada, setFaseSelecionada] = useState("todos");
  const [abaAtual, setAbaAtual] = useState("resumo");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregarDados() {
      try {
        const [respostaPalpites, respostaResultados] = await Promise.all([
          fetch("/data/palpites-copa-2026.json"),
          fetch("/data/resultados-oficiais.json"),
        ]);

        if (!respostaPalpites.ok) {
          throw new Error("Não foi possível carregar o JSON de palpites.");
        }

        if (!respostaResultados.ok) {
          throw new Error(
            "Não foi possível carregar o JSON de resultados oficiais."
          );
        }

        const dadosPalpites = await respostaPalpites.json();
        const dadosResultados = await respostaResultados.json();

        let resultadosIniciais = dadosResultados;

        const resultadosSalvos = localStorage.getItem(STORAGE_KEY);

        if (resultadosSalvos) {
          try {
            resultadosIniciais = JSON.parse(resultadosSalvos);
          } catch {
            localStorage.removeItem(STORAGE_KEY);
          }
        }

        setParticipantes(dadosPalpites);
        setResultadosOficiais(resultadosIniciais);
        setParticipanteSelecionado(dadosPalpites[0] || null);
      } catch (error) {
        setErro(error.message);
      } finally {
        setCarregando(false);
      }
    }

    carregarDados();
  }, []);

  useEffect(() => {
    window.requestAnimationFrame(() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
  }, [abaAtual]);

  const participantesFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    if (!termo) return participantes;

    return participantes.filter((item) =>
      item.participante.toLowerCase().includes(termo)
    );
  }, [participantes, busca]);

  const jogosFiltrados = useMemo(() => {
    if (!participanteSelecionado) return [];

    if (faseSelecionada === "todos") {
      return participanteSelecionado.jogos;
    }

    return participanteSelecionado.jogos.filter(
      (jogo) => jogo.fase === faseSelecionada
    );
  }, [participanteSelecionado, faseSelecionada]);

  const totalJogosOficiais = resultadosOficiais?.jogos?.length ?? 0;

  const jogosEncerrados =
    resultadosOficiais?.jogos?.filter((jogo) => jogo.encerrado).length ?? 0;

  function selecionarParticipante(participante) {
    setParticipanteSelecionado(participante);
    setFaseSelecionada("todos");
  }

  function selecionarParticipantePeloRanking(participante) {
    selecionarParticipante(participante);
    setAbaAtual("participantes");
  }

  function atualizarResultadosOficiais(novosResultados) {
    setResultadosOficiais(novosResultados);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(novosResultados, null, 2));
  }

  function limparResultadosSalvos() {
    const confirmar = window.confirm(
      "Tem certeza que deseja apagar os resultados salvos no navegador? O site voltará a usar o arquivo resultados-oficiais.json original."
    );

    if (!confirmar) return;

    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  }

  if (carregando) {
    return (
      <main className="page">
        <div className="card centralizado">
          <h1>Bolão da Copa 2026</h1>
          <p>Carregando bases do site...</p>
        </div>
      </main>
    );
  }

  if (erro) {
    return (
      <main className="page">
        <div className="card centralizado">
          <h1>Bolão da Copa 2026</h1>
          <p className="erro">{erro}</p>
          <p>
            Confira se os arquivos estão em <strong>public/data</strong>.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <Header totalParticipantes={participantes.length} />

      <NavigationTabs abaAtual={abaAtual} onSelecionarAba={setAbaAtual} />

      {abaAtual === "resumo" && (
        <section className="aba-conteudo">
          <ResultsStatus resultados={resultadosOficiais} />

          <div className="home-grid">
            <div className="card home-card destaque">
              <p className="tag">Visão geral</p>
              <h2>Bolão em andamento</h2>
              <p>
                Acompanhe a pontuação dos participantes, os palpites, os
                resultados oficiais e a premiação.
              </p>
            </div>

            <div className="card home-card">
              <span>Participantes</span>
              <strong>{participantes.length}</strong>
            </div>

            <div className="card home-card">
              <span>Jogos oficiais cadastrados</span>
              <strong>{totalJogosOficiais}</strong>
            </div>

            <div className="card home-card">
              <span>Jogos encerrados</span>
              <strong>{jogosEncerrados}</strong>
            </div>
          </div>

          <RankingTable
            participantes={participantes}
            resultadosOficiais={resultadosOficiais}
            onSelecionarParticipante={selecionarParticipantePeloRanking}
          />
        </section>
      )}

      {abaAtual === "ranking" && (
        <section className="aba-conteudo">
          <RankingTable
            participantes={participantes}
            resultadosOficiais={resultadosOficiais}
            onSelecionarParticipante={selecionarParticipantePeloRanking}
          />
        </section>
      )}

      {abaAtual === "participantes" && (
        <section className="layout">
          <ParticipantList
            participantes={participantesFiltrados}
            todosParticipantes={participantes}
            participanteSelecionado={participanteSelecionado}
            busca={busca}
            onBuscaChange={setBusca}
            onSelecionarParticipante={selecionarParticipante}
            resultadosOficiais={resultadosOficiais}
          />

          <section className="conteudo">
            <ParticipantOverview
              participante={participanteSelecionado}
              participantes={participantes}
              resultadosOficiais={resultadosOficiais}
            />
          </section>
        </section>
      )}

      {abaAtual === "palpites" && (
        <section className="layout">
          <ParticipantList
            participantes={participantesFiltrados}
            todosParticipantes={participantes}
            participanteSelecionado={participanteSelecionado}
            busca={busca}
            onBuscaChange={setBusca}
            onSelecionarParticipante={selecionarParticipante}
            resultadosOficiais={resultadosOficiais}
          />

          <section className="conteudo">
            <ParticipantDetails participante={participanteSelecionado} />

            <PhaseFilters
              faseSelecionada={faseSelecionada}
              onSelecionarFase={setFaseSelecionada}
            />

            <GamesTable
              jogos={jogosFiltrados}
              resultadosOficiais={resultadosOficiais}
            />
          </section>
        </section>
      )}

      {abaAtual === "resultados" && (
        <section className="aba-conteudo">
          <OfficialResults resultadosOficiais={resultadosOficiais} />
        </section>
      )}

      {abaAtual === "admin" && (
        <AdminArea
          participantes={participantes}
          resultadosOficiais={resultadosOficiais}
          onAtualizarResultados={atualizarResultadosOficiais}
          onLimparResultadosSalvos={limparResultadosSalvos}
        />
      )}

      {abaAtual === "regras" && (
        <section className="aba-conteudo">
          <RulesAndPrizes />

          <PrizeDistribution
            participantes={participantes}
            resultadosOficiais={resultadosOficiais}
          />
        </section>
      )}
    </main>
  );
}