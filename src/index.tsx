import "./scss/style.scss";
import { FontRenderer } from './oc/font';
import { App } from './ui';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

async function init() {
    const fontRenderer = new FontRenderer();
    await fontRenderer.load();

    // const computer = new Computer(canvas, fontRenderer);
    // Computer.registerGlobals(computer);

    // computer.run(require('./lua/boot.lua'))

    const root = document.createElement('div');
    root.id = 'root';
    document.body.appendChild(root);

    ReactDOM.render(<App fontRenderer={fontRenderer} />, root);
}

init();