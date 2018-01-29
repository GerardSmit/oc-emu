import { IFileSystem } from "./_filesystem";

interface ChromeFileHandle {
    path: string
    offset: number
    data?: Uint8Array
    writer?: FileWriter
}

export class ChromeFileSystem implements IFileSystem {
    private fs: FileSystem;
    private size: number;
    private handleCounter: number = 0;
    private handles: {[key: number]: ChromeFileHandle} = {}

    public constructor(size: number) {
        this.size = size;
    }

    /**
     * @inheritDoc
     */
    initialize(): Promise<void> {
        return new Promise((resolve, reject) => {
            window.webkitRequestFileSystem(window.TEMPORARY, this.size, 
                fs => {
                    this.fs = fs;
                    resolve();
                },
                () => reject('Could not initialize the Chrome FileSystem API.')
            );
        });
    }

    /**
     * @inheritDoc
     */
    getSpaceUsed(): Promise<number> {
        return new Promise((resolve, reject) => {
            this.fs.root.getMetadata(
                meta => resolve(meta.size),
                () => reject('The metedata could not be found.')
            )
        });
    }

    getTotalSize(): Promise<number> {
        return Promise.resolve(this.size); 
    }

    /**
     * @inheritDoc
     */
    getSize(path: string): Promise<number> {
        return new Promise((resolve, reject) => {
            this.fs.root
        });
    }
    
    open(path: string, mode: string): Promise<number> {
        return new Promise((resolve, reject) => {
            const errorHandler = (e: ErrorCallback) => {
                console.error(e);
            };

            this.fs.root.getFile(path, {create: true}, (fileEntry) => {
                const id = this.handleCounter++;
                const handle: ChromeFileHandle = { path, offset: 0 };
                this.handles[id] = handle;

                fileEntry.file((entry) => {
                    const promises: Promise<void>[] = [];

                    if (mode.includes('r')) {
                        promises.push(new Promise(resolve => {
                            var reader = new FileReader();
    
                            reader.onloadend = (e) => {
                               handle.data = new Uint8Array(reader.result);
                               resolve()
                            };
        
                            reader.readAsArrayBuffer(entry);
                        }))
                    }

                    if (mode.includes('w')) {
                        promises.push(new Promise(resolve => {
                            fileEntry.createWriter(function(fileWriter) {
                                handle.writer = fileWriter;
                                resolve()
                            });
                        }));
                    }

                    Promise.all(promises).then(() => resolve(id));
                }, errorHandler);
            }, errorHandler);
        });
    }
    
    read(handle: number, count: number): Promise<Uint8Array> {
        return new Promise((resolve, reject) => {
            const file = this.handles[handle];
            var reader = new FileReader();

            const result = new Uint8Array(file.data.slice(file.offset, file.offset + count));
            file.offset += count;
            resolve(result);
        });
    }
    
    write(handle: number, data: Uint8Array): Promise<Uint8Array> {
        return new Promise((resolve, reject) => {
            const file = this.handles[handle];

            file.writer.onwriteend = () => {
                resolve();
            }

            file.writer.write(new Blob([data], {type: 'text/plain'}));

            if (file.data) {
                var newData = new Uint8Array(file.data.length + data.length);
                newData.set(file.data);
                newData.set(data, file.data.length);
                file.data = newData
            }
        });
    }
}