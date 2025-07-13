<script>
  //@ts-expect-error Automatically included by vscode
  const vscode = acquireVsCodeApi();

  const buttonTypes = [
    { name: "Play", value: "PLAY" },
    { name: "Pause", value: "PAUSE" },
    { name: "Stop", value: "STOP" },
    { name: "Skip Reverse", value: "SKIP_REV" },
    { name: "Skip Forward", value: "SKIP_FWD" },
    { name: "Custom", value: "CUSTOM" }
  ];

  const commandTypes = [
    { name: "Protocol", value: "PROTOCOL" },
    { name: "Room", value: "ROOM" }
  ];

  const paramTypes = [
    { name: "Default", value: "DEFAULT" },
    { name: "First Selected", value: "FIRST_SELECTED" },
    { name: "Data Offset", value: "DATA_OFFSET" },
    { name: "Data Page", value: "DATA_PAGE" },
    { name: "Data Count", value: "DATA_COUNT" },
    { name: "Search", value: "SEARCH" },
    { name: "Search Filter", value: "SEARCH_FILTER" },
    { name: "System", value: "SYSTEM" }
  ];

  const d = {
    id: "",
    buttonType: "PLAY",
    name: "",
    iconId: "",
    releaseCommand: {
      name: "",
      type: "PROTOCOL",
      params: []
    }
  };

  import { onDestroy, onMount } from "svelte";

  let first;
  let formType = vscode.getState()?.formType || "create";
  let value = vscode.getState()?.value || d;
  let newInput;

  onMount(async () => {
    let state = vscode.getState();

    first.focus();

    if (state && state.value) {
      value = state.value;
    }

    if (state && state.formType) {
      formType = state.formType;
    }
  });

  onDestroy(() => {
    console.log("Destroy");
  });

  $: {
    vscode.setState({ value, formType });
  }

  window.addEventListener("message", async (event) => {
    console.log("MESSAGE");
    console.log(event);

    const message = event.data;
    switch (message.command) {
      case "update":
        value = message.value;
        formType = "update";

        vscode.setState({ value, formType });

        return;
      case "create":
        // Reset the value to an empty object
        value = {};

        // Assign the default value values
        Object.assign(value, d);

        formType = "create";

        vscode.setState({ value, formType });

        return;
    }
  });

  function addParameter() {
    if (!value.releaseCommand.params) {
      value.releaseCommand.params = [];
    }
    value.releaseCommand.params.push({
      name: "",
      type: "DEFAULT",
      value: ""
    });
    value.releaseCommand.params = value.releaseCommand.params;
  }

  function removeParameter(index) {
    value.releaseCommand.params.splice(index, 1);
    value.releaseCommand.params = value.releaseCommand.params;
  }

  function submit() {
    vscode.postMessage({ type: formType, value: value });
  }
</script>

<main>
  <form on:submit|preventDefault={submit}>
    <h1>{formType.charAt(0).toUpperCase() + formType.slice(1)} Transport Control</h1>

    <div class="form-group">
      <label for="id">ID:</label>
      <input id="id" bind:value={value.id} required />
    </div>

    <div class="form-group">
      <label for="buttonType">Button Type:</label>
      <select id="buttonType" bind:value={value.buttonType} required>
        {#each buttonTypes as type}
          <option value={type.value}>{type.name}</option>
        {/each}
      </select>
    </div>

    {#if value.buttonType === "CUSTOM"}
      <div class="form-group">
        <label for="name">Name:</label>
        <input id="name" bind:value={value.name} required />
      </div>

      <div class="form-group">
        <label for="iconId">Icon ID:</label>
        <input id="iconId" bind:value={value.iconId} required />
      </div>
    {/if}

    <h2>Release Command</h2>

    <div class="form-group">
      <label for="commandName">Command Name:</label>
      <input id="commandName" bind:value={value.releaseCommand.name} required />
    </div>

    <div class="form-group">
      <label for="commandType">Command Type:</label>
      <select id="commandType" bind:value={value.releaseCommand.type} required>
        {#each commandTypes as type}
          <option value={type.value}>{type.name}</option>
        {/each}
      </select>
    </div>

    <h3>Parameters</h3>
    <button type="button" on:click={addParameter}>Add Parameter</button>

    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Type</th>
          <th>Value</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {#each value.releaseCommand.params || [] as param, index}
          <tr>
            <td>
              <input name="name" type="text" bind:value={param.name} />
            </td>
            <td>
              <select name="type" bind:value={param.type}>
                {#each paramTypes as p}
                  <option value={p.value}>{p.name}</option>
                {/each}
              </select>
            </td>
            <td>
              <input name="value" type="text" bind:value={param.value} />
            </td>
            <td class="align-center">
              <button type="button" class="round-button" on:click|preventDefault={() => removeParameter(index)}>-</button>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>

    <button type="submit">
      {formType.charAt(0).toUpperCase() + formType.slice(1)}
    </button>
  </form>
</main> 