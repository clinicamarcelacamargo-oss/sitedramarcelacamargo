# Instruções para agentes — site da Dra. Marcela Camargo

Site estático (index.html, assets, css, js). Não há build nem Git remoto: a publicação vai direto para a Vercel da conta da Dra. Marcela pela CLI.

## Destino

| Item | Valor |
|---|---|
| Domínio oficial | https://www.dramarcelacamargo.com.br (o domínio sem www redireciona para ele) |
| Equipe Vercel | `dra-marcela-camargo` (`team_vtVatLeMRAtnxEaXo9tmIcLP`) |
| Projeto | `site-marcela-camargo` (`prj_X4zRkPYKCk4ZiNgXyCRwsJdYZPP7`) |
| Sessão da CLI | `%LOCALAPPDATA%\VercelCLI-DraMarcela` no computador do Rapha (credenciais ficam só lá) |

O `.vercel/project.json` desta pasta aponta para outra conta e está desatualizado. Vale o que está no `Publicar-Site-Marcela.ps1` e no `DEPLOY-VERCEL.md`.

## O que NÃO funciona

- Conector Vercel (MCP) do Claude: só enxerga a equipe do Rapha, não a `dra-marcela-camargo`.
- API da Vercel com a sessão do painel no navegador: retorna "Not authorized".
- Vercel Drop pelo navegador via agente: o site tem ~31 MB e o upload do agente aceita até 3,8 MB por envio.
- Shell Linux do workspace no computador (device_bash): pode falhar por falta de espaço em disco.

## Como publicar (caminho que funciona)

Rodar o PowerShell do Windows pelo Desktop Commander (`desktop-commander__start_process`, shell padrão powershell.exe).

1. Simulação (obrigatória antes de publicar; confere projeto e lista de arquivos):

```powershell
$site = 'G:\Meu Drive\Marcela Camargo\site-marcela-camargo'
$dir = Join-Path $env:LOCALAPPDATA 'VercelCLI-DraMarcela'
New-Item -ItemType Directory -Force -Path $dir | Out-Null
$scriptLocal = Join-Path $dir 'Publicar-Site-Marcela.ps1'
Copy-Item -LiteralPath (Join-Path $site 'Publicar-Site-Marcela.ps1') -Destination $scriptLocal -Force
& powershell -NoProfile -ExecutionPolicy Bypass -File $scriptLocal -PastaDoSite $site 2>&1 | Select-Object -Last 40
```

2. Publicação em produção (só com autorização explícita do Rapha):

```powershell
$site = 'G:\Meu Drive\Marcela Camargo\site-marcela-camargo'
$scriptLocal = Join-Path $env:LOCALAPPDATA 'VercelCLI-DraMarcela\Publicar-Site-Marcela.ps1'
& powershell -NoProfile -ExecutionPolicy Bypass -File $scriptLocal -PastaDoSite $site -Publicar 2>&1 | Select-Object -Last 25
```

O script copia para o upload apenas index.html e demais .html, `robots.txt`, `sitemap.xml`, `favicon.ico`, `manifest.webmanifest` e as pastas `assets`, `css`, `js`. Ficam fora `.git`, `.vercel`, `.env.local`, os .md e o próprio script. O script fica numa pasta local porque o Windows trata o Google Drive (G:) como unidade remota.

Se a CLI pedir login (sessão expirada), o Rapha roda e aprova no navegador com a conta da Dra. Marcela:

```powershell
vercel login --global-config "$env:LOCALAPPDATA\VercelCLI-DraMarcela"
```

## Conferir depois de publicar

- A saída deve mostrar `Aliased https://www.dramarcelacamargo.com.br` e `readyState: READY`.
- No ar: canonical e og:url apontando para `https://www.dramarcelacamargo.com.br/`; `robots.txt` e `sitemap.xml` com HTTP 200.

## Regras de SEO deste site

- Todas as URLs absolutas (canonical, og:url, og:image, JSON-LD `@id`/`url`) usam `https://www.dramarcelacamargo.com.br`. Nunca `*.vercel.app`: isso fez o Google exibir "Vercel" como nome do site e indexar um endereço que hoje dá 404.
- O nome do site precisa ser igual no `og:site_name` e no JSON-LD `WebSite.name`: "Dra. Marcela Camargo - Estética Avançada".
- Ao mudar a página, atualizar o `lastmod` no `sitemap.xml`.
