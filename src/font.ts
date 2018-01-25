export class FontRenderer {
    private ctx: CanvasRenderingContext2D;

    /**
     * The scale of the font.
     */
    public scale = 1;

    /**
     * The cached fonts.
     */
    private cache: {[charCode: number]: ImageData} = {};

    /**
     * The raw data.
     */
    private rawData: {[charCode: number]: string} = {};
    
    public constructor() {
        this.ctx = document.createElement('canvas').getContext('2d');
    }

    /**
     * Load the font.
     */
    public async load() {
        const res = await fetch('https://raw.githubusercontent.com/MightyPirates/OpenComputers/master-MC1.7.10/src/main/resources/assets/opencomputers/font.hex');
        const data = await res.text();

        for (let line of data.split('\n')) {
            const [charCodeHex, charData] = line.split(':');
            const charCode = parseInt(charCodeHex, 16);
            this.rawData[charCode] = charData;
        }
    }

    /**
     * Scale the given data.
     * 
     * @param ctx The context.
     * @param imageData The image data.
     * @param scale The scale.
     */
    private static scaleData(ctx: CanvasRenderingContext2D, imageData: ImageData, scale: number) {
        if (scale === 1) {
            return imageData;
        }

        const scaled = ctx.createImageData(imageData.width * scale, imageData.height * scale);

        for (var row = 0; row < imageData.height; row++) {
            for (var col = 0; col < imageData.width; col++) {
                var sourcePixel = [
                    imageData.data[(row * imageData.width + col) * 4 + 0],
                    imageData.data[(row * imageData.width + col) * 4 + 1],
                    imageData.data[(row * imageData.width + col) * 4 + 2],
                    imageData.data[(row * imageData.width + col) * 4 + 3]
                ];

                for (var y = 0; y < scale; y++) {
                    var destRow = row * scale + y;
                    for (var x = 0; x < scale; x++) {
                        var destCol = col * scale + x;

                        for (var i = 0; i < 4; i++) {
                            scaled.data[(destRow * scaled.width + destCol) * 4 + i] = sourcePixel[i];
                        }
                    }
                }
            }
        }

        return scaled;
    }

    /**
     * Parse the char data.
     * 
     * @param charData The char data.
     * @returns The image data.
     */
    private convertData(charData: string) {
        const imageData = this.ctx.createImageData(8, 16);
        let o = 0;

        for (let i = 0; i < charData.length; i += 2) {
            let c = parseInt(charData.substr(i, 2), 16) & 0xFF;

            for (let j = 0; j < 8; j++) {
                if (c & 128) {
                    imageData.data[o + 0] = 0;
                    imageData.data[o + 1] = 0;
                    imageData.data[o + 2] = 0;
                    imageData.data[o + 3] = 255;
                }

                o += 4;
                c <<= 1;
            }
        }

        return FontRenderer.scaleData(this.ctx, imageData, this.scale);
    }

    /**
     * Get the data of the char code.
     * 
     * @param char The char.
     */
    public getData(char: string) {
        const charCode = char.charCodeAt(0);

        if (this.cache[charCode]) {
            return this.cache[charCode];
        }

        const data = this.convertData(this.rawData[charCode]);
        this.cache[charCode] = data;
        return data;
    }

    /**
     * 
     * @param x The X-coord.
     * @param y The Y-coord.
     * @param text The text.
     */
    public render(ctx: CanvasRenderingContext2D, x: number, y: number, text: string, vertical: boolean = false) {
        for (let i = 0; i < text.length; i++) {
            const char = text.charAt(i);
            
            if (char === '\n') {
                if(vertical) {
                    y = 0;
                    x++;
                } else {
                    x = 0;
                    y++;
                }
            } else {
                ctx.putImageData(this.getData(char), x * 8 * this.scale, y * 16 * this.scale);
                
                if (vertical) {
                    y++
                } else{
                    x++;
                }
            }
        }
    }
}