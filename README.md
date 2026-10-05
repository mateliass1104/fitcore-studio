# FitCore Studio — Treino e acompanhamento

Web app desenvolvido para o **Estudo de Caso 2 — Studio FitCore** (Design Profissional, Prof. Sedenilso Antonio Machado).

## 1. Briefing do problema

O Studio FitCore, do educador físico Marcos Vinícius, cresceu de 15 para **80 alunos ativos** com 3 personal trainers contratados. O treino ainda é prescrito em **fichas de papel** e enviado por PDF no WhatsApp. Consequências:

- alunos perdem a ficha e esquecem carga e execução nos dias sem personal;
- professores gastam horas montando fichas manuais;
- há cancelamentos por falta de percepção de acompanhamento;
- a investidora anjo cobra **métricas de retenção** que hoje não existem;
- a lista de espera não pode ser absorvida.

## 2. Solução e justificativa (web app responsivo)

Escolhi um **web app mobile-first** em vez de app nativo ou site institucional:

| Opção | Por que não / por que sim |
|---|---|
| Site institucional | Não resolve a ficha de treino nem o acompanhamento. |
| App nativo | Exige publicação em lojas, instalação e manutenção em duas plataformas, custo alto para um estúdio de 4 pessoas. |
| **Web app responsivo** | Abre pelo link no celular, sem instalar. Um único código atende aluno (celular na academia) e personal (computador). Custo de hospedagem zero. |

**Como a solução ataca cada dor**

- Ficha perdida → treino digital sempre disponível, com carga, séries, repetições e dica de execução.
- Esquece a execução → cada exercício mostra a orientação do personal.
- Horas montando fichas → o personal edita a carga uma vez e o aluno vê na hora.
- Percepção de acompanhamento → o aluno vê frequência semanal e evolução de peso até a meta.
- Métricas para a investidora → painel com alunos ativos, cumprimento da meta de 3 treinos por semana e alunos em risco de cancelar (7 dias ou mais sem treinar).

## 3. Telas (protótipo funcional)

**Sou aluno**
1. Login digitando o nome.
2. Saudação com treinos dos últimos 7 dias e faixa de frequência da semana.
3. Treino de hoje: exercícios, carga, dica e botões de série; "Finalizar treino" só habilita com todas as séries feitas.
4. Evolução: barra de progresso até a meta e gráfico de peso.

**Sou personal**
1. Indicadores: alunos ativos, cumprimento da meta e alunos em risco.
2. Tabela de alunos com situação (Em dia, Atenção, Risco de cancelar).
3. Editor de carga por aluno.

> Os dados são fictícios (4 alunos de exemplo). Para testar, digite Ana, Bruno, Carla ou Diego no campo de nome.

## 4. Arquitetura

- **Front-end estático**: HTML, CSS e JavaScript puro em três arquivos (`index.html`, `style.css` e `script.js`), sem build e sem dependências (só a fonte Barlow via Google Fonts, com fallback do sistema).
- **Estado e persistência**: objeto JavaScript salvo no `localStorage` do navegador.
- **Renderização**: funções que geram o HTML de cada tela e redesenham ao mudar o estado. Gráfico em SVG inline.
- **Acessibilidade**: foco visível, rótulos ARIA, tema claro e escuro automático.
- **Evolução prevista**: trocar o `localStorage` por uma API com banco de dados e login por aluno, para sincronizar aluno e personal em aparelhos diferentes. Credenciais ficariam em variáveis de ambiente (`.env`, já no `.gitignore`).

> Limitação do protótipo: como os dados ficam no navegador, aluno e personal só veem a mesma informação no mesmo aparelho.

## 5. Como executar

```bash
git clone https://github.com/<seu-usuario>/fitcore-studio.git
cd fitcore-studio
# opção 1: abrir index.html no navegador
# opção 2: servidor local
python3 -m http.server 8000   # acesse http://localhost:8000
```

Publicação online: GitHub → **Settings → Pages → Deploy from a branch → main / (root)**.

## 6. Segurança

Nenhuma credencial, senha, token ou chave de API existe no código ou no histórico.

## Licença

[MIT](LICENSE)