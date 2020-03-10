# Koyomi [![serverless](http://public.serverless.com/badges/v3.svg)](http://www.serverless.com) [![GitHub Workflow Status](https://img.shields.io/github/workflow/status/osm-tc159/koyomi/Deploy%20master%20branch%20to%20sandbox?label=sandbox%20deployment&logo=github)](https://github.com/osm-tc159/koyomi/actions?query=workflow%3A%22Deploy+master+branch+to+sandbox%22)

![infra](https://user-images.githubusercontent.com/4990822/76337289-7aefa480-633a-11ea-96d9-826fb03c3f62.png)

## Features

* 放送でまだ読まれていない記事一覧を返すAPIを提供します
* 毎週日曜・夕方頃に今週の執筆状況をDiscordで通知します

## Setup

```console
$ # 依存モジュールをインストール
$ yarn

$ # デプロイ用AWS認証情報をセット
$ # あらかじめデプロイ用IAMユーザを用意し、アクセスキー・シークレットアクセスキーを発行しておくこと
$ # すでに aws-cli を使用しており ~/.aws/credentials に認証情報がセットされている場合は不要
$ yarn run serverless config credentials --provider=aws --key={AWS_ACCESS_KEY} --secret={AWS_SECRET_ACCESS_KEY}
```
