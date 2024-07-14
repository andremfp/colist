<!-- src/routes/Register.svelte -->

<script>
    import { navigate } from 'svelte-routing';
    import { register } from '../../lib/api';

    let username = '';
    let email = '';
    let password = '';

    async function handleRegister() {
        try {
            await register({ username, email, password });
            navigate('/'); // Redirect to login page on successful registration
        } catch (error) {
            console.error('Registration error:', error);
            // Handle registration error, show message or retry logic
        }
    }
</script>

<!-- Registration form and UI -->
<form on:submit|preventDefault="{handleRegister}">
    <label>
        Email:
        <input type="email" bind:value="{email}" />
    </label>
    <label>
        Username:
        <input type="text" bind:value="{username}" />
    </label>
    <label>
        Password:
        <input type="password" bind:value="{password}" />
    </label>
    <button type="submit">Register</button>
</form>
