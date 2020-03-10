import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';

export const getUnreadPosts: APIGatewayProxyHandler = async () => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      posts: [],
    }),
  };
};
