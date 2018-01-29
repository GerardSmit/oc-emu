export interface IFileSystem {
    /**
     * Initializes the filesystem.
     */
    initialize(): Promise<void>

    /**
     * Get the used space.
     * 
     * @param size The size of the filesystem.
     */
    getSpaceUsed(): Promise<number>

    /**
     * Get the total space.
     * 
     * @param size The size of the filesystem.
     */
    getTotalSize(): Promise<number>

    /**
     * Get the size of the path.
     * 
     * @param path The path.
     */
    getSize(path: string): Promise<number>

    open(path: string, mode: string): Promise<number>

    read(handle: number, count: number): Promise<Uint8Array>

    write(handle: number, data: Uint8Array): Promise<Uint8Array>
}