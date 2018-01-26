import * as React from "react";
import { Computer } from "../oc/computer";
import { FontRenderer } from "../oc/font";
import { EepromComponent } from "../oc/components/eeprom";

export interface AppProps { fontRenderer: FontRenderer }

export class App extends React.Component<AppProps, {}> {
    private editor: AceAjax.Editor;
    private canvas: HTMLCanvasElement;
    private textArea: HTMLTextAreaElement;

    run() {
        const computer = new Computer(this.canvas, this.props.fontRenderer);
        Computer.registerGlobals(computer);
        computer.registerCompontent(new EepromComponent(() => this.editor.getValue()));
        computer.start();
    }

    componentDidMount() {
        this.editor = ace.edit(this.textArea);
        this.editor.setOption('theme', 'ace/theme/gruvbox');
        this.editor.setOption('mode', 'ace/mode/lua');
        this.editor.setOption('showPrintMargin', false);
        this.editor.setValue(require('../lua/bios.lua'), 1);
        this.editor.commands.addCommand({
            name: "run",
            bindKey: { win: "alt-Enter" },
            exec: () => this.run()
        });

        this.run();
    }

    render() {
        return <div className="app">
            <div className="app__left">
                <canvas ref={(canvas) => this.canvas = canvas} />
            </div>
            <div className="app__right">
                <textarea ref={(textArea) => this.textArea = textArea} />
                <div className="bar">
                    <button className="bar__button" onClick={() => this.run()}>Run</button>
                </div>
            </div>
        </div>;
    }
}