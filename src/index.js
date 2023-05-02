import './css/styles.css';
import { Notify } from 'notiflix';
import { fetchImages } from './fetchImages';
import axios from 'axios';

const refs = {
  searchForm: document.querySelector('.search-form'),
  gallery: document.querySelector('.gallery'),
  loadMoreBtn: document.querySelector('.load-more'),
};

const apiKey = '35821051-ff4ed7cb6cca304ad1608b196';
const perPage = 40;
let currentPage = 1;
let currentQuery = '';

refs.searchForm.addEventListener('submit', e => {
  e.preventDefault();
  const query = e.target.searchQuery.value.trim();
  if (query === '') return;

  currentQuery = query;
  currentPage = 1;
  fetchImages(currentQuery, currentPage)
    .then(data => {
      if (data.hits.length === 0) {
        Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
        refs.gallery.innerHTML = '';
        refs.loadMoreBtn.classList.add('hide');
        return;
      }
      renderGallery(data.hits);
      window.addEventListener('scroll', onMoveScroll);
    })
    .catch(error => {
      Notify.failure('Oops! Something went wrong. Please try again later.');
      console.log(error);
    });
});

refs.loadMoreBtn.addEventListener('click', onLoadMore);

function renderGallery(images) {
  if (currentPage === 1) {
    refs.gallery.innerHTML = '';
  }
  const markup = images
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) =>
        `
  <div class="photo-card">
    <a class="photo-link" href="${largeImageURL}">
      <img class="photo" src="${webformatURL}" alt="${tags}" loading="lazy"/>
    </a>
      <div class="info">
     <p class="info-item">
        <b>Likes</b>${likes}
      </p>
     <p class="info-item">
        <b>Views</b>${views}
      </p>
      <p class="info-item">
        <b>Comments</b>${comments}
     </p>
      <p class="info-item">
       <b>Downloads</b>${downloads}
     </p>
  </div>
</div>
`
    )
    .join('');
  return refs.gallery.insertAdjacentHTML('beforeend', markup);
}

async function onLoadMore() {
  currentPage += 1;
  try {
    const response = await axios.get(
      `https://pixabay.com/api/?key=${apiKey}&q=${currentQuery}&image_type=photo&orientation=horizontal&safesearch=true&per_page=${perPage}&page=${currentPage}`
    );
    const data = response.data;
    if (data.hits.length === 0) {
      Notify.failure(
        'Sorry, there are no more images matching your search query.'
      );
      refs.gallery.innerHTML = '';
      refs.loadMoreBtn.classList.add('hide');
      return;
    }
    renderGallery(data.hits);
    refs.gallery.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
    });
    if (data.hits.length < 40) {
      refs.loadMoreBtn.classList.add('hide');
      Notify.info("We're sorry, but you've reached the end of search results.");
      window.removeEventListener('scroll', onMoveScroll);
    }
  } catch (error) {
    Notify.failure('Oops! Something went wrong. Please try again later.');
    console.log(error);
  }
}

window.addEventListener('scroll', onMoveScroll);

function onMoveScroll() {
  const galleryHeight = refs.gallery.offsetHeight;
  const windowHeight = window.innerHeight;
  const scrollDistance = window.pageYOffset + windowHeight;

  if (scrollDistance >= galleryHeight) {
    refs.loadMoreBtn.classList.remove('hide');
  } else {
    refs.loadMoreBtn.classList.add('hide');
  }
}
