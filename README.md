# UselessBotBarebone
[UselessBot](https://kabanfriends.github.io/uselessbot)の基盤部分のシステムを、一般公開用に整理しました。
DiscordのBOTを作成中の方や、これから作るという方の参考になると幸いです。

## リポジトリ内に含まれるもの
UselessBotのコードのうち、以下の機能を抜粋して公開しています。
- ログ出力 (コンソールとファイル)
- コンソールコマンド
- BOTの起動処理
- イベントシステム
- データベース
- 多言語表示システム
- コマンド (/help, /lang)

## 使用方法
1. リポジトリ内の`.env_example`を`.env`に名前を変更し、ファイル内の`YOUR_TOKEN_HERE`の部分にBOTのトークンを記入してください。
2. `config/shared.json`を開き、`testGuilds`の配列に、BOTをテストする際に使うサーバーのIDを追加してください。
3. ターミナル上で`npm test`を実行すると、BOTが起動します。
4. すべてのコマンドの読み込みが完了したら、コンソール画面に`command register`入力すると、`testGuilds`で指定したサーバー上で、コマンドが使用できるようになります。  
   (全てのサーバーにコマンドを登録したい場合は、`.env`で稼働モードを`PRODUCTION`に設定してから、`command register`を使用してください)
