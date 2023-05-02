import axios from 'axios';

const apiKey = '35821051-ff4ed7cb6cca304ad1608b196';
const perPage = 40;

async function fetchImages(query, page) {
  const url = `https://pixabay.com/api/?key=${apiKey}&q=${query}&image_type=photo&orientation=horizontal&safesearch=true&per_page=${perPage}&page=${page}`;
  const response = await axios.get(url);
  return response.data;
}

export { fetchImages };
