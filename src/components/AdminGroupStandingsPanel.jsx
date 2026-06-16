import { useMemo, useState } from "react";
import {
  calcularClassificacaoGrupos,
  ORDEM_GRUPOS,
} from "../utils/groupStandingsUtils";
import { gerarChaveamentoDezesseisAvos } from "../utils/knockoutUtils";
import TeamName from "./TeamName";

const FASES_VAZIAS = {
  dezesseis_avos: [],
  oitavas: [],
  quartas: [],
  semifinal: [],
  final: [],
};

const POSICOES_VAZIAS = {
  campeao: null,
  vice: null,
  terceiro: null,
  quarto: null,
};

function dataHojeISO() {
  return new Date().toISOString().slice(0, 10);
}

function classeLinhaTime(time) {
  if (time.classificadoDireto) return "classificado-direto";
  if (time.classificadoTerceiro) return "classificado-terceiro";
  if (time.terceiroEliminado) return "terceiro-eliminado";

  return "";
}

function statusGrupo(quantidadeJogos) {
  if (quantidadeJogos === 6) return "Completo";
  if (quantidadeJogos === 0) return "Aguardando";

  return `${quantidadeJogos}/6 jogos`;
}

function GrupoTabela({ grupo, times, jogosCadastrados }) {
  return (
    <div className="admin-grupo-tabela">
      <div className="admin-grupo-tabela-top">
        <div>
          <span>Grupo {grupo}</span>
          <strong>{statusGrupo(jogosCadastrados)}</strong>
        </div>
      </div>

      <div className="admin-grupo-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Pos</th>
              <th>Seleção</th>
              <th>Pts</th>
              <th>J</th>
              <th>V</th>
              <th>E</th>
              <th>D</th>
              <th>GP</th>
              <th>GC</th>
              <th>SG</th>
            </tr>
          </thead>

          <tbody>
            {times.map((time) => (
              <tr key={time.selecao} className={classeLinhaTime(time)}>
                <td>{time.posicaoGrupo}º</td>
                <td>
                  <TeamName selecao={time.selecao} />
                  {time.desempateManual && (
                    <small className="admin-desempate-alerta">
                      desempate manual
                    </small>
                  )}
                </td>
                <td>
                  <strong>{time.pontos}</strong>
                </td>
                <td>{time.jogos}</td>
                <td>{time.vitorias}</td>
                <td>{time.empates}</td>
                <td>{time.derrotas}</td>
                <td>{time.golsPro}</td>
                <td>{time.golsContra}</td>
                <td>{time.saldo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MelhoresTerceiros({ terceiros }) {
  return (
    <section className="card admin-terceiros-card">
      <div className="tabela-topo">
        <div>
          <p className="tag">Classificação geral</p>
          <h2>Melhores terceiros</h2>
        </div>

        <span>8 classificam</span>
      </div>

      <div className="admin-terceiros-lista">
        {terceiros.map((time) => (
          <div
            key={`${time.grupo}-${time.selecao}`}
            className={
              time.classificadoTerceiro
                ? "admin-terceiro-item classificado"
                : "admin-terceiro-item eliminado"
            }
          >
            <div>
              <span>{time.posicaoTerceiros}º entre terceiros</span>
              <strong>
                <TeamName selecao={time.selecao} />
              </strong>
            </div>

            <div>
              <span>Grupo {time.grupo}</span>
              <strong>{time.pontos} pts</strong>
              <small>
                SG {time.saldo} · GP {time.golsPro}
              </small>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ChaveamentoPreview({ chaveamento }) {
  return (
    <section className="card admin-chaveamento-card">
      <div className="tabela-topo">
        <div>
          <p className="tag">Chaveamento</p>
          <h2>Prévia dos 16 avos</h2>
        </div>

        <span>{chaveamento.completo ? "Pronto para aplicar" : "Incompleto"}</span>
      </div>

      {chaveamento.erros.length > 0 && (
        <div className="admin-chaveamento-alerta">
          <strong>Atenção</strong>
          <span>
            Ainda não foi possível montar todos os confrontos. Confira se todos
            os grupos estão completos e se os oito terceiros foram calculados.
          </span>
        </div>
      )}

      <div className="admin-chaveamento-grid">
        {chaveamento.jogos.map((jogo) => (
          <div key={jogo.jogo} className="admin-chaveamento-jogo">
            <div className="admin-chaveamento-top">
              <span>Jogo {jogo.jogo}</span>
              <strong>
                {jogo.slot_a} x {jogo.slot_b}
              </strong>
            </div>

            <div className="admin-chaveamento-times">
              <TeamName selecao={jogo.selecao_a} />
              <strong>x</strong>
              <TeamName selecao={jogo.selecao_b} />
            </div>

            {jogo.grupo_terceiro && (
              <small>Terceiro encaixado: Grupo {jogo.grupo_terceiro}</small>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export default function AdminGroupStandingsPanel({
  participantes,
  resultadosOficiais,
  onAtualizarResultados,
}) {
  const [grupoAtual, setGrupoAtual] = useState("A");
  const [mensagem, setMensagem] = useState(null);

  const jogosBase = useMemo(() => {
    return participantes?.[0]?.jogos || [];
  }, [participantes]);

  const dados = useMemo(() => {
    return calcularClassificacaoGrupos(jogosBase, resultadosOficiais);
  }, [jogosBase, resultadosOficiais]);

  const chaveamento = useMemo(() => {
    return gerarChaveamentoDezesseisAvos(dados);
  }, [dados]);

  const jogosPorGrupo = useMemo(() => {
    return ORDEM_GRUPOS.reduce((mapa, grupo) => {
      mapa[grupo] = (resultadosOficiais?.jogos || []).filter(
        (jogo) =>
          jogo.fase === "grupos" &&
          jogo.encerrado &&
          dados.grupos[grupo]?.some((time) => time.selecao === jogo.selecao_a)
      ).length;

      return mapa;
    }, {});
  }, [resultadosOficiais, dados.grupos]);

  const grupoSelecionado = dados.grupos[grupoAtual] || [];

  function aplicarClassificados16Avos() {
    if (!dados.resumo.todosJogosGrupoEncerrados) {
      setMensagem({
        tipo: "erro",
        texto:
          "Para aplicar automaticamente os classificados dos 16 avos, todos os 72 jogos da fase de grupos precisam estar cadastrados.",
      });

      return;
    }

    const confirmar = window.confirm(
      "Aplicar os 32 classificados aos 16 avos? Isso vai atualizar a fase 16 avos e zerar as fases seguintes para evitar inconsistência."
    );

    if (!confirmar) return;

    const novosResultados = {
      ...(resultadosOficiais || {}),
      status: "EM_ANDAMENTO",
      ultima_atualizacao: dataHojeISO(),
      jogos: resultadosOficiais?.jogos || [],
      fases_oficiais: {
        ...FASES_VAZIAS,
        ...(resultadosOficiais?.fases_oficiais || {}),
        dezesseis_avos: dados.classificadosDezesseisAvos,
        oitavas: [],
        quartas: [],
        semifinal: [],
        final: [],
      },
      posicoes_finais_oficiais: {
        ...POSICOES_VAZIAS,
        ...(resultadosOficiais?.posicoes_finais_oficiais || {}),
      },
    };

    onAtualizarResultados(novosResultados);

    setMensagem({
      tipo: "sucesso",
      texto:
        "Classificados dos 16 avos aplicados automaticamente. O ranking foi recalculado.",
    });
  }

  function aplicarChaveamento16Avos() {
    if (!dados.resumo.todosJogosGrupoEncerrados) {
      setMensagem({
        tipo: "erro",
        texto:
          "Para gerar o chaveamento, todos os 72 jogos da fase de grupos precisam estar cadastrados.",
      });

      return;
    }

    if (!chaveamento.completo) {
      setMensagem({
        tipo: "erro",
        texto:
          "O chaveamento ainda está incompleto. Confira a classificação dos grupos e os melhores terceiros.",
      });

      return;
    }

    const confirmar = window.confirm(
      "Gerar os confrontos oficiais dos jogos 73 a 88? Isso removerá resultados de mata-mata já cadastrados, se existirem, para evitar confrontos inconsistentes."
    );

    if (!confirmar) return;

    const jogosGrupos = (resultadosOficiais?.jogos || []).filter(
      (jogo) => Number(jogo.jogo) <= 72
    );

    const novosResultados = {
      ...(resultadosOficiais || {}),
      status: "EM_ANDAMENTO",
      ultima_atualizacao: dataHojeISO(),
      jogos: jogosGrupos,
      fases_oficiais: {
        ...FASES_VAZIAS,
        ...(resultadosOficiais?.fases_oficiais || {}),
        dezesseis_avos: dados.classificadosDezesseisAvos,
        oitavas: [],
        quartas: [],
        semifinal: [],
        final: [],
      },
      posicoes_finais_oficiais: {
        ...POSICOES_VAZIAS,
        campeao: null,
        vice: null,
        terceiro: null,
        quarto: null,
      },
      chaveamento_oficial: {
        ...(resultadosOficiais?.chaveamento_oficial || {}),
        ultima_atualizacao: dataHojeISO(),
        dezesseis_avos: chaveamento.jogos,
        terceiros_por_jogo: chaveamento.terceirosPorJogo,
        observacao:
          "Chaveamento dos jogos 73 a 88 gerado automaticamente a partir da classificação dos grupos.",
      },
    };

    onAtualizarResultados(novosResultados);

    setMensagem({
      tipo: "sucesso",
      texto:
        "Chaveamento dos 16 avos gerado. Agora os confrontos aparecem em Admin > Placares.",
    });
  }

  function zerarChaveamento16Avos() {
    const confirmar = window.confirm(
      "Deseja apagar o chaveamento dos jogos 73 a 88? Isso também removerá resultados de mata-mata já cadastrados."
    );

    if (!confirmar) return;

    const jogosGrupos = (resultadosOficiais?.jogos || []).filter(
      (jogo) => Number(jogo.jogo) <= 72
    );

    const novosResultados = {
      ...(resultadosOficiais || {}),
      status: resultadosOficiais?.status || "EM_ANDAMENTO",
      ultima_atualizacao: dataHojeISO(),
      jogos: jogosGrupos,
      fases_oficiais: {
        ...FASES_VAZIAS,
        ...(resultadosOficiais?.fases_oficiais || {}),
        dezesseis_avos: [],
        oitavas: [],
        quartas: [],
        semifinal: [],
        final: [],
      },
      posicoes_finais_oficiais: {
        ...POSICOES_VAZIAS,
      },
      chaveamento_oficial: {
        ...(resultadosOficiais?.chaveamento_oficial || {}),
        dezesseis_avos: [],
        terceiros_por_jogo: {},
        ultima_atualizacao: dataHojeISO(),
      },
    };

    onAtualizarResultados(novosResultados);

    setMensagem({
      tipo: "sucesso",
      texto: "Chaveamento dos 16 avos zerado.",
    });
  }

  return (
    <div className="admin-grupos-pro">
      <section className="card admin-grupos-hero">
        <div>
          <p className="tag">Administração</p>
          <h2>Classificação dos grupos</h2>
          <p>
            O sistema calcula automaticamente a tabela dos grupos com base nos
            placares cadastrados. Ao final da fase de grupos, ele identifica os
            24 classificados diretos, os 8 melhores terceiros e monta os jogos
            73 a 88.
          </p>
        </div>

        <div className="admin-grupos-stats">
          <div>
            <span>Jogos de grupos</span>
            <strong>
              {dados.resumo.jogosGrupoCadastrados}/
              {dados.resumo.jogosGrupoEsperados}
            </strong>
          </div>

          <div>
            <span>Grupos completos</span>
            <strong>
              {dados.resumo.gruposCompletos}/{dados.resumo.totalGrupos}
            </strong>
          </div>

          <div>
            <span>Classificados</span>
            <strong>{dados.classificadosDezesseisAvos.length}</strong>
          </div>
        </div>
      </section>

      <section className="card admin-grupos-section">
        <div className="admin-grupos-tabs">
          {ORDEM_GRUPOS.map((grupo) => (
            <button
              key={grupo}
              type="button"
              className={grupoAtual === grupo ? "ativo" : ""}
              onClick={() => {
                setGrupoAtual(grupo);
                setMensagem(null);
              }}
            >
              Grupo {grupo}
              <small>{statusGrupo(jogosPorGrupo[grupo] || 0)}</small>
            </button>
          ))}
        </div>

        <GrupoTabela
          grupo={grupoAtual}
          times={grupoSelecionado}
          jogosCadastrados={jogosPorGrupo[grupoAtual] || 0}
        />
      </section>

      <MelhoresTerceiros terceiros={dados.melhoresTerceiros} />

      <ChaveamentoPreview chaveamento={chaveamento} />

      <section className="card admin-grupos-actions-card">
        <div>
          <p className="tag">Aplicação automática</p>
          <h2>Classificados e chaveamento</h2>
          <p>
            Quando todos os jogos da fase de grupos estiverem cadastrados, o
            sistema pode preencher os 32 classificados e montar os confrontos
            dos jogos 73 a 88.
          </p>
        </div>

        {mensagem && (
          <div className={`admin-mensagem ${mensagem.tipo}`}>
            {mensagem.texto}
          </div>
        )}

        <div className="admin-actions">
          <button
            type="button"
            className="admin-primary"
            onClick={aplicarClassificados16Avos}
            disabled={!dados.resumo.todosJogosGrupoEncerrados}
          >
            Aplicar classificados dos 16 avos
          </button>

          <button
            type="button"
            className="admin-primary"
            onClick={aplicarChaveamento16Avos}
            disabled={
              !dados.resumo.todosJogosGrupoEncerrados || !chaveamento.completo
            }
          >
            Gerar chaveamento dos 16 avos
          </button>

          <button type="button" onClick={zerarChaveamento16Avos}>
            Zerar chaveamento
          </button>
        </div>

        {!dados.resumo.todosJogosGrupoEncerrados && (
          <p className="admin-grupos-nota">
            Para liberar a aplicação automática, cadastre todos os jogos da fase
            de grupos em <strong>Admin &gt; Placares</strong>.
          </p>
        )}
      </section>
    </div>
  );
}