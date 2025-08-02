<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import Tooltip from './Tooltip.svelte';

    export let data: any = {};
    export let readonly: boolean = false;

    const dispatch = createEventDispatcher();

    let filters = data.filters || [];
    let history = data.history || [{ dataCommand: null, deleteCommand: null, textProperty: '' }];

    function addFilter() {
        filters = [...filters, { id: '', name: '', screenId: '' }];
        updateData();
    }

    function removeFilter(index: number) {
        filters = filters.filter((_, i) => i !== index);
        updateData();
    }

    function updateFilter(index: number, field: string, value: string) {
        filters[index] = { ...filters[index], [field]: value };
        updateData();
    }

    function addHistoryEntry() {
        history = [...history, { dataCommand: null, deleteCommand: null, textProperty: '' }];
        updateData();
    }

    function removeHistoryEntry(index: number) {
        history = history.filter((_, i) => i !== index);
        updateData();
    }

    function updateHistoryEntry(index: number, field: string, value: any) {
        history[index] = { ...history[index], [field]: value };
        updateData();
    }

    function updateData() {
        data = { filters, history };
        dispatch('change', data);
    }

    $: if (data) {
        filters = data.filters || [];
        history = data.history || [{ dataCommand: null, deleteCommand: null, textProperty: '' }];
    }
</script>

<main>
    <form class="page-wide" on:submit|preventDefault={() => {}}>
        <h3>Search Configuration</h3>
        
        <!-- Filters Section -->
        <div class="parameters">
            <div class="toolbar">
                <h4>Filters</h4>
                <div></div>
                <div class="actions">
                    <Tooltip text="Define search filters that allow users to filter content by different categories">
                        <button class="round-button" disabled={readonly}>?</button>
                    </Tooltip>
                    {#if !readonly}
                        <button type="button" on:click={addFilter}>+ Add Filter</button>
                    {/if}
                </div>
            </div>
            
            {#if filters.length === 0}
                <p>No filters defined. Add filters to enable search functionality.</p>
            {:else}
                {#each filters as filter, index}
                    <div class="parameter">
                        <span>Filter {index + 1}</span>
                        {#if !readonly}
                            <button type="button" class="btn-sm" on:click={() => removeFilter(index)}>×</button>
                        {/if}
                    </div>
                    
                    <div class="parameters">
                        <label for="filter-id-{index}">ID:</label>
                        <input 
                            id="filter-id-{index}"
                            type="text" 
                            value={filter.id}
                            on:input={(e) => updateFilter(index, 'id', e.target.value)}
                            disabled={readonly}
                            placeholder="e.g., All, Artists, Albums"
                        />
                        
                        <label for="filter-name-{index}">Name:</label>
                        <input 
                            id="filter-name-{index}"
                            type="text" 
                            value={filter.name}
                            on:input={(e) => updateFilter(index, 'name', e.target.value)}
                            disabled={readonly}
                            placeholder="e.g., All, Artists, Albums"
                        />
                        
                        <label for="filter-screen-{index}">Screen ID:</label>
                        <input 
                            id="filter-screen-{index}"
                            type="text" 
                            value={filter.screenId}
                            on:input={(e) => updateFilter(index, 'screenId', e.target.value)}
                            disabled={readonly}
                            placeholder="e.g., SearchAll"
                        />
                    </div>
                {/each}
            {/if}
        </div>

        <!-- History Section -->
        <div class="parameters">
            <div class="toolbar">
                <h4>History</h4>
                <div></div>
                <div class="actions">
                    <Tooltip text="Configure search history functionality with data and delete commands">
                        <button class="round-button" disabled={readonly}>?</button>
                    </Tooltip>
                    {#if !readonly}
                        <button type="button" on:click={addHistoryEntry}>+ Add History Entry</button>
                    {/if}
                </div>
            </div>
            
            {#if history.length === 0}
                <p>No history entries defined. Add history entries to enable search history functionality.</p>
            {:else}
                {#each history as entry, index}
                    <div class="parameter">
                        <span>History Entry {index + 1}</span>
                        {#if !readonly}
                            <button type="button" class="btn-sm" on:click={() => removeHistoryEntry(index)}>×</button>
                        {/if}
                    </div>
                    
                    <div class="parameters">
                        <!-- Data Command Section -->
                        <h5>Data Command</h5>
                        <label for="data-command-name-{index}">Name:</label>
                        <input 
                            id="data-command-name-{index}"
                            type="text" 
                            value={entry.dataCommand?.name || ''}
                            on:input={(e) => updateHistoryEntry(index, 'dataCommand', { ...entry.dataCommand, name: e.target.value })}
                            disabled={readonly}
                            placeholder="e.g., getData"
                        />
                        
                        <label for="data-command-type-{index}">Type:</label>
                        <input 
                            id="data-command-type-{index}"
                            type="text" 
                            value={entry.dataCommand?.type || ''}
                            on:input={(e) => updateHistoryEntry(index, 'dataCommand', { ...entry.dataCommand, type: e.target.value })}
                            disabled={readonly}
                            placeholder="e.g., PROTOCOL"
                        />
                        
                        <!-- Parameters -->
                        <div class="parameters">
                            <h6>Parameters</h6>
                            {#if entry.dataCommand?.params}
                                {#each entry.dataCommand.params as param, paramIndex}
                                    <div class="parameter">
                                        <label for="param-name-{index}-{paramIndex}">Name:</label>
                                        <input 
                                            id="param-name-{index}-{paramIndex}"
                                            type="text" 
                                            value={param.name}
                                            on:input={(e) => {
                                                const newParams = [...entry.dataCommand.params];
                                                newParams[paramIndex] = { ...param, name: e.target.value };
                                                updateHistoryEntry(index, 'dataCommand', { ...entry.dataCommand, params: newParams });
                                            }}
                                            disabled={readonly}
                                        />
                                        
                                        <label for="param-type-{index}-{paramIndex}">Type:</label>
                                        <input 
                                            id="param-type-{index}-{paramIndex}"
                                            type="text" 
                                            value={param.type}
                                            on:input={(e) => {
                                                const newParams = [...entry.dataCommand.params];
                                                newParams[paramIndex] = { ...param, type: e.target.value };
                                                updateHistoryEntry(index, 'dataCommand', { ...entry.dataCommand, params: newParams });
                                            }}
                                            disabled={readonly}
                                        />
                                        
                                        <label for="param-value-{index}-{paramIndex}">Value:</label>
                                        <input 
                                            id="param-value-{index}-{paramIndex}"
                                            type="text" 
                                            value={param.value || ''}
                                            on:input={(e) => {
                                                const newParams = [...entry.dataCommand.params];
                                                newParams[paramIndex] = { ...param, value: e.target.value };
                                                updateHistoryEntry(index, 'dataCommand', { ...entry.dataCommand, params: newParams });
                                            }}
                                            disabled={readonly}
                                        />
                                    </div>
                                {/each}
                            {/if}
                            
                            {#if !readonly}
                                <button type="button" on:click={() => {
                                    const newParams = [...(entry.dataCommand?.params || []), { name: '', type: '', value: '' }];
                                    updateHistoryEntry(index, 'dataCommand', { ...entry.dataCommand, params: newParams });
                                }}>+ Add Parameter</button>
                            {/if}
                        </div>
                        
                        <!-- Delete Command Section -->
                        <h5>Delete Command</h5>
                        <label for="delete-command-name-{index}">Name:</label>
                        <input 
                            id="delete-command-name-{index}"
                            type="text" 
                            value={entry.deleteCommand?.name || ''}
                            on:input={(e) => updateHistoryEntry(index, 'deleteCommand', { ...entry.deleteCommand, name: e.target.value })}
                            disabled={readonly}
                            placeholder="e.g., deleteSearchHistory"
                        />
                        
                        <label for="delete-command-type-{index}">Type:</label>
                        <input 
                            id="delete-command-type-{index}"
                            type="text" 
                            value={entry.deleteCommand?.type || ''}
                            on:input={(e) => updateHistoryEntry(index, 'deleteCommand', { ...entry.deleteCommand, type: e.target.value })}
                            disabled={readonly}
                            placeholder="e.g., PROTOCOL"
                        />
                        
                        <label for="text-property-{index}">Text Property:</label>
                        <input 
                            id="text-property-{index}"
                            type="text" 
                            value={entry.textProperty || ''}
                            on:input={(e) => updateHistoryEntry(index, 'textProperty', e.target.value)}
                            disabled={readonly}
                            placeholder="e.g., name"
                        />
                    </div>
                {/each}
            {/if}
        </div>
    </form>
</main>

<style>
</style> 