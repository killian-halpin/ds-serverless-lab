export type MovieReview = {
  content: string;
  reviewerName: string; 
  rating: number;
  reviewDate: string;
  movieId: number;
};

export type Movie = {
    movieId: number;
    genre_ids: number[];
    original_language : string;
    overview: string;
    popularity: number;
    release_date: string;
    title: string
    video: boolean;
    vote_average: number;
    vote_count: number
  }