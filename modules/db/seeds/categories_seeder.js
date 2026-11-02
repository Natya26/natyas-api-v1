/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('categories').del()
  await knex('categories').insert([
    {id: 1, name: 'MOVIES', description: 'A film – also called a movie, motion picture, moving picture, picture, photoplay or (slang) flick – is a work of visual art that simulates experiences and otherwise communicates ideas, stories, perceptions, feelings, beauty, or atmosphere through the use of moving images'},
    {id: 2, name: 'SERIES', description: 'A web series, also known as a web show, is a series of scripted or non-scripted online videos, generally in episodic form, released on the Internet'},
    {id: 3, name: 'TRAILERS', description: 'A trailer ,also known as a preview, coming attraction or attraction video, is a commercial advertisement, originally for a feature film that is going to be exhibited in the future at a movie theater or cinema'}
  ]);
};
