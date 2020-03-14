import { APIGatewayProxyHandler } from 'aws-lambda';
import { google } from 'googleapis';
import * as dayjs from 'dayjs';
import 'dayjs/locale/ja';
import * as utc from 'dayjs/plugin/utc';
import * as weekday from 'dayjs/plugin/weekday';
import 'source-map-support/register';

dayjs.locale('ja');
dayjs.extend(utc);
dayjs.extend(weekday);

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
  const lastReadDayNumber = parseInt(filter.condition.values[0].userEnteredValue, 10) - 1;

  const got = await google.sheets('v4').spreadsheets.values.get({
    auth,
    spreadsheetId: SPREADSHEET_ID,
    range: computeRange(lastReadDayNumber),
  });

  const posts = [];
  for (const row of got.data.values) {
    const day = parseInt(row[COLUMN_IDX.DAY_NO], 10);

    posts.push({
      day,
      date: odnToDate(day).toISOString(),
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

const ODN_EPOCH = dayjs('2014-12-08T00:00:00+09:00');

const computeRange = (lastReadDayNumber: number): string => {
  const from = lastReadDayNumber + 1;

  const today = dayjs().utcOffset(9).startOf('day');
  const nearSunday = today.weekday() === 0 ? today : today.weekday(7);

  const to = 1 + ((nearSunday.unix() - ODN_EPOCH.unix()) / (60 * 60 * 24));

  return `${CALENDAR_SHEET_NAME}!A${from + 1}:E${to + 1}`;
};

const odnToDate = (odn: number): dayjs.Dayjs => ODN_EPOCH.add(odn - 1, 'day');
