const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  try {
    const params = {
      TableName: process.env.DYNAMODB_TABLE
    };


    const queryParams = event.queryStringParameters || {};
    if (queryParams.lastEvaluatedKey) {
      params.ExclusiveStartKey = JSON.parse(
        Buffer.from(queryParams.lastEvaluatedKey, 'base64').toString()
      );
    }
    if (queryParams.limit) {
      params.Limit = parseInt(queryParams.limit);
    }

    const result = await dynamoDb.scan(params).promise();


    let nextPageToken;
    if (result.LastEvaluatedKey) {
      nextPageToken = Buffer.from(
        JSON.stringify(result.LastEvaluatedKey)
      ).toString('base64');
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        personajes: result.Items,
        nextPageToken: nextPageToken
      })
    };
  } catch (error) {
    console.error('Error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'Error al obtener los personajes'
      })
    };
  }
};