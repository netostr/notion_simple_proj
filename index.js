import { Client } from "@notionhq/client"
import { config } from "dotenv"
import fetch from "node-fetch"
config()

const notion = new Client({ auth: process.env.NOTION_KEY });

const databaseId = process.env.NOTION_DATABASE_ID;

const keyTheMovieDb = process.env.KEY_THE_MOVIE_DB;

main();

async function main() {
  try {
    const popularFilms = await getPopularFilms();
    await updateDB(popularFilms);
    
  } catch (error) {
    console.log(error)
  }
}

async function updateDB(popularFilms) {
  let results = await Promise.all(
    popularFilms.map((film) =>
      notion.pages.create({
        parent: { database_id: databaseId },
        properties: getPropertiesFromFilm(film),
      })
    )
  )
  
  console.log(results)
  console.log("Success! Entry added.")
}

async function getPopularFilms() {
  try {
    const url = 'https://api.themoviedb.org/3/movie/popular?api_key=' + keyTheMovieDb;
    const response = await fetch(url);
    let json = await response.json();
    return json.results;
  } catch (error) {
    console.log(error);
  }
}

function getPropertiesFromFilm(film) {
  const { id, original_title, overview, popularity, release_date, original_language } = film
  return {
    id: {
      title: [{ type: "text", text: { content: String(id) } }],
    },
    original_title: {
      rich_text: [ { type: "text", text: { content: original_title }}],
    },
    overview: {
      rich_text: [ { type: "text", text: { content: overview }}],
    },
    popularity: {
      number: popularity,
    },
    release_date: {
      rich_text: [ { type: "text", text: { content: release_date }}],
    },
    original_language: {
      rich_text: [ { type: "text", text: { content: original_language }}],
    },
  }
}