exports.traducirPersonaje = (character) => {
    return {
      nombre: character.name,
      altura: character.height,
      peso: character.mass,
      colorCabello: character.hair_color,
      colorPiel: character.skin_color,
      colorOjos: character.eye_color,
      añoNacimiento: character.birth_year,
      genero: character.gender,
    };
  };