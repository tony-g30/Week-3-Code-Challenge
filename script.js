document.addEventListener('DOMContentLoaded', () => {
  const movieDetails = document.getElementById('movie-details');
  const ulFilms = document.getElementById('films');
  const buyTicketButton = document.getElementById('buy-ticket');
  const ticketMessage = document.getElementById('ticket-message');
  let currentMovie = null;

  // Fetch movies from the local server
  fetch('http://localhost:3000/movies')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      if (data && data.length > 0) {
        currentMovie = data[0]; // Get the first movie
        displayMovieDetails(currentMovie);
        populateFilmMenu(data);
      } else {
        console.error('No movies found');
      }
    })
    .catch(error => {
      console.error('Error fetching movies:', error);
    });

  function displayMovieDetails(movie) {
    document.getElementById('poster').src = movie.poster;
    document.getElementById('title').textContent = movie.title;
    document.getElementById('runtime').textContent = `Runtime: ${movie.runtime}`;
    document.getElementById('showtime').textContent = `Showtime: ${movie.showtime}`;
    document.getElementById('available-tickets').textContent = `Available Tickets: ${movie.capacity - movie.tickets_sold}`;
    document.getElementById('description').textContent = `Description: ${movie.description}`;
    
    buyTicketButton.disabled = (movie.capacity - movie.tickets_sold) === 0;
    ticketMessage.textContent = ''; // Clear previous message
  }

  function populateFilmMenu(movies) {
    // Clear the film menu
    ulFilms.innerHTML = '';

    // Add movies to the list
    movies.forEach(movie => {
      const li = document.createElement('li');
      li.className = 'film-item';
      li.dataset.id = movie.id;
      
      // Create movie poster image
      const img = document.createElement('img');
      img.src = movie.poster;
      img.alt = `${movie.title} Poster`;

      // Create movie title
      const h3 = document.createElement('h3');
      h3.textContent = movie.title;

      // Append elements to list item
      li.appendChild(img);
      li.appendChild(h3);

      // Add event listener for selecting a movie
      li.addEventListener('click', () => {
        currentMovie = movie;
        displayMovieDetails(movie);
      });

      // Append list item to the menu
      ulFilms.appendChild(li);
    });
  }

  buyTicketButton.addEventListener('click', () => {
    if (currentMovie && currentMovie.tickets_sold < currentMovie.capacity) {
      // Calculate new number of tickets sold and available tickets
      const updatedTicketsSold = currentMovie.tickets_sold + 1;

      // Update movie details on the front end
      currentMovie.tickets_sold = updatedTicketsSold;
      displayMovieDetails(currentMovie);

      // Send update to the server
      fetch(`http://localhost:3000/movies/${currentMovie.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tickets_sold: updatedTicketsSold })
      })
      .then(response => response.json())
      .then(updatedMovie => {
        if (updatedMovie.tickets_sold === updatedTicketsSold) {
          ticketMessage.textContent = 'Ticket purchased successfully!';
        } else {
          console.error('Failed to update tickets sold on the server.');
          // Revert UI changes or show an error message if needed
          currentMovie.tickets_sold -= 1;
          displayMovieDetails(currentMovie);
          ticketMessage.textContent = 'Error: Unable to purchase ticket.';
        }
      })
      .catch(error => {
        console.error('Error updating tickets sold:', error);
        // Handle error or revert UI changes if needed
        currentMovie.tickets_sold -= 1;
        displayMovieDetails(currentMovie);
        ticketMessage.textContent = 'Error: Unable to purchase ticket.';
      });
    } else {
      ticketMessage.textContent = 'No tickets available!';
    }
  });
});
