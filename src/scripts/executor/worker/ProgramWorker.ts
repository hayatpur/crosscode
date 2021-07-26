export class ProgramWorker {
    data: { storage: any[]; logs: any[]; errors: any[] };
    worker: any;
    running: boolean;
    onFinishCallbacks: (() => void)[] = [];

    constructor() {
        this.data = { storage: [], logs: [], errors: [] };
    }

    setup(code: BlobPart) {
        if (this.worker != null) {
            this.worker.terminate();
        }

        // Reset
        this.data = { storage: [], logs: [], errors: [] };
        this.running = true;

        // Initialize web-worker
        const blob = new Blob([code]);
        const blobURL = window.URL.createObjectURL(blob);
        this.worker = new Worker(blobURL);
        this.worker.postMessage('');

        // Bindings to this
        const programWorker = this;

        this.worker.onmessage = (event: { data: string }) => {
            const msg = JSON.parse(event.data);

            switch (msg.type) {
                case 'meta':
                    programWorker.data.storage.push(msg);
                    break;
                case 'log':
                    programWorker.data.logs.push(msg);
                    break;
                case 'error':
                    programWorker.data.errors.push(msg);
                    break;
                case 'finished':
                    programWorker.finished();
                    break;
                default:
                    console.warn(`Unrecognized message type from program: ${msg.type}`);
            }
        };
    }

    registerOnFinish(callback: () => void) {
        this.onFinishCallbacks.push(callback);
    }

    finished() {
        this.running = false;

        if (this.data.errors.length > 0) {
            console.warn(this.data.errors[0].data);
        }

        this.worker.terminate();

        for (const callback of this.onFinishCallbacks) {
            callback();
        }
    }
}
