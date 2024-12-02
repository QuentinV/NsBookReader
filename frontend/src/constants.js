
const storageApiHost = import.meta.env.VITE_STORAGE_API_HOST;

export const books = [...Array(26)].map( (v, i) => `${storageApiHost}/storage/books/lesmagiciens-t1---${i+3}.mp3` );
