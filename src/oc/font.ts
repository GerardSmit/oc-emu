export interface Color {
    r: number;
    g: number;
    b: number;
    a: number;
}

export class FontRenderer {
    private ctx: CanvasRenderingContext2D;

    /**
     * The cached fonts.
     */
    private cache: {[charCode: number]: ImageData} = {};

    /**
     * The raw data.
     */
    private rawData: {[charCode: number]: boolean[]} = {};
    
    /**
     * The foreground color.
     */
    public readonly foregroundColor: Color = {r: 255, g: 255, b: 255, a: 255};
    
    /**
     * The background color.
     */
    public readonly backgroundColor: Color = {r: 0, g: 0, b: 0, a: 255};
    
    /**
     * FontRenderer constructor.
     */
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

            if (!charData) {
                continue;
            }

            const charCode = parseInt(charCodeHex, 16);
            const bitData = [];

            let o = 0;
            for (let i = 0; i < charData.length; i += 2) {
                let c = parseInt(charData.substr(i, 2), 16) & 0xFF;

                for (let j = 0; j < 8; j++) {
                    bitData.push((c & 128) > 0);

                    o += 4;
                    c <<= 1;
                }
            }
            
            this.rawData[charCode] = bitData;
        }
    }

    setForeground(r: number, g: number, b: number) {
        this.foregroundColor.r = r;
        this.foregroundColor.g = g;
        this.foregroundColor.b = b;
        this.cache = {};
    }

    setForegroundAlpha(a: number) {
        this.foregroundColor.a = a;
        this.cache = {};
    }

    setBackground(r: number, g: number, b: number) {
        this.backgroundColor.r = r;
        this.backgroundColor.g = g;
        this.backgroundColor.b = b;
        this.cache = {};
    }

    setBackgroundAlpha(a: number) {
        this.backgroundColor.a = a;
        this.cache = {};
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

        const imageData = this.ctx.createImageData(8, 16);
        let o = 0;

        const bitData = this.rawData[charCode];
        for (let i = 0; i < bitData.length; i++) {

            if (bitData[i]) {
                imageData.data[o + 0] = this.foregroundColor.r;
                imageData.data[o + 1] = this.foregroundColor.g;
                imageData.data[o + 2] = this.foregroundColor.b;
                imageData.data[o + 3] = this.foregroundColor.a;
            } else {
                imageData.data[o + 0] = this.backgroundColor.r;
                imageData.data[o + 1] = this.backgroundColor.g;
                imageData.data[o + 2] = this.backgroundColor.b;
                imageData.data[o + 3] = this.backgroundColor.a;
            }

            o += 4;
        }

        this.cache[charCode] = imageData;

        return imageData;
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
            const data = this.getData(char);

            if (this.foregroundColor.a < 255 || this.backgroundColor.a < 255) {
                const oldData = ctx.getImageData(x, y, data.width, data.height);
                const finalData = this.ctx.createImageData(8, 16);

                for (let i = 0; i < data.data.length; i += 4) {
                    const percentage = data.data[i + 3] / 255;

                    finalData.data[i + 0] = (1 - percentage) * oldData.data[i + 0] + percentage * data.data[i + 0];
                    finalData.data[i + 1] = (1 - percentage) * oldData.data[i + 1] + percentage * data.data[i + 1];
                    finalData.data[i + 2] = (1 - percentage) * oldData.data[i + 2] + percentage * data.data[i + 2];
                    finalData.data[i + 3] = 255;
                }

                ctx.putImageData(finalData, x, y);
            } else {
                ctx.putImageData(data, x, y);
            }
                
            if (vertical) {
                y += 16
            } else{
                x += 8;
            }
        }
    }
}