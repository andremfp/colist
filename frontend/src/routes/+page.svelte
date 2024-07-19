<script lang="ts">
    import { login } from '../lib/api';
    import { goto } from '$app/navigation';
  
    let username = '';
    let password = '';
  
    async function handleLogin() {
      try {
        const data = await login({ username, password });
        localStorage.setItem('access_token', data.access);
        goto('/lists');
      } catch (error) {
        console.error('Login error:', error);
        // Handle login error, show message or retry logic
      }
    }
  </script>
  
  <div class="flex items-center justify-center min-h-screen bg-bg-1 p-4">
    <div class="w-full max-w-md bg-white shadow-ios rounded-lg p-6">
      <h1 class="text-2xl font-bold mb-4 text-center text-theme-1">Login</h1>
      <form on:submit|preventDefault={handleLogin} class="space-y-4">
        <div>
          <label class="block text-gray-700 font-semibold mb-1" for="username">
            Username:
          </label>
          <input
            id="username"
            type="text"
            bind:value={username}
            class="w-full p-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-theme-1"
            required
          />
        </div>
        <div>
          <label class="block text-gray-700 font-semibold mb-1" for="password">
            Password:
          </label>
          <input
            id="password"
            type="password"
            bind:value={password}
            class="w-full p-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-theme-1"
            required
          />
        </div>
        <button
          type="submit"
          class="w-full py-2 bg-theme-1 text-white rounded-md hover:bg-theme-2 focus:outline-none focus:ring-2 focus:ring-theme-2"
        >
          Login
        </button>
      </form>
      <p class="mt-4 text-center">
        <a href="/register" class="text-theme-1 underline hover:text-theme-2">Register</a>
      </p>
    </div>
  </div>
  