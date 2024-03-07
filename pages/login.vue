<template>
  <form @submit.prevent="handleSubmit" class="">
    <h3>Login</h3>

    <label for="email">Email:</label>
    <input type="email" name="email" v-model="email" required />

    <label for="password">Password: </label>
    <input type="password" name="password" v-model="password" required />

    <button>Login</button>
    <div class="text-red-500" v-if="error">{{ error }}</div>
  </form>
</template>
  
  <script>
import { signInWithEmailAndPassword } from "firebase/auth";

export default {
  setup() {
    const router = useRouter();

    const email = ref("");
    const password = ref("");
    const error = ref(null);
    const { $authDirect } = useNuxtApp();

    const handleSubmit = async () => {
      try {
        await signInWithEmailAndPassword(
          $authDirect(),
          email.value,
          password.value
        );

        router.push("/dashboard");
      } catch (err) {
        error.value = err.message;
      }
    };

    return { handleSubmit, email, password, error };
  },
};
</script>
  
  <style>
</style>