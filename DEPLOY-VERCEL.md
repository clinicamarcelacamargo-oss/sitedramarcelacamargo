# Deploy do site da Dra. Marcela Camargo

O site é estático e usa upload direto de arquivos pela CLI da Vercel. As atualizações devem ir para o mesmo projeto para preservar o endereço público.

| Destino | Valor |
|---|---|
| Equipe | `dra-marcela-camargo` |
| ID da equipe | `team_vtVatLeMRAtnxEaXo9tmIcLP` |
| Projeto | `site-marcela-camargo` |
| ID do projeto | `prj_X4zRkPYKCk4ZiNgXyCRwsJdYZPP7` |
| Produção | [site-marcela-camargo.vercel.app](https://site-marcela-camargo.vercel.app/) |
| Painel | [Projeto na Vercel](https://vercel.com/dra-marcela-camargo/site-marcela-camargo) |

## Simular e publicar

Execute em PowerShell na pasta deste guia. A CLI da Vercel precisa estar instalada e a sessão local autorizada. O Windows pode tratar a unidade do Google Drive como remota, por isso o comando copia o script para uma pasta local antes de executá-lo.

```powershell
$site = (Get-Location).Path
$scriptLocal = Join-Path $env:LOCALAPPDATA 'VercelCLI-DraMarcela\Publicar-Site-Marcela.ps1'
Copy-Item -LiteralPath (Join-Path $site 'Publicar-Site-Marcela.ps1') -Destination $scriptLocal
& $scriptLocal -PastaDoSite $site
```

O comando acima valida a sessão, confirma o projeto e lista os arquivos que seriam enviados. Use `-Publicar` quando houver pedido para colocar a versão em produção.

```powershell
& $scriptLocal -PastaDoSite $site -Publicar
```

O script monta uma cópia temporária das páginas públicas e dos arquivos estáticos em `assets`, `css` e `js`. `.git`, `.vercel`, `.env.local`, este guia e o script ficam fora do upload. A CLI aponta para o ID do projeto e usa a equipe do painel acima. Depois do deploy, confira a URL de produção.

## Sessão local da Vercel

A conexão usa uma sessão própria da conta da Dra. Marcela em `%LOCALAPPDATA%\VercelCLI-DraMarcela`. As credenciais ficam no computador. Para configurar em outra máquina ou renovar uma sessão expirada, execute o login e aprove no Chrome com a conta que tem acesso à equipe.

```powershell
$config = Join-Path ([Environment]::GetFolderPath('LocalApplicationData')) 'VercelCLI-DraMarcela'
vercel login --global-config $config
```

Se usar o navegador, faça o upload na página do **projeto existente** e selecione uma cópia contendo apenas os arquivos públicos. O Vercel Drop aceita atualizações diretamente nesse painel. [Documentação do Vercel Drop](https://vercel.com/docs/drop#keep-iterating-on-a-dropped-project)
