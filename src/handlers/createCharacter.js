const { v4: uuidv4 } = require('uuid');
const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();

const validateCharacter = (data) => {
  const requiredFields = ['nombre', 'altura', 'peso', 'colorCabello', 'colorPiel', 'colorOjos', 'añoNacimiento', 'genero'];
  const missingFields = requiredFields.filter(field => !data[field]);
  
  if (missingFields.length > 0) {
    throw new Error(`Campos requeridos faltantes: ${missingFields.join(', ')}`);
  }
};

exports.handler = async (event) => {
  try {
    const data = JSON.parse(event.body);
    validateCharacter(data);
    
    const timestamp = new Date().getTime();
    const id = uuidv4();
    
    const personaje = {
      id,
      nombre: data.nombre,
      altura: data.altura,
      peso: data.peso,
      colorCabello: data.colorCabello,
      colorPiel: data.colorPiel,
      colorOjos: data.colorOjos,
      añoNacimiento: data.añoNacimiento,
      genero: data.genero,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const params = {
      TableName: process.env.DYNAMODB_TABLE,
      Item: personaje,
    };

    await dynamoDb.put(params).promise();

    return {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(personaje)
    };
  } catch (error) {
    console.error('Error:', error);
    
    return {
      statusCode: error.name === 'ValidationError' ? 400 : 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: error.message || 'No se pudo crear el personaje'
      })
    };
  }
};
