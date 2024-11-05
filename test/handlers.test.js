const { handler: createCharacterHandler } = require('../src/handlers/createCharacter');
const { handler: getCharactersHandler } = require('../src/handlers/getCharacter');


jest.mock('aws-sdk', () => {
  const mDynamoDb = {
    put: jest.fn().mockReturnThis(),
    scan: jest.fn().mockReturnThis(),
    promise: jest.fn()
  };
  
  return {
    DynamoDB: {
      DocumentClient: jest.fn(() => mDynamoDb)
    }
  };
});

describe('Character Handlers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createCharacter', () => {
    const validCharacter = {
      nombre: 'Luke Skywalker',
      altura: '172',
      peso: '77',
      colorCabello: 'rubio',
      colorPiel: 'claro',
      colorOjos: 'azul',
      añoNacimiento: '19BBY',
      genero: 'masculino'
    };

    test('should create a character successfully', async () => {
      const event = {
        body: JSON.stringify(validCharacter)
      };

      const AWS = require('aws-sdk');
      const dynamoDb = new AWS.DynamoDB.DocumentClient();
      dynamoDb.promise.mockResolvedValueOnce({});

      const response = await createCharacterHandler(event);

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('id');
      expect(body.nombre).toBe(validCharacter.nombre);
    });

    test('should return 400 for invalid character data', async () => {
      const event = {
        body: JSON.stringify({ nombre: 'Luke' })
      };

      const response = await createCharacterHandler(event);

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('error');
    });
  });

  describe('getCharacters', () => {
    test('should return characters successfully', async () => {
      const mockCharacters = [
        {
          id: '1',
          nombre: 'Luke Skywalker',
          altura: '172'
        }
      ];

      const AWS = require('aws-sdk');
      const dynamoDb = new AWS.DynamoDB.DocumentClient();
      dynamoDb.promise.mockResolvedValueOnce({
        Items: mockCharacters
      });

      const response = await getCharactersHandler({});

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('personajes');
      expect(body.personajes).toEqual(mockCharacters);
    });

    test('should handle pagination parameters', async () => {
      const event = {
        queryStringParameters: {
          limit: '10',
          lastEvaluatedKey: Buffer.from(JSON.stringify({ id: 'lastId' })).toString('base64')
        }
      };

      const AWS = require('aws-sdk');
      const dynamoDb = new AWS.DynamoDB.DocumentClient();
      dynamoDb.promise.mockResolvedValueOnce({
        Items: [],
        LastEvaluatedKey: { id: 'nextId' }
      });

      const response = await getCharactersHandler(event);

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('nextPageToken');
    });
  });
});