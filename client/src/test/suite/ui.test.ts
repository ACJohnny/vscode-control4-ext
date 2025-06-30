import { DOMParserImpl as dom } from 'xmldom-ts'
import { Driver } from '../../control4/driver';
import { HasNode, HasNodeValue } from '../utils';
import * as path from 'path';
import * as fs from 'fs';

suite('UI Test Suite', () => {
    test('Generates XML with UI section from package.json capabilities', async () => {
        // Load the test package
        const pkgPath = path.join(__dirname, '../fixtures/fixture1/package.json');
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        
        console.log('Test: Loading package with UI capabilities');
        console.log('Package capabilities:', pkg.control4.capabilities);
        
        // Create driver from package
        const driver = await Driver.From(pkg);
        
        console.log('Test: Driver created successfully');
        console.log('Driver UI array length:', driver.UI.length);
        console.log('Driver capabilities:', driver.capabilities);
        
        // Build the XML
        console.log('Test: Building XML...');
        const xml = driver.build();
        
        console.log('Test: XML built successfully');
        console.log('XML length:', xml.length);
        
        // Parse the XML
        const doc = new dom().parseFromString(xml);
        
        // Check if UI section exists in capabilities
        const capabilities = doc.getElementsByTagName('capabilities')[0];
        if (capabilities) {
            const uiElements = capabilities.getElementsByTagName('UI');
            console.log(`Test: Found ${uiElements.length} UI elements in capabilities`);
            
            if (uiElements.length > 0) {
                console.log('✅ UI section found in XML capabilities!');
                
                // Check for specific UI elements
                const ui = uiElements[0];
                const deviceIcon = ui.getElementsByTagName('DeviceIcon')[0];
                const brandingIcon = ui.getElementsByTagName('BrandingIcon')[0];
                const icons = ui.getElementsByTagName('Icons')[0];
                const screens = ui.getElementsByTagName('Screens')[0];
                const tabs = ui.getElementsByTagName('Tabs')[0];
                const actions = ui.getElementsByTagName('Actions')[0];
                
                console.log('DeviceIcon found:', !!deviceIcon);
                console.log('BrandingIcon found:', !!brandingIcon);
                console.log('Icons section found:', !!icons);
                console.log('Screens section found:', !!screens);
                console.log('Tabs section found:', !!tabs);
                console.log('Actions section found:', !!actions);
                
                // Assert that UI elements are present
                HasNode(doc, "capabilities/UI");
                HasNode(doc, "capabilities/UI/DeviceIcon");
                HasNode(doc, "capabilities/UI/BrandingIcon");
                HasNode(doc, "capabilities/UI/Icons");
                HasNode(doc, "capabilities/UI/Screens");
                HasNode(doc, "capabilities/UI/Tabs");
                HasNode(doc, "capabilities/UI/Actions");
                
            } else {
                console.log('❌ No UI elements found in capabilities');
                throw new Error('UI section not found in XML capabilities');
            }
        } else {
            console.log('❌ No capabilities section found');
            throw new Error('Capabilities section not found in XML');
        }
    });
}); 