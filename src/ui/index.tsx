import * as React from "react";
import { Computer } from "../oc/computer";
import { FontRenderer } from "../oc/font";
import { EepromComponent } from "../oc/components/eeprom";
import { Screen } from "./components/screen";
import { GpuComponent } from "../oc/components";
import { computerApi, componentApi } from "../oc/api";
import { FileSystemComponent } from "../oc/components/filesystem";
import { ChromeFileSystem } from "../oc/filesystem/chrome";

export interface AppProps { fontRenderer: FontRenderer }

export class App extends React.Component<AppProps, {}> {
    private editor: AceAjax.Editor;
    private screen: Screen;
    private textArea: HTMLTextAreaElement;

    run() {
        const computer = new Computer();
        computer.register('computer', computerApi(computer));
        computer.register('component', componentApi(computer));
        computer.registerCompontent(new EepromComponent(() => this.editor.getValue()));
        computer.registerCompontent(new GpuComponent(this.screen));
        computer.registerCompontent(new FileSystemComponent(new ChromeFileSystem(1024 * 10)));
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
                <Screen fontRenderer={this.props.fontRenderer} ref={(screen) => this.screen = screen} />
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