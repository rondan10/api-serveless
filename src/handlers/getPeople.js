const axios = require('axios');
const { traducirPersonaje } = require('../utils/traduccion');

exports.handler = async (event) => {
  try {
    const response = await axios.get('https://swapi.py4e.com/api/people/');
    const personajesTraducidos = response.data.results.map(traducirPersonaje);
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        personas: personajesTraducidos
      })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: error.response?.status || 500,
      body: JSON.stringify({ error: 'Error al obtener personas de SWAPI' })
    };
  }
};