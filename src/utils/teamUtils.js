const SELECOES = {
  Mexico: { codigo: "mx", nomePt: "México" },
  "South Africa": { codigo: "za", nomePt: "África do Sul" },
  "Rep. of Korea": { codigo: "kr", nomePt: "Coreia do Sul" },
  "South Korea": { codigo: "kr", nomePt: "Coreia do Sul" },
  "Czech Rep.": { codigo: "cz", nomePt: "Tchéquia" },
  Czechia: { codigo: "cz", nomePt: "Tchéquia" },

  Canada: { codigo: "ca", nomePt: "Canadá" },
  "Bosnia/Herzeg.": {
    codigo: "ba",
    nomePt: "Bósnia e Herzegovina",
  },
  "Bosnia and Herzegovina": {
    codigo: "ba",
    nomePt: "Bósnia e Herzegovina",
  },
  Qatar: { codigo: "qa", nomePt: "Catar" },
  Switzerland: { codigo: "ch", nomePt: "Suíça" },

  Brazil: { codigo: "br", nomePt: "Brasil" },
  Morocco: { codigo: "ma", nomePt: "Marrocos" },
  Haiti: { codigo: "ht", nomePt: "Haiti" },
  Scotland: { codigo: "gb-sct", nomePt: "Escócia" },

  USA: { codigo: "us", nomePt: "Estados Unidos" },
  "United States": { codigo: "us", nomePt: "Estados Unidos" },
  Paraguay: { codigo: "py", nomePt: "Paraguai" },
  Australia: { codigo: "au", nomePt: "Austrália" },
  Turkey: { codigo: "tr", nomePt: "Turquia" },

  Germany: { codigo: "de", nomePt: "Alemanha" },
  "Curaçao": { codigo: "cw", nomePt: "Curaçao" },
  Curacao: { codigo: "cw", nomePt: "Curaçao" },
  "Ivory Coast": { codigo: "ci", nomePt: "Costa do Marfim" },
  Ecuador: { codigo: "ec", nomePt: "Equador" },

  Netherlands: { codigo: "nl", nomePt: "Países Baixos" },
  Japan: { codigo: "jp", nomePt: "Japão" },
  Sweden: { codigo: "se", nomePt: "Suécia" },
  Tunisia: { codigo: "tn", nomePt: "Tunísia" },

  Belgium: { codigo: "be", nomePt: "Bélgica" },
  Egypt: { codigo: "eg", nomePt: "Egito" },
  "IR Iran": { codigo: "ir", nomePt: "Irã" },
  Iran: { codigo: "ir", nomePt: "Irã" },
  "New Zealand": { codigo: "nz", nomePt: "Nova Zelândia" },

  Spain: { codigo: "es", nomePt: "Espanha" },
  "Cape Verde": { codigo: "cv", nomePt: "Cabo Verde" },
  "Saudi Arabia": { codigo: "sa", nomePt: "Arábia Saudita" },
  Uruguay: { codigo: "uy", nomePt: "Uruguai" },

  France: { codigo: "fr", nomePt: "França" },
  Senegal: { codigo: "sn", nomePt: "Senegal" },
  Iraq: { codigo: "iq", nomePt: "Iraque" },
  Norway: { codigo: "no", nomePt: "Noruega" },

  Argentina: { codigo: "ar", nomePt: "Argentina" },
  Algeria: { codigo: "dz", nomePt: "Argélia" },
  Austria: { codigo: "at", nomePt: "Áustria" },
  Jordan: { codigo: "jo", nomePt: "Jordânia" },

  Portugal: { codigo: "pt", nomePt: "Portugal" },
  "DR Congo": { codigo: "cd", nomePt: "RD Congo" },
  Uzbekistan: { codigo: "uz", nomePt: "Uzbequistão" },
  Colombia: { codigo: "co", nomePt: "Colômbia" },

  England: { codigo: "gb-eng", nomePt: "Inglaterra" },
  Croatia: { codigo: "hr", nomePt: "Croácia" },
  Ghana: { codigo: "gh", nomePt: "Gana" },
  Panama: { codigo: "pa", nomePt: "Panamá" },
};

export function getSelecaoInfo(selecao) {
  if (!selecao || selecao === "Não preenchido" || selecao === "EMPATE") {
    return null;
  }

  const nomeOriginal = String(selecao).trim();
  const info = SELECOES[nomeOriginal];

  if (!info) {
    return {
      nomeOriginal,
      nomePt: nomeOriginal,
      codigo: null,
      bandeiraUrl: null,
    };
  }

  return {
    nomeOriginal,
    nomePt: info.nomePt,
    codigo: info.codigo,
    bandeiraUrl: `https://flagcdn.com/w40/${info.codigo}.png`,
  };
}

export function formatarSelecao(selecao) {
  const info = getSelecaoInfo(selecao);

  if (!info) return "-";

  return info.nomePt;
}

export function formatarSelecaoComOriginal(selecao) {
  const info = getSelecaoInfo(selecao);

  if (!info) return "-";

  if (info.nomeOriginal === info.nomePt) {
    return info.nomePt;
  }

  return `${info.nomePt} (${info.nomeOriginal})`;
}