<script lang="ts">
    import { login } from '../lib/api';
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
    import { darkMode } from '$lib/stores/darkModeStore'; // Import the shared dark mode store
    
    let username = '';
    let password = '';
  
    async function handleLogin() {
      try {
        const data = await login({ username, password });
        localStorage.setItem('access_token', data.access);
        goto('/lists');
      } catch (error) {
        console.error('Login error:', error);
      }
    }
  </script>
  
  <div class={$darkMode ? 'flex items-center justify-center min-h-screen bg-main-bg-dark text-text-dark p-4' : 'flex items-center justify-center min-h-screen bg-main-bg-light text-text p-4'}>
    <div class={$darkMode ? 'w-full max-w-md bg-login-bg-dark shadow-ios rounded-lg p-6' : 'w-full max-w-md bg-login-bg-light shadow-ios rounded-lg p-6'}>
      <h1 class={$darkMode ? 'text-2xl font-bold mb-4 text-center text-text-dark' : 'text-2xl font-bold mb-4 text-center text-text-light'}>Login</h1>
      <form on:submit|preventDefault={handleLogin} class="space-y-4">
        <div>
          <label class="block font-semibold mb-1" for="username">Username:</label>
          <input
            id="username"
            type="text"
            bind:value={username}
            class={$darkMode ? 'w-full p-2 border rounded-md text-text-light focus:outline-none' : 'w-full p-2 border rounded-md text-text-light focus:outline-none focus:ring-1'}
            required
          />
        </div>
        <div>   
          <label class="block font-semibold mb-1" for="password">Password:</label>
          <input
            id="password"
            type="password"
            bind:value={password}
            class={$darkMode ? 'w-full p-2 border rounded-md text-text-light focus:outline-none focus:ring-1' : 'w-full p-2 border rounded-md text-text-light focus:outline-none focus:ring-1'}
            required
          />
        </div>
        <button
          type="submit"
          class={$darkMode ? 'w-full py-2 bg-login-btn text-white rounded-md focus:outline-none focus:bg-login-btn-focus' : 'w-full py-2 bg-login-btn text-white rounded-md focus:outline-none focus:bg-login-btn-focus'}
        >
          Login
        </button>
      </form>
      <p class="mt-4 text-center">
        <a href="/register" class={$darkMode ? 'text-text-dark underline hover:text-register-hover-dark' : 'text-text-light underline hover:text-register-hover-light'}>Register</a>
      </p>
    </div>
  </div>
  