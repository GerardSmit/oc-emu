import { IFileSystem } from "./_filesystem";

export class ChromeFileSystem implements IFileSystem {
    private fs: FileSystem;
    private size: number;

    public constructor(size: number) {
        this.size = size;
    }

    /**
     * @inheritDoc
     */
    initialize(): Promise<void> {
        return new Promise((resolve, reject) => {
            window.webkitRequestFileSystem(window.PERSISTENT, this.size, 
                fs => {
                    this.fs = fs;
                    resolve();
                },
                reject
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
                reject
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

        });
    }
}