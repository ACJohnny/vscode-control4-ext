"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const C4InterfaceTransport_1 = require("../src/control4/interface/C4InterfaceTransport");
const C4InterfaceCommand_1 = require("../src/control4/interface/C4InterfaceCommand");
const C4UI_1 = require("../src/control4/C4UI");
describe('Dashboard Implementation', () => {
    test('should create a transport control with proper XML structure', () => {
        const transport = new C4InterfaceTransport_1.C4InterfaceTransport();
        transport.id = 'Play';
        transport.buttonType = 'PLAY';
        const releaseCommand = new C4InterfaceCommand_1.C4InterfaceCommand();
        releaseCommand.name = 'PLAY';
        releaseCommand.type = 'ROOM';
        transport.releaseCommand = releaseCommand;
        const xml = transport.toXml();
        expect(xml.getChild('Id')?.text).toBe('Play');
        expect(xml.getChild('ButtonType')?.text).toBe('PLAY');
        expect(xml.getChild('ReleaseCommand')?.getChild('Name')?.text).toBe('PLAY');
        expect(xml.getChild('ReleaseCommand')?.getChild('Type')?.text).toBe('ROOM');
    });
    test('should create a custom transport control with name and icon', () => {
        const transport = new C4InterfaceTransport_1.C4InterfaceTransport();
        transport.id = 'ShuffleOn';
        transport.buttonType = 'CUSTOM';
        transport.name = 'Turn Shuffle On';
        transport.iconId = 'amt_shuffle';
        const releaseCommand = new C4InterfaceCommand_1.C4InterfaceCommand();
        releaseCommand.name = 'ToggleShuffle';
        releaseCommand.type = 'PROTOCOL';
        transport.releaseCommand = releaseCommand;
        const xml = transport.toXml();
        expect(xml.getChild('Id')?.text).toBe('ShuffleOn');
        expect(xml.getChild('ButtonType')?.text).toBe('CUSTOM');
        expect(xml.getChild('Name')?.text).toBe('Turn Shuffle On');
        expect(xml.getChild('IconId')?.text).toBe('amt_shuffle');
        expect(xml.getChild('ReleaseCommand')?.getChild('Name')?.text).toBe('ToggleShuffle');
        expect(xml.getChild('ReleaseCommand')?.getChild('Type')?.text).toBe('PROTOCOL');
    });
    test('should parse transport from XML', () => {
        const xmlData = {
            Id: 'SkipFwd',
            ButtonType: 'SKIP_FWD',
            ReleaseCommand: {
                Name: 'SKIP_FWD',
                Type: 'PROTOCOL'
            }
        };
        const transport = C4InterfaceTransport_1.C4InterfaceTransport.fromXml(xmlData);
        expect(transport.id).toBe('SkipFwd');
        expect(transport.buttonType).toBe('SKIP_FWD');
        expect(transport.releaseCommand.name).toBe('SKIP_FWD');
        expect(transport.releaseCommand.type).toBe('PROTOCOL');
    });
    test('should generate proper dashboard XML in C4UI', () => {
        const ui = new C4UI_1.C4UI();
        ui.proxybindingid = 5001;
        const playTransport = new C4InterfaceTransport_1.C4InterfaceTransport();
        playTransport.id = 'Play';
        playTransport.buttonType = 'PLAY';
        const playCommand = new C4InterfaceCommand_1.C4InterfaceCommand();
        playCommand.name = 'PLAY';
        playCommand.type = 'ROOM';
        playTransport.releaseCommand = playCommand;
        const pauseTransport = new C4InterfaceTransport_1.C4InterfaceTransport();
        pauseTransport.id = 'Pause';
        pauseTransport.buttonType = 'PAUSE';
        const pauseCommand = new C4InterfaceCommand_1.C4InterfaceCommand();
        pauseCommand.name = 'PAUSE';
        pauseCommand.type = 'ROOM';
        pauseTransport.releaseCommand = pauseCommand;
        ui.dashboard = [playTransport, pauseTransport];
        const xml = ui.toXml();
        const dashboard = xml.getChild('Dashboard');
        expect(dashboard).toBeDefined();
        expect(dashboard?.getChildren('Transport')).toHaveLength(2);
        const firstTransport = dashboard?.getChildren('Transport')[0];
        expect(firstTransport?.getChild('Id')?.text).toBe('Play');
        expect(firstTransport?.getChild('ButtonType')?.text).toBe('PLAY');
        const secondTransport = dashboard?.getChildren('Transport')[1];
        expect(secondTransport?.getChild('Id')?.text).toBe('Pause');
        expect(secondTransport?.getChild('ButtonType')?.text).toBe('PAUSE');
    });
});
//# sourceMappingURL=dashboard.test.js.map