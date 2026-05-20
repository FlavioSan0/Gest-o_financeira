# Capacitor Android - Quebrei

Este arquivo descreve os passos para configurar, gerar e instalar o app Android usando Capacitor.

Pré-requisitos
- Node.js + npm
- Android Studio (com SDK e ferramentas instaladas)

Instalação (apenas uma vez)

1. Instale as dependências do Capacitor no projeto (se ainda não estiverem instaladas):

```bash
npm install @capacitor/cli @capacitor/core @capacitor/android --save-dev
```

2. Inicialize o Capacitor (define appId e appName, caso já não exista):

```bash
npm run capacitor:init
```

Adicionar a plataforma Android

```bash
npm run capacitor:add:android
```

Sincronizar (sempre após `npm run build`):

```bash
npm run build
npx cap sync android
npx cap open android
```

Observações de configuração
- O arquivo `capacitor.config.json` foi criado e aponta `server.url` para `https://quebrei.vercel.app`. Isso faz o WebView carregar a versão hospedada na Vercel (útil para continuar usando a origem web). O `webDir` está definido como `public` para não interferir no build web.
- Orientação: para forçar orientação `portrait` abra o projeto no Android Studio e altere `AndroidManifest.xml` em `app/src/main/AndroidManifest.xml` adicionando `android:screenOrientation="portrait"` no elemento `<activity>` principal.

Gerar APK (Android Studio)
1. No Android Studio (após `npx cap open android`) selecione o módulo `app`.
2. Menu: `Build` → `Build Bundle(s) / APK(s)` → `Build APK(s)`.
3. Após o processo, clique em `locate` na notificação para abrir a pasta com o APK (normalmente em `app/build/outputs/apk/debug/app-debug.apk`).

Instalar APK no celular
1. Ative `Instalar apps de fontes desconhecidas` no Android (configurações do dispositivo).
2. Transfira o APK para o celular (USB, Google Drive, e-mail) e abra o arquivo para instalar.
3. Ou use `adb` (Android SDK) conectado ao dispositivo:

```bash
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

O que mudar depois para Play Store
- Mudar `server.url` se desejar embarcar assets localmente (ou continuar usando servidor remoto). Para publicar na Play Store recomenda-se embutir assets locais (`webDir` apontando para build estático) e não depender de servidor remoto para evitar rejeição por conteúdo dinâmico remoto.
- Gerar uma release signed APK / App Bundle (AAB): `Build` → `Generate Signed Bundle / APK...` no Android Studio.
- Configurar `keystore` e armazenar as credenciais de assinatura com segurança.
- Seguir políticas do Google Play e preparar ficheiros (ícones, screenshots, descrição) antes de enviar.

Comandos úteis resumidos

```bash
npm run build
npm run capacitor:sync:android    # ou npx cap sync android
npm run capacitor:open:android    # ou npx cap open android
```
