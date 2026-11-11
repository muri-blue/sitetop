# Megathread (GitHub Pages)

Site 100% estático. Os links ficam em `links.json`; o `/admin` edita esse arquivo pela API do GitHub (cada alteração vira um commit).

## Publicar
1. Crie um repositório no GitHub e envie estes arquivos (`index.html`, `admin/`, `style.css`, `app.js`, `links.json`).
2. Em `app.js`, troque `SEU_USUARIO/SEU_REPOSITORIO` (e a branch, se não for `main`).
3. Settings → Pages → Deploy from a branch → `main` / root.
4. Site: `https://usuario.github.io/repositorio/` — Admin: `.../admin/`

## Criar o token (a "senha" do admin)
GitHub → Settings → Developer settings → Personal access tokens → **Fine-grained tokens** → Generate:
- Repository access: **Only select repositories** → só o repositório do site
- Permissions → Repository → **Contents: Read and write**
Cole o token na tela do `/admin`. Ele fica só na aba aberta (sessionStorage) e some ao fechar. Guarde-o num gerenciador de senhas.

## Observações
- Depois de salvar, o GitHub Pages leva ~1 a 10 min para atualizar o site público. O admin sempre vê a versão mais recente.
- Só quem tem o token consegue alterar os links: o GitHub recusa qualquer escrita sem ele.
- Quem digitar `/admin` verá apenas a tela de login.
