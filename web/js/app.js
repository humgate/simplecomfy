import * as comfyapi from "./comfyapi.js";

(async (window, document, undefined) => {
    // UUID generator
    const client_id = comfyapi.uuidv4();

    // Load the workflow
    const style_workflow = '/simplecomfy/js/regen_bg_styled_workflow_api.json';
    const workflow = await comfyapi.loadWorkflow(style_workflow);
    console.log(workflow);

    // WebSocket
    const server_address = window.location.hostname + ':' + window.location.port;
    const socket = new WebSocket('wss://' + server_address + '/ws?clientId=' + client_id);
    socket.addEventListener('open', (event) => {
        console.log('Connected to the server');
    });

    //Listener
    socket.addEventListener('message', (event) => {
        const data = JSON.parse(event.data);
        if (data.type !== 'crystools.monitor'){
            console.log(event);
        } 

        if (data.type === 'execution_start') {
             _queue_btn.disabled = true;
             _queue_btn.textContent = 'Preprocessing...'
        };

        if (data.type === 'progress') {
               _queue_btn.textContent = Math.floor(100*(data['data']['value'])/(data['data']['max'])) + "%"; // progress %
        };

        if (data.type === 'executed' && data.data.node === '124') {
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
    const _style_img_input = document.getElementById('style_img_file');
    const _doll_img_input = document.getElementById('doll_img_file');

    _queue_btn.onclick = function () {
        if (_prompt.value !== "") {
            workflow["22"]["inputs"]["text"] = _prompt.value;
        }
        workflow["3"]["inputs"]["seed"] = Math.floor(Math.random() * 9999999999);
        comfyapi.queue_prompt(workflow, client_id);
    };

    _style_img_input.onchange = function (event) {
        comfyapi.uploadFile(_style_img_input.files[0], workflow, "49", true);
    }

    _doll_img_input.onchange = function (event) {
        comfyapi.uploadFile(_doll_img_input.files[0], workflow, "12", true);
    }

})(window, document, undefined);
