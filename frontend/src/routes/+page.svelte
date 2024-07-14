<!-- src/routes/index.svelte -->

<script>
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

<!-- Login form and UI -->
<form on:submit="{handleLogin}">
    <label>
        Username:
        <input type="text" bind:value="{username}" />
    </label>
    <label>
        Password:
        <input type="password" bind:value="{password}" />
    </label>
    <button type="submit">Login</button>
</form>

<!-- Register button -->
<a href="/register">Register</a>
