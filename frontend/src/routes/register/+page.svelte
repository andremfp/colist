<script lang="ts">
    import { register } from '../../lib/api';
    import { goto } from '$app/navigation';
    import { darkMode } from '$lib/stores/darkModeStore';

    let username = '';
    let email = '';
    let password = '';

    async function handleRegister() {
    try {
        await register({ username, email, password });
        goto('/'); // Redirect to home page on successful registration
    } catch (error) {
        console.error('Registration error:', error);

        if (error instanceof Error) {
            showToast(error.message.split('. ')[0]);
        }

        clearForm();
    }
}

    function clearForm() {
        username = '';
        email = '';
        password = '';
    }

    function showToast(message: string) {
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.className = `${$darkMode ? 'bg-fail-toast-bg-dark' : 'bg-fail-toast-bg-light'} text-fail-toast-text fixed top-4 left-1/2 transform -translate-x-1/2 py-2 px-6 rounded-md shadow-lg backdrop-blur-md`;
        toast.style.whiteSpace = 'pre-line';
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.remove();
        }, 8000);
    }

    function goBack() {
        goto('/');
    }
</script>


<div class={$darkMode ? 'flex items-center justify-center bg-main-bg-dark text-text-dark' : 'flex items-center justify-center bg-main-bg-light text-text'}>
    <div class="w-full max-w-md flex flex-col items-center">
        <div class="w-full flex justify-start mb-6">
            <button on:click={goBack} class="text-lg font-bold">
                <span class="ri-arrow-left-line text-icon-large"></span>
            </button>
        </div>
        
        <div class={$darkMode ? 'w-full bg-login-bg-dark shadow-ios rounded-lg p-6' : 'w-full bg-login-bg-light shadow-ios rounded-lg p-6'}>
            <h1 class={$darkMode ? 'text-2xl font-bold mb-4 text-center text-text-dark' : 'text-2xl font-bold mb-4 text-center text-text-light'}>Register</h1>
            <form on:submit|preventDefault={handleRegister} class="space-y-4">
                <div>
                    <label class="block font-semibold mb-1" for="email">Email:</label>
                    <input
                        id="email"
                        type="text"
                        bind:value={email}
                        class={$darkMode ? 'w-full p-2 border rounded-md text-text-light focus:outline-none' : 'w-full p-2 border rounded-md text-text-light focus:outline-none focus:ring-1'}
                        required
                    />
                </div>
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
                        class={$darkMode ? 'mb-4 w-full p-2 border rounded-md text-text-light focus:outline-none focus:ring-1' : 'mb-4 w-full p-2 border rounded-md text-text-light focus:outline-none focus:ring-1'}
                        required
                    />
                </div>
                <div>
                    <button
                        type="submit"
                        class={$darkMode ? 'w-full py-2 bg-login-btn text-white rounded-md focus:outline-none focus:bg-login-btn-focus' : 'w-full py-2 bg-login-btn text-white rounded-md focus:outline-none focus:bg-login-btn-focus'}
                    >
                        Register
                    </button>
                </div>
            </form>
            
        </div>
    </div>
</div>
