export async function loadWorkflow(workflow) {
    const response = await fetch(workflow);
    return await response.json(workflow);
}

export function uuidv4() { return (
    [1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,
    c => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16));
}

export async function queue_prompt(prompt = {}, client_id) {
    const data = { 'prompt': prompt, 'client_id': client_id };
    const response = await fetch('/prompt', {
        method: 'POST',
        cache: 'no-cache',
        headers: {
           'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
}

export async function uploadFile(file, workflow, updateNode, pasted = false) {
  	try {
        // Wrap file in formdata so it includes filename
        const body = new FormData();
	    body.append("image", file);
	    const resp = await fetch("/upload/image", {
	        method: "POST",
	        body,
	    });

	    if (resp.status === 200) {
            console.log("Image " + file.name +  " uploaded.");
            workflow[updateNode]["inputs"]["image"] = file.name;
        } else {
	        alert(resp.status + " - " + resp.statusText);
	    }
	} catch (error) {
	        alert(error);
	}
}