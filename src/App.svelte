<script>
  import { onMount } from "svelte";
  import http from "./request-helper";
  import OperationDocsStore from "./operationDocsStore";
  import auth from "./authService";
  import {
    isAuthenticated,
    user,
    students,
    token,
    error,
    requestCounter,
  } from "./store";
  let auth0Client;
  let online;
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
      try {
        const result = await http.startFetchMyQuery(
          OperationDocsStore.getAll(),
        );
        students.set(result.students);
      } catch (e) {
        error.set(e.message);
      }
    }
  });
  const studentInfo = {};
  const addstudent = async () => {
    const { name } = studentInfo;
    try {
      const { insert_students } = await http.startExecuteMyMutation(
        OperationDocsStore.addOne(name),
      );
      students.update((n) => [...n, insert_students.returning[0]]);
    } catch (e) {
      error.set(e.message);
    }
  };

  const deletestudent = async (id) => {
    try {
      await http.startExecuteMyMutation(OperationDocsStore.deleteById(id));
      students.update((n) => n.filter((item) => item.id !== id));
    } catch (e) {
      error.set(e.message);
    }
  };

  function login() {
    auth.loginWithPopup(auth0Client);
  }

  function logout() {
    auth.logout(auth0Client);
  }
</script>

<svelte:window bind:online />
<main>
  {#if !online}
    <h1>Offline</h1>
  {:else if $isAuthenticated}
    {#if $students.loading || $requestCounter}
      <h1>Loading...</h1>
    {:else if $students.error || $error}
      <h1>{$students.error || $error}</h1>
    {:else}
      <button on:click={logout}>Log out</button>
      <input placeholder="Input value" bind:value={studentInfo.name} />
      <button on:click={addstudent}>Add new student</button>

      {#each $students as student (student.id)}
        <div>
          <p>Student name: {student.name}</p>
          <p>Teacher id: {student.teacher_id}</p>
          <button on:click={() => deletestudent(student.id)}
            >Delete student</button
          >
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
