if (/^file:\/\/\//.test(location.href)) {
    let path = './';
    let orig = fetch;
    window.fetch = (resource) => ((/^[^/:]*:/.test(resource)) ?
        orig(resource) :
        new Promise(function(resolve, reject) {
            let request = new XMLHttpRequest();

            let fail = (error) => {reject(error)};
            ['error', 'abort'].forEach((event) => { request.addEventListener(event, fail); });

            let pull = (expected) => (new Promise((resolve, reject) => {
                if (
                    request.responseType == expected ||
                    (expected == 'text' && !request.responseType)
                )
                    resolve(request.response);
                else
                    reject(request.responseType);
            }));

            request.addEventListener('load', () => (resolve({
                arrayBuffer : () => (pull('arraybuffer')),
                blob        : () => (pull('blob')),
                text        : () => (pull('text')),
                json        : () => (pull('json'))
            })));
            request.open('GET', resource.replace(/^\//, path));
            request.send();
        })
    );
}
