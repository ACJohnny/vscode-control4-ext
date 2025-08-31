"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const C4InterfaceFavoriteCommand_1 = require("../src/control4/interface/C4InterfaceFavoriteCommand");
const C4UI_1 = require("../src/control4/C4UI");

describe('Favorite Commands Implementation', () => {
    test('should create a favorite command with proper XML structure', () => {
        const favoriteCommand = new C4InterfaceFavoriteCommand_1.C4InterfaceFavoriteCommand();
        favoriteCommand.name = 'jumpToFavorite';
        
        const xml = favoriteCommand.toXml();
        expect(xml.getChild('Name')?.text).toBe('jumpToFavorite');
        expect(xml.getChild('Type')?.text).toBe('PROTOCOL');
        
        const params = xml.getChild('Params');
        expect(params).toBeDefined();
        const param = params?.getChild('Param');
        expect(param?.getChild('Name')?.text).toBe('id');
        expect(param?.getChild('Type')?.text).toBe('FIRST_SELECTED');
        expect(param?.getChild('Value')?.text).toBe('favoriteId');
    });

    test('should generate proper favorite command XML in C4UI', () => {
        const ui = new C4UI_1.C4UI();
        ui.proxybindingid = 5001;
        
        const favoriteCommand = new C4InterfaceFavoriteCommand_1.C4InterfaceFavoriteCommand();
        favoriteCommand.name = 'jumpToFavorite';
        
        ui.favoriteCommand = favoriteCommand;
        
        const xml = ui.toXml();
        const favoriteCommandNode = xml.getChild('FavoriteCommand');
        expect(favoriteCommandNode).toBeDefined();
        expect(favoriteCommandNode?.getChild('Name')?.text).toBe('jumpToFavorite');
        expect(favoriteCommandNode?.getChild('Type')?.text).toBe('PROTOCOL');
        
        const params = favoriteCommandNode?.getChild('Params');
        expect(params).toBeDefined();
        const param = params?.getChild('Param');
        expect(param?.getChild('Name')?.text).toBe('id');
        expect(param?.getChild('Type')?.text).toBe('FIRST_SELECTED');
        expect(param?.getChild('Value')?.text).toBe('favoriteId');
    });
});
