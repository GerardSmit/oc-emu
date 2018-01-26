export interface Color {
    r: number;
    g: number;
    b: number;
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
    private foregroundColor: Color = {r: 255, g: 255, b: 255};
    
    /**
     * The background color.
     */
    private backgroundColor: Color = {r: 0, g: 0, b: 0};
    
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

    setBackground(r: number, g: number, b: number) {
        this.backgroundColor.r = r;
        this.backgroundColor.g = g;
        this.backgroundColor.b = b;
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
                imageData.data[o + 3] = 255;
            } else {
                imageData.data[o + 0] = this.backgroundColor.r;
                imageData.data[o + 1] = this.backgroundColor.g;
                imageData.data[o + 2] = this.backgroundColor.b;
                imageData.data[o + 3] = 255;
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
            
            if (char === '\n' || char === '\r') {
                if(vertical) {
                    y = 0;
                    x++;
                } else {
                    x = 0;
                    y++;
                }
            } else {
                ctx.putImageData(this.getData(char), x * 8, y * 16);
                
                if (vertical) {
                    y++
                } else{
                    x++;
                }
            }
        }
    }
}