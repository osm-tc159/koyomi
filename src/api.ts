import { APIGatewayProxyHandler } from 'aws-lambda';
import { google } from 'googleapis';
import 'source-map-support/register';

const {
  SPREADSHEET_ID,
  CALENDAR_SHEET_NAME,
  GOOGLE_API_CREDENTIAL_JSON,
} = process.env;

const COLUMN_IDX = {
  DAY_NO: 0,
  DATE: 1,
  AUTHOR: 2,
  TITLE: 3,
  URL: 4,
};

export const getUnreadPosts: APIGatewayProxyHandler = async () => {
  const auth = await google.auth.getClient({
    credentials: JSON.parse(GOOGLE_API_CREDENTIAL_JSON),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = await google.sheets('v4').spreadsheets.get({
    auth,
    spreadsheetId: SPREADSHEET_ID,
  });

  const sheet = sheets.data.sheets.find((x) => x.properties.title === CALENDAR_SHEET_NAME);
  const filter = sheet.basicFilter.criteria['0'];

  // フィルタータイプは NUMBER_GREATER_THAN_EQ なので、最後に読んだ日は `設定値 - 1` 日
  // TODO max(今までの最大値, 今取得した値) を「最後に読んだ日」としないと、シートのフィルター操作中おかしくなる
  const lastReadDay = parseInt(filter.condition.values[0].userEnteredValue, 10) - 1;

  const from = lastReadDay + 1;
  const to = from + 6; // FIXME
  const range = `${CALENDAR_SHEET_NAME}!A${from + 1}:E${to + 1}`;

  const got = await google.sheets('v4').spreadsheets.values.get({
    auth,
    spreadsheetId: SPREADSHEET_ID,
    range,
  });

  const posts = [];
  for (const row of got.data.values) {
    posts.push({
      day: parseInt(row[COLUMN_IDX.DAY_NO], 10),
      date: row[COLUMN_IDX.DATE], // TODO セルの値がそのまま渡ってくるため OAC Day Number から導出した日付がよいかもしれない
      author: row[COLUMN_IDX.AUTHOR] ?? '',
      title: row[COLUMN_IDX.TITLE] ?? '',
      url: row[COLUMN_IDX.URL] ?? '',
    });
  };

  return {
    statusCode: 200,
    body: JSON.stringify({ posts }),
  };
};
