import {Movie, MovieReview} from '../shared/types'

export const movies : Movie[] = [
  {
    movieId: 1234,
    genre_ids: [28, 14, 32],
    original_language: 'en',
    overview:
      "Every six years, an ancient order of jiu-jitsu fighters joins forces to battle a vicious race of alien invaders. But when a celebrated war hero goes down in defeat, the fate of the planet and mankind hangs in the balance.",
    popularity: 2633.943,
    release_date: "2020-11-20",
    title: "Title 1234",
    video: false,
    vote_average: 5.9,
    vote_count: 111,
  },


  {
    movieId: 4567,
    genre_ids: [28, 14, 32],
    original_language: 'fr',
    overview:
      "Every six years, an ancient order of jiu-jitsu fighters joins forces to battle a vicious race of alien invaders. But when a celebrated war hero goes down in defeat, the fate of the planet and mankind hangs in the balance.",
    popularity: 2633.943,
    release_date: "2020-11-20",
    title: "Title 1234",
    video: false,
    vote_average: 5.9,
    vote_count: 111,
  },
  {
    movieId: 2345,
    genre_ids: [28, 14, 32],
    original_language: 'en',
    overview:
      "Every six years, an ancient order of jiu-jitsu fighters joins forces to battle a vicious race of alien invaders. But when a celebrated war hero goes down in defeat, the fate of the planet and mankind hangs in the balance.",
    popularity: 2633.943,
    release_date: "2020-11-21",
    title: "Title 2345",
    video: false,
    vote_average: 5.9,
    vote_count: 111,
  },
  {
    movieId: 3456,
    genre_ids: [28, 14, 32],
    original_language: 'en',
    overview:
      "A famous American sniper struggles to fit in after returning home from a war thorn country and ultimately meets his doom trying to help other veterans.",
    popularity: 2633.943,
    release_date: "2020-11-21",
    title: "American Sniper",
    video: false,
    vote_average: 5.9,
    vote_count: 111,
  },
];

export const movieReviews: MovieReview[] = [
  {
    movieId: 1234,
    reviewerName: "KillianHalpin",
    rating: 5,
    reviewDate: "2023-10-20",
    content: "Brilliant movie!"
  },
  {
    movieId: 4567,
    reviewerName: "NathanBreen",
    rating: 2,
    reviewDate: "2021-12-15",
    content: "Movie was only ok"
  },
  {
    movieId: 2345,
    reviewerName: "BenRoche",
    rating: 4,
    reviewDate: "2022-10-17",
    content: "Loved it, great movie"
  },
  {
    movieId: 3456,
    reviewerName: "MartinHalpin",
    rating: 1,
    reviewDate: "2020-11-14",
    content: "Absolutely Useless hated it"
  }
];

