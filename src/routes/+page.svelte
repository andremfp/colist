<script lang="ts">
    import { login } from '../lib/auth';
    import { goto } from '$app/navigation';
    import { darkMode } from '$lib/stores/darkModeStore';

    let email = '';
    let password = '';
    let errorMessage = '';

    async function handleLogin() {
        try {
            await login(email, password);
            goto('/lists');
        } catch (error) {
            console.error('Login error:', error);
            errorMessage = error instanceof Error ? error.message : 'Login failed';
            showToast(errorMessage);
        }
    }

    function showToast(message: string) {
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.className = `${$darkMode ? 'bg-fail-toast-bg-dark' : 'bg-fail-toast-bg-light'} text-fail-toast-text fixed top-4 left-1/2 transform -translate-x-1/2 py-2 px-6 rounded-md shadow-lg backdrop-blur-md`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 5000);
    }
</script>

<!-- Centering container -->
<div class={$darkMode ? 'flex items-center justify-center bg-main-bg-dark text-text-dark' : 'flex items-center justify-center bg-main-bg-light text-text'}>
    <!-- Login form container -->
    <div class={$darkMode ? 'w-full max-w-md bg-login-bg-dark shadow-ios rounded-lg p-6' : 'w-full max-w-md bg-login-bg-light shadow-ios rounded-lg p-6'}>
        <h1 class={$darkMode ? 'text-2xl font-bold mb-4 text-center text-text-dark' : 'text-2xl font-bold mb-4 text-center text-text-light'}>Login</h1>

        <!-- Login form -->
        <form on:submit|preventDefault={handleLogin} class="space-y-4">
            <div>
                <label class="block font-semibold mb-1" for="email">Email:</label>
                <input
                    id="email"
                    type="email"
                    bind:value={email}
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
