# Koyomi

やがて2049年になる

## Setup

```shell-session
$ # 依存モジュールをインストール
$ yarn

$ # デプロイ用AWS認証情報をセット
$ # あらかじめデプロイ用IAMユーザを用意し、アクセスキー・シークレットアクセスキーを発行しておくこと
$ # すでに aws-cli を使用しており ~/.aws/credentials に認証情報がセットされている場合は不要
$ yarn run serverless config credentials --provider=aws --key={AWS_ACCESS_KEY} --secret={AWS_SECRET_ACCESS_KEY}
```
