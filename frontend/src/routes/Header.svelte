<script>
	import { darkMode } from '$lib/stores/darkModeStore';
	import logo from '$lib/images/svelte-logo.svg';
	import github from '$lib/images/github.svg';
	import 'remixicon/fonts/remixicon.css';
  
	// Update dark mode state when toggled
	function toggleDarkMode() {
	  darkMode.update(value => {
		const newMode = !value;
		localStorage.setItem('dark-mode', newMode.toString());
		return newMode;
	  });
	}
  </script>
  
  <header class={`flex justify-between items-center p-4 ${$darkMode ? 'bg-main-bg-dark text-text-dark' : 'bg-main-bg-light text-text'}`}>
	<div class="corner">
	  <a href="https://kit.svelte.dev">
		<img src={logo} alt="SvelteKit" />
	  </a>
	</div>
  
	<div class="corner">
	  <a href="https://github.com/sveltejs/kit">
		<img src={github} alt="GitHub" />
	  </a>
	</div>
  
	<div class="toggle-container corner">
	  <button on:click={toggleDarkMode} class="text-xl">
		<span class={$darkMode ? 'ri-sun-line' : 'ri-moon-line'}></span>
	  </button>
	</div>
  </header>
  
  <style>
	header {
	  display: flex;
	  justify-content: space-between;
	  align-items: center;
	  padding: 1rem;
	}
  
	.corner {
	  width: 3em;
	  height: 3em;
	}
  
	.corner a {
	  display: flex;
	  align-items: center;
	  justify-content: center;
	  width: 100%;
	  height: 100%;
	}
  
	.corner img {
	  width: 2em;
	  height: 2em;
	  object-fit: contain;
	}
  
	.toggle-container {
	  cursor: pointer;
	  display: flex;
	  align-items: center;
	  justify-content: center;
	}
  
	.toggle-container button {
	  background: none;
	  border: none;
	  cursor: pointer;
	}
  
	.ri-sun-line,
	.ri-moon-line {
	  font-size: 1.5em;
	}
  </style>
  