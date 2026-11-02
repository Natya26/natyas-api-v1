/**
 * @param { import("knex").Knex } knex
 * @returns { Promiseid } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('genres').del()
  await knex('genres').insert([
    {id: 1, name: "Action", description: ""},
    {id: 2, name: "Adventure", description: ""},
    {id: 3, name: "Animated", description: ""},
    {id: 4, name: "Biography", description: ""},
    {id: 5, name: "Comedy", description: ""},
    {id: 6, name: "Crime", description: ""},
    {id: 7, name: "Dance", description: ""},
    {id: 8, name: "Disaster", description: ""},
    {id: 9, name: "Documentary", description: ""},
    {id: 10, name: "Drama", description: ""},
    {id: 11, name: "Erotic", description: ""},
    {id: 12, name: "Family", description: ""},
    {id: 13, name: "Fantasy", description: ""},
    {id: 14, name: "Found Footage", description: ""},
    {id: 15, name: "Historical", description: ""},
    {id: 16, name: "Horror", description: ""},
    {id: 17, name: "Independent", description: ""},
    {id: 18, name: "Legal", description: ""},
    {id: 19, name: "Live Action", description: ""},
    {id: 20, name: "Martial Arts", description: ""},
    {id: 21, name: "Musical", description: ""},
    {id: 22, name: "Mystery", description: ""},
    {id: 23, name: "Noir", description: ""},
    {id: 24, name: "Performance", description: ""},
    {id: 25, name: "Political", description: ""},
    {id: 26, name: "Romance", description: ""},
    {id: 27, name: "Satire", description: ""},
    {id: 28, name: "Science Fiction", description: ""},
    {id: 29, name: "Short", description: ""},
    {id: 30, name: "Silent", description: ""},
    {id: 31, name: "Slasher", description: ""},
    {id: 32, name: "Sports", description: ""},
    {id: 33, name: "Spy", description: ""},
    {id: 34, name: "Superhero", description: ""},
    {id: 35, name: "Supernatural", description: ""},
    {id: 36, name: "Suspense", description: ""},
    {id: 37, name: "Teen", description: ""},
    {id: 38, name: "Thriller", description: ""},
    {id: 39, name: "War", description: ""},
    {id: 40, name: "Western", description: ""}
  ]);
};
