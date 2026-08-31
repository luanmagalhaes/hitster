# 🎵 Vitrola

> Ouça 30 segundos. Chute o ano. Monte sua linha do tempo.

Um party game musical para tocar na mesa do bar. Uma música começa, ninguém vê o título, e você tem que decidir onde ela entra na sua linha do tempo — antes de 1994? depois daquele hit de 2011? Acertou a posição, a carta é sua. Errou, ela volta pro monte.

Primeiro a montar **10 músicas na ordem certa** ganha.

![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white)
![Deezer](https://img.shields.io/badge/áudio-Deezer%20preview-FF0092?logo=deezer&logoColor=white)

---

## 🎯 Como se joga

| Passo | O que acontece |
| :--: | -------------- |
| 1️⃣ | Uma música toca na **vitrola** — o aparelho que fica no meio da mesa |
| 2️⃣ | Você **não vê** artista, título nem ano. Só ouve |
| 3️⃣ | Escolhe onde ela entra na sua linha do tempo, entre as cartas que você já tem |
| 4️⃣ | A carta vira. Se o ano cai no intervalo que você escolheu, ela é sua |
| 5️⃣ | Errou? Volta pro monte e a vez passa |
| 6️⃣ | Quem fechar **10 cartas em ordem** primeiro leva |

### 🪙 As fichas

Ficha é o tempero. Você gasta uma para:

- **Cravar o artista ou o título** — acertou, ganha ficha de volta
- **Roubar** — se alguém posicionou e você acha que errou, aposta e diz onde é o certo. Se você acerta e a pessoa erra, a carta muda de dono

---

## 📀 O modo vitrola

O player de áudio mostra o que está tocando — ou seja, **a resposta**. Então um aparelho vira a vitrola: notebook, TV, tablet, ou o celular com a tela virada pra baixo. Ele só toca.

Os jogadores palpitam nos próprios celulares e nunca olham aquela tela. É exatamente como funciona no jogo de tabuleiro: o aparelho fica na mesa tocando e ninguém encara.

---

## 🎼 O baralho

**258 músicas curadas**, cobrindo de 1947 a 2024:

| Baralho | Músicas | O que tem dentro |
| ------- | :-----: | ---------------- |
| 🇧🇷 **Nacional** | 123 | Da Ju Marques da seresta a Caetano — mais Tim Maia, Legião, Racionais, axé, pagode, sertanejo, Calypso, Anitta, Marina Sena |
| 🌍 **Internacional** | 135 | Elvis, Beatles, Queen, Michael Jackson, ABBA, Nirvana, Beyoncé, Billie Eilish |
| 🎛️ **Misto** | 258 | Os dois embaralhados |

Distribuição por década, para o jogo não virar só anos 2010:

```text
1940s  ▏1        1990s  ████████████ 52
1950s  ▎2        2000s  ███████████ 46
1960s  ████ 18   2010s  ███████████ 46
1970s  ███████ 30        2020s  ██ 7
1980s  █████████████ 56
```

### ⚠️ Sobre os anos

O ano é o eixo do jogo, então vale ser honesto sobre como ele foi obtido: **os anos são curados à mão**.

Testei MusicBrainz e Deezer como fonte automática e as duas falham no mesmo ponto — indexam **remasterizações**. O Deezer devolveu 1996 para *Billie Jean* e 2002 para *Dancing Queen*; o MusicBrainz devolveu 1991 para *Bohemian Rhapsody*. Nenhuma serve como verdade.

Duas coisas amortecem o erro residual:

- No jogo, o que importa é a **posição relativa**, não o ano exato — errar por um ou dois anos quase nunca muda a jogada
- O catálogo é dado puro, fácil de corrigir

---

## 🔊 O áudio

Prévias de **30 segundos via Deezer**, sem login e sem conta de ninguém.

Trinta segundos bastam: no jogo real ninguém ouve a música inteira. E a prévia é só áudio, sem tela — então não existe spoiler acidental.

A URL da prévia expira, então o app guarda o **id da faixa** e resolve o áudio no momento de tocar.

---

## 🎨 Visual

Amarelo-ouro, tipografia preta pesada, magenta e turquesa nos acentos, bordas grossas e botões com relevo — a cara de caixa de jogo de tabuleiro.

- **Abertura animada**: o disco cai girando, quica, o wordmark sobe e a cortina abre
- **Desktop e mobile**: no celular empilha, no desktop vira duas colunas com o vinil girando
- Toda animação em `transform` e `opacity`, com `prefers-reduced-motion` respeitado

---

## 🛠️ Stack

| Camada | Escolha |
| ------ | ------- |
| Framework | Next.js 16 · App Router · React 19 |
| Linguagem | TypeScript, strict |
| Estilo | Tailwind CSS 4 |
| Áudio | Prévias do Deezer (30s, sem autenticação) |
| Estado | Supabase (Postgres + Realtime + RLS) |
| Testes | Vitest — 39 testes nas regras, catálogo e sementes |

---

## 🚀 Rodando local

```bash
pnpm install
cp .env.example .env.local   # preencha os valores do Supabase
pnpm dev                     # http://localhost:1000
```

```bash
pnpm test    # suíte de testes
pnpm build   # build de produção
```

---

## 📂 Estrutura

```text
src/
├── app/                # rotas, layout, tema global
├── components/
│   ├── game/           # telas do jogo
│   ├── layout/         # shell e abertura animada
│   └── ui/             # botões, vinil, primitivos
├── data/               # catálogo e textos em PT-BR
├── hooks/
├── lib/                # regras puras e integrações
├── types/
└── utils/
scripts/seed/           # catálogo curado, por baralho
```

---

## 🗺️ Estado

- [x] Baralho de 258 músicas curadas, com distribuição por década
- [x] Sistema visual, abertura animada, responsivo desktop e mobile
- [x] Fonte de áudio validada (prévia do Deezer, sem login)
- [x] Áudio tocando no app, com pausar e repetir
- [x] Linha do tempo jogável em dois passos
- [x] Salas, turnos e multiplayer por polling
- [x] Fichas por acertar artista e título, trocáveis por carta
- [x] Três níveis de dificuldade
- [x] Animação de vitória
- [ ] Roubar carta de quem errou
- [ ] Placar entre partidas
- [ ] Deploy

---

## 📜 Notas

O catálogo, o sistema visual e o código deste repositório são trabalho original. Mecânica de jogo não é protegida por direito autoral; nenhum texto, arte ou ativo foi retirado de produto existente.

Feito para tocar alto, com gente que discute ano de música. 🔊
