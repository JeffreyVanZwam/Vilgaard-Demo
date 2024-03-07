export default defineNuxtRouteMiddleware(async (to, from) => {
  if (!process.server) {
    const { $auth } = useNuxtApp();

    let user;
    await $auth().then(async (result) => {
      await result._initializationPromise.then(() => {
        user = result.currentUser;
      });
    });

    if (to.path != "/") {
      if (!user) {
        return navigateTo("/");
      }
    }
  }
});

// TODO: this middleware should check if the route that is accessed is also inside the accesslist of the current user. Right now it is only hidden for the user, but not blocked.
