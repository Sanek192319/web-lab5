<script>
  import { onMount } from "svelte";
  import http from "./request-helper";
  import OperationDocsStore from "./operationDocsStore";
  import auth from "./authService";
  import { isAuthenticated, user, students, token } from "./store";
  let auth0Client;

  onMount(async () => {
    auth0Client = await auth.createClient();

    isAuthenticated.set(await auth0Client.isAuthenticated());
    user.set(await auth0Client.getUser());
    if (isAuthenticated) {
      const accessToken = await auth0Client.getIdTokenClaims();
      if (accessToken) token.set(accessToken.__raw);
    }
  });
  token.subscribe(async (value) => {
    if (value) {
      const result = await http.startFetchMyQuery(OperationDocsStore.getAll());
      students.set(result.students);
    }
  });
  const addstudent = async () => {
    const name = prompt("name") || "";
    const { insert_students } = await http.startExecuteMyMutation(
      OperationDocsStore.addOne(name),
    );
    students.update((n) => [...n, insert_students.returning[0]]);
  };

  const deletestudent = async () => {
    const name = prompt("which student to delete?") || "";
    if (name) {
      await http.startExecuteMyMutation(OperationDocsStore.deleteByName(name));
    }
    students.update((n) => n.filter((item) => item.name !== name));
  };

  function login() {
    auth.loginWithPopup(auth0Client);
  }

  function logout() {
    auth.logout(auth0Client);
  }
</script>

<main>
  {#if $isAuthenticated}
    {#if $students.loading}
      <h1>Loading...</h1>
    {:else if $students.error}
      <h1>{$students.error}</h1>
    {:else}
      <button on:click={logout}>Log out</button>
      <button on:click={addstudent}>Add new student</button>
      <button on:click={deletestudent}>Delete student</button>

      {#each $students as student}
        <div>
          <p>Student name: {student.name}</p>
          <p>Teacher id: {student.teacher_id}</p>
          <hr />
        </div>
      {/each}
    {/if}
  {:else}
    <button on:click={login}>Log in</button>
  {/if}
</main>

<style>
  main {
    margin: 0;
    padding: 0;
  }
</style>
