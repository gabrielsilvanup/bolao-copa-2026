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

const APELIDOS_SELECOES = {
  Alemanha: "Germany",
  "África do Sul": "South Africa",
  Argélia: "Algeria",
  Argentina: "Argentina",
  "Arábia Saudita": "Saudi Arabia",
  Austrália: "Australia",
  Áustria: "Austria",
  Bélgica: "Belgium",
  Brasil: "Brazil",
  "Bósnia e Herzegovina": "Bosnia/Herzeg.",
  "Cabo Verde": "Cape Verde",
  Canadá: "Canada",
  Catar: "Qatar",
  Colômbia: "Colombia",
  "Coreia do Sul": "Rep. of Korea",
  "Costa do Marfim": "Ivory Coast",
  Croácia: "Croatia",
  Curaçau: "Curaçao",
  Egito: "Egypt",
  Equador: "Ecuador",
  Escócia: "Scotland",
  Espanha: "Spain",
  "Estados Unidos": "USA",
  França: "France",
  Gana: "Ghana",
  Haiti: "Haiti",
  Holanda: "Netherlands",
  Inglaterra: "England",
  Irã: "IR Iran",
  Iraque: "Iraq",
  Japão: "Japan",
  Jordânia: "Jordan",
  Marrocos: "Morocco",
  México: "Mexico",
  Noruega: "Norway",
  "Nova Zelândia": "New Zealand",
  Panamá: "Panama",
  Paraguai: "Paraguay",
  Portugal: "Portugal",
  "República da Coreia": "Rep. of Korea",
  "República Democrática do Congo": "DR Congo",
  Senegal: "Senegal",
  Suécia: "Sweden",
  Suíça: "Switzerland",
  Tchéquia: "Czech Rep.",
  Tunísia: "Tunisia",
  Turquia: "Turkey",
  Uruguai: "Uruguay",
  Uzbequistão: "Uzbekistan",
};

function emojiBandeira(codigo) {
  if (!codigo) return null;

  const excecoes = {
    "gb-eng": "\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}",
    "gb-sct": "\u{1F3F4}\u{E0067}\u{E0062}\u{E0073}\u{E0063}\u{E0074}\u{E007F}",
  };

  if (excecoes[codigo]) return excecoes[codigo];

  if (!/^[a-z]{2}$/.test(codigo)) return null;

  return codigo
    .toUpperCase()
    .split("")
    .map((letra) => String.fromCodePoint(letra.charCodeAt(0) + 127397))
    .join("");
}

export function getSelecaoInfo(selecao) {
  if (!selecao || selecao === "Não preenchido" || selecao === "EMPATE") {
    return null;
  }

  const nomeOriginal = String(selecao).trim();
  const chave = APELIDOS_SELECOES[nomeOriginal] || nomeOriginal;
  const info = SELECOES[chave];

  if (!info) {
    return {
      nomeOriginal,
      nomePt: nomeOriginal,
      codigo: null,
      emoji: null,
      bandeiraUrl: null,
    };
  }

  return {
    nomeOriginal,
    nomePt: info.nomePt,
    codigo: info.codigo,
    emoji: emojiBandeira(info.codigo),
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
