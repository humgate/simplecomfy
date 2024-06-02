(async (window, document, undefined) => {

    // UUID generator
    function uuidv4() { return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)); }
    const client_id = uuidv4();

    // Load the workflow
    const style_workflow = '/simplecomfy/js/style_workflow_api.json';
    const normal_workflow = '/simplecomfy/js/normal_workflow_api.json';
    async function loadWorkflow() {
        const response = await fetch('/simplecomfy/js/normal_workflow_api.json');
        return await response.json();
    }
    const workflow = await loadWorkflow();
    console.log(workflow);

    // WebSocket
    const server_address = window.location.hostname + ':' + window.location.port;
    const socket = new WebSocket('ws://' + server_address + '/ws?clientId=' + client_id);
    socket.addEventListener('open', (event) => {
        console.log('Connected to the server');
    });

    //Listener
    socket.addEventListener('message', (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'progress') {
        _queue_btn.disabled = true;
        _queue_btn.textContent = 100*(data['data']['value'])/(data['data']['max']) + "%"; // progress %
        };

        if (data.type === 'executed') {
            if ('images' in data['data']['output']) {
                const image = data['data']['output']['images'][0];
                const filename = image['filename']
                const subfolder = image['subfolder']
                const rand = Math.random();
                _queue_btn.textContent = "Generate";
                _queue_btn.disabled = false;
                _maingen.src = '/view?filename=' + filename + '&type=output&subfolder=' + subfolder + '&rand=' + rand
            }
        }
    });

    const _maingen = document.getElementById('maingen');
    const _queue_btn = document.getElementById("queue_btn");
    const _prompt = document.getElementById('prompt');

    _queue_btn.onclick = function () {
         queue_prompt(workflow);
    };

    //Post queue request
    async function queue_prompt(prompt = {}) {
        const data = { 'prompt': prompt, 'client_id': client_id };
        workflow["22"]["inputs"]["text"] = _prompt.value;
        workflow["118"]["inputs"]["seed"] = Math.floor(Math.random() * 9999999999);

        const response = await fetch('/prompt', {
            method: 'POST',
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
    }

})(window, document, undefined);
