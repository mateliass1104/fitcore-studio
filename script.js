/* =========================================================
   FitCore Studio — lógica do app
   Sumário: 1. Datas  2. Dados de exemplo  3. Estado
            4. Funções auxiliares  5. Login  6. Tela do aluno
            7. Tela do personal  8. Eventos
   ========================================================= */

/* ---------- 1. Datas ---------- */
const DIA_MS = 24 * 60 * 60 * 1000;
const LETRAS_DIA = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

const hoje = new Date();
hoje.setHours(12, 0, 0, 0);

const paraISO = (data) => new Date(data).toISOString().slice(0, 10);
const diasAtras = (n) => paraISO(hoje - n * DIA_MS);

/* ---------- 2. Dados de exemplo (fictícios) ---------- */
/* Campos do aluno: pi = peso inicial, pa = peso atual, pm = peso meta.
   Campos do exercício: n = nome, s = séries, r = repetições,
   c = carga em kg, d = dica de execução. */
function criarDadosIniciais() {
  return {
    v: 1,
    perfil: 'aluno',
    aluno: null,
    done: {},
    alunos: [
      {
        id: 1,
        nome: 'Ana Souza',
        obj: 'Emagrecimento',
        pers: 'Marcos',
        pi: 78, pa: 73.5, pm: 68,
        pesos: [78, 77, 76, 75, 74.5, 73.5],
        freq: [diasAtras(1), diasAtras(2), diasAtras(4), diasAtras(5), diasAtras(8), diasAtras(9)],
        ex: [
          { n: 'Agachamento com halter', s: 3, r: 12, c: 14, d: 'Joelhos alinhados com os pés; desça até 90°.' },
          { n: 'Remada curvada', s: 3, r: 12, c: 10, d: 'Coluna neutra, puxe o cotovelo ao quadril.' },
          { n: 'Prancha', s: 3, r: '40s', c: 0, d: 'Quadril alinhado, abdômen firme.' }
        ]
      },
      {
        id: 2,
        nome: 'Bruno Lima',
        obj: 'Reabilitação do joelho',
        pers: 'Juliana',
        pi: 90, pa: 89, pm: 86,
        pesos: [90, 90, 89.5, 89.5, 89, 89],
        freq: [diasAtras(1), diasAtras(3), diasAtras(5), diasAtras(7)],
        ex: [
          { n: 'Leg press 45°', s: 3, r: 15, c: 60, d: 'Não estenda totalmente o joelho.' },
          { n: 'Cadeira flexora', s: 3, r: 12, c: 25, d: 'Movimento lento na volta.' },
          { n: 'Ponte de glúteo', s: 3, r: 15, c: 0, d: 'Segure 2s no topo.' }
        ]
      },
      {
        id: 3,
        nome: 'Carla Dias',
        obj: 'Treino funcional',
        pers: 'Marcos',
        pi: 62, pa: 62, pm: 62,
        pesos: [62, 62, 62, 62, 62, 62],
        freq: [diasAtras(12), diasAtras(15)],
        ex: [
          { n: 'Kettlebell swing', s: 4, r: 15, c: 12, d: 'Força vem do quadril, não dos braços.' },
          { n: 'Burpee', s: 3, r: 10, c: 0, d: 'Ritmo constante.' },
          { n: 'Afundo alternado', s: 3, r: 12, c: 10, d: 'Passada longa, tronco ereto.' }
        ]
      },
      {
        id: 4,
        nome: 'Diego Rocha',
        obj: 'Alta performance',
        pers: 'Rafael',
        pi: 80, pa: 82, pm: 84,
        pesos: [80, 80.5, 81, 81.5, 82, 82],
        freq: [diasAtras(0), diasAtras(1), diasAtras(2), diasAtras(3), diasAtras(5)],
        ex: [
          { n: 'Supino reto', s: 4, r: 8, c: 50, d: 'Escápulas travadas no banco.' },
          { n: 'Levantamento terra', s: 4, r: 6, c: 90, d: 'Barra rente às pernas.' },
          { n: 'Barra fixa', s: 3, r: 8, c: 0, d: 'Descida controlada em 3s.' }
        ]
      }
    ]
  };
}

/* ---------- 3. Estado (salvo no navegador) ---------- */
let estado;

try {
  estado = JSON.parse(localStorage.getItem('fitcore') || 'null');
} catch (erro) {
  estado = null;
}

if (!estado || estado.v !== 1) {
  estado = criarDadosIniciais();
}

function salvar() {
  try {
    localStorage.setItem('fitcore', JSON.stringify(estado));
  } catch (erro) {
    /* sem armazenamento disponível: o app continua funcionando */
  }
}

/* ---------- 4. Funções auxiliares ---------- */
const alunoAtual = () => estado.alunos.find((a) => a.id == estado.aluno);

/* Treinos nos últimos 7 dias */
const treinosNaSemana = (aluno) => aluno.freq.filter((d) => d >= diasAtras(6)).length;

/* Dias desde o último treino (99 = nunca treinou) */
function diasDesdeUltimoTreino(aluno) {
  if (!aluno.freq.length) return 99;
  const datas = aluno.freq.map((d) => +new Date(d + 'T12:00'));
  return Math.round((hoje - new Date(Math.max(...datas))) / DIA_MS);
}

/* Evita que texto digitado vire código HTML */
function escapar(texto) {
  const mapa = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
  return String(texto).replace(/[&<>"]/g, (c) => mapa[c]);
}

/* Tira acentos e maiúsculas para comparar nomes */
function normalizar(texto) {
  return String(texto).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

/* Gráfico de linha em SVG */
function desenharGrafico(valores) {
  const largura = 300;
  const altura = 90;
  const min = Math.min(...valores) - 1;
  const max = Math.max(...valores) + 1;

  const pontos = valores
    .map((y, i) => {
      const px = 10 + (i * (largura - 20)) / (valores.length - 1);
      const py = altura - 8 - ((y - min) / (max - min)) * (altura - 16);
      return px + ',' + py;
    })
    .join(' ');

  return `
    <svg viewBox="0 0 ${largura} ${altura}" role="img"
         aria-label="Peso nas últimas ${valores.length} semanas: de ${valores[0]} kg para ${valores.at(-1)} kg"
         style="width:100%;max-width:420px">
      <polyline points="${pontos}" fill="none" stroke="var(--acc)" stroke-width="3"/>
    </svg>`;
}

/* ---------- 5. Login pelo nome ---------- */
function entrar() {
  const digitado = normalizar(document.getElementById('nome').value);
  const erro = document.getElementById('erro');

  if (digitado.length < 2) {
    erro.textContent = 'Digite seu nome para entrar.';
    return;
  }

  /* Procura: nome completo, depois primeiro nome, depois trecho do nome */
  const lista = estado.alunos;
  const achado =
    lista.find((a) => normalizar(a.nome) === digitado) ||
    lista.find((a) => normalizar(a.nome).split(' ')[0] === digitado) ||
    lista.find((a) => normalizar(a.nome).includes(digitado));

  if (!achado) {
    erro.textContent = 'Não encontramos esse nome. Confira a escrita ou peça ao seu personal para cadastrar você.';
    return;
  }

  estado.aluno = achado.id;
  salvar();
  desenhar();
}

/* ---------- 6. Tela do aluno ---------- */
function telaAluno() {
  const aluno = alunoAtual();

  const campoNome = `
    <label for="nome" class="mut">Digite seu nome</label>
    <div class="row" style="margin:6px 0 4px">
      <input id="nome" type="text" autocomplete="off" placeholder="Ex.: Ana Souza"
             value="${aluno ? escapar(aluno.nome) : ''}" style="flex:1;min-width:180px">
      <button class="btn" id="entrar">Entrar</button>
    </div>
    <div id="erro" role="alert" style="color:var(--acc);font-weight:600;min-height:22px"></div>`;

  /* Ninguém logado: mostra só o campo de nome */
  if (!aluno) {
    return `
      <section>
        ${campoNome}
        <p class="mut">Para testar, use um destes nomes: Ana, Bruno, Carla ou Diego.</p>
      </section>`;
  }

  const jaTreinouHoje = aluno.freq.includes(paraISO(hoje));
  const todasSeries = aluno.ex.every((e, i) => (estado.done[aluno.id + '_' + i] || 0) >= e.s);
  const progresso = Math.max(0, Math.min(100, Math.round(((aluno.pi - aluno.pa) / (aluno.pi - aluno.pm)) * 100)));

  /* Faixa dos últimos 7 dias */
  let semana = '';
  for (let i = 6; i >= 0; i--) {
    const dia = new Date(hoje - i * DIA_MS);
    const treinou = aluno.freq.includes(paraISO(dia)) ? ' on' : '';
    const ehHoje = i === 0 ? ' today' : '';
    semana += `<div class="day${treinou}${ehHoje}">${LETRAS_DIA[dia.getDay()]}<br>${dia.getDate()}</div>`;
  }

  /* Lista de exercícios com botões de série */
  const exercicios = aluno.ex
    .map((e, i) => {
      const feitas = estado.done[aluno.id + '_' + i] || 0;
      const series = Array.from({ length: e.s }, (_, k) => `
        <button class="set" data-e="${i}" data-k="${k + 1}" aria-pressed="${k < feitas}"
                aria-label="Série ${k + 1} de ${escapar(e.n)}">${k + 1}</button>`).join('');

      return `
        <div class="ex">
          <div>
            <h3>${escapar(e.n)}</h3>
            <div class="mut">${e.s} séries × ${e.r} · ${escapar(e.d)}</div>
          </div>
          <div class="load">${e.c ? e.c + ' kg' : 'Peso do corpo'}</div>
          <div class="sets">${series}</div>
        </div>`;
    })
    .join('');

  return `
    <section>
      ${campoNome}
      <h2 style="margin-top:12px">Olá, ${escapar(aluno.nome.split(' ')[0])}. Você treinou ${treinosNaSemana(aluno)}x nos últimos 7 dias.</h2>
      <div class="week" role="list" aria-label="Frequência da semana">${semana}</div>
    </section>

    <section>
      <h2>Treino de hoje</h2>
      <p class="mut">Objetivo: ${escapar(aluno.obj)} · Personal: ${escapar(aluno.pers)}. Toque em cada série ao concluir.</p>
      ${exercicios}
      <p>
        <button class="btn" id="fin" ${todasSeries && !jaTreinouHoje ? '' : 'disabled'}>
          ${jaTreinouHoje ? 'Treino de hoje registrado' : 'Finalizar treino'}
        </button>
      </p>
      <div id="msg" role="status"></div>
    </section>

    <section>
      <h2>Sua evolução</h2>
      <p class="mut">Peso: ${aluno.pi} kg → ${aluno.pa} kg · meta ${aluno.pm} kg (${progresso}% concluído)</p>
      <div class="bar" role="progressbar" aria-valuenow="${progresso}" aria-valuemin="0" aria-valuemax="100">
        <i style="width:${progresso}%"></i>
      </div>
      <p>${desenharGrafico(aluno.pesos)}</p>
    </section>`;
}

/* ---------- 7. Tela do personal ---------- */
function situacao(aluno) {
  const dias = diasDesdeUltimoTreino(aluno);
  if (dias >= 7) return ['c-risk', 'Risco de cancelar'];
  if (dias >= 4) return ['c-warn', 'Atenção'];
  return ['c-ok', 'Em dia'];
}

function telaPersonal() {
  const lista = estado.alunos;
  const cumprimento = Math.round(
    (lista.reduce((soma, a) => soma + Math.min(treinosNaSemana(a), 3), 0) / (lista.length * 3)) * 100
  );
  const emRisco = lista.filter((a) => diasDesdeUltimoTreino(a) >= 7).length;

  const linhas = lista
    .map((a) => {
      const [classe, texto] = situacao(a);
      const dias = diasDesdeUltimoTreino(a);
      return `
        <tr>
          <td>${escapar(a.nome)}</td>
          <td>${escapar(a.pers)}</td>
          <td>${treinosNaSemana(a)}</td>
          <td>${dias > 90 ? '—' : 'há ' + dias + ' d'}</td>
          <td><span class="chip ${classe}">${texto}</span></td>
          <td><button class="link" data-ed="${a.id}">Editar treino</button></td>
        </tr>`;
    })
    .join('');

  return `
    <div class="kpis">
      <div class="kpi"><b>${lista.length}</b>alunos ativos</div>
      <div class="kpi"><b>${cumprimento}%</b>cumprimento da meta de 3 treinos/semana</div>
      <div class="kpi"><b>${emRisco}</b>sem treinar há 7 dias ou mais</div>
    </div>

    <section>
      <h2>Alunos</h2>
      <div class="tw">
        <table>
          <thead>
            <tr>
              <th>Aluno</th><th>Personal</th><th>Treinos (7 dias)</th>
              <th>Último treino</th><th>Situação</th><th></th>
            </tr>
          </thead>
          <tbody>${linhas}</tbody>
        </table>
      </div>
    </section>

    <div id="ed"></div>`;
}

function abrirEditor(id) {
  const aluno = estado.alunos.find((a) => a.id == id);

  const campos = aluno.ex
    .map((e, i) => `
      <div class="row" style="margin-bottom:8px">
        <label style="flex:1;min-width:180px">${escapar(e.n)}</label>
        <input type="number" min="0" step="0.5" value="${e.c}" data-c="${i}"
               aria-label="Carga em kg de ${escapar(e.n)}"> kg
      </div>`)
    .join('');

  document.getElementById('ed').innerHTML = `
    <section>
      <h2>Treino de ${escapar(aluno.nome)}</h2>
      ${campos}
      <p><button class="btn" id="sv" data-id="${id}">Salvar treino</button></p>
      <div id="msg" role="status"></div>
    </section>`;
}

/* ---------- 8. Desenho da página e eventos ---------- */
function desenhar() {
  document.getElementById('tA').setAttribute('aria-pressed', estado.perfil == 'aluno');
  document.getElementById('tP').setAttribute('aria-pressed', estado.perfil == 'personal');
  document.getElementById('app').innerHTML = estado.perfil == 'aluno' ? telaAluno() : telaPersonal();
}

function mostrarMensagem(texto) {
  document.getElementById('msg').textContent = texto;
}

/* Abas Sou aluno / Sou personal */
document.getElementById('tA').onclick = () => { estado.perfil = 'aluno'; salvar(); desenhar(); };
document.getElementById('tP').onclick = () => { estado.perfil = 'personal'; salvar(); desenhar(); };

/* Cliques dentro da área principal */
document.getElementById('app').addEventListener('click', (evento) => {
  const alvo = evento.target;

  /* Botão Entrar */
  if (alvo.id == 'entrar') {
    entrar();

  /* Botão de série: marca ou desmarca */
  } else if (alvo.dataset.k) {
    const chave = alunoAtual().id + '_' + alvo.dataset.e;
    const numero = +alvo.dataset.k;
    estado.done[chave] = (estado.done[chave] || 0) >= numero ? numero - 1 : numero;
    salvar();
    desenhar();

  /* Finalizar treino */
  } else if (alvo.id == 'fin') {
    alunoAtual().freq.push(paraISO(hoje));
    salvar();
    desenhar();
    mostrarMensagem('Treino registrado. Seu personal já vê sua presença.');

  /* Editar treino (personal) */
  } else if (alvo.dataset.ed) {
    abrirEditor(alvo.dataset.ed);

  /* Salvar treino (personal) */
  } else if (alvo.id == 'sv') {
    const aluno = estado.alunos.find((a) => a.id == alvo.dataset.id);
    document.querySelectorAll('[data-c]').forEach((campo) => {
      aluno.ex[+campo.dataset.c].c = +campo.value || 0;
    });
    salvar();
    mostrarMensagem('Treino salvo. O aluno vê a nova carga ao abrir o app.');
  }
});

/* Enter no campo de nome também faz login */
document.getElementById('app').addEventListener('keydown', (evento) => {
  if (evento.key == 'Enter' && evento.target.id == 'nome') entrar();
});

desenhar();