'use strict';

import * as vscode from 'vscode';
import { isUndefined } from 'util';


export function activate(context: vscode.ExtensionContext) {


    let disposableBold = vscode.commands.registerCommand('extension.makeBold', () => {
        formatText("__");
        //vscode.window.showInformationMessage('BOLD');
    });

    let disposableItalic = vscode.commands.registerCommand('extension.makeItalic', () => {
        formatText("*");
        //vscode.window.showInformationMessage('Italic');
    });

    let disposableCode = vscode.commands.registerCommand('extension.makeCode', () => {
        formatText("`");
        //vscode.window.showInformationMessage('Code');
    });

    let disposableTable = vscode.commands.registerCommand('extension.createTable', async () => {
        createMarkdownTable();
        
    });

    let disposableDoc = vscode.commands.registerCommand('extension.formatDoc', () => {
        vscode.commands.executeCommand('editor.action.formatDocument');
    });

    let disposableMore = vscode.commands.registerCommand('extension.showMore', () => {
        
        vscode.window.showInformationMessage('Show more options');
    });

    context.subscriptions.push(disposableBold, disposableItalic, disposableCode, disposableTable, disposableDoc, disposableMore);
}

export async function createMarkdownTable(){
    let options: vscode.InputBoxOptions = {
        prompt: "Please insert size of table: \"Rows,Columns\" ",
        placeHolder: "[Rows],[Columns]  \"3,3\""
    };

    let items: vscode.QuickPickItem[] = [];
    items.push({ label: 'left', description: 'Align Left' });
    items.push({ label: 'center', description: 'Align Center' });
    items.push({ label: 'right', description: 'Align Right' });


    var value = await vscode.window.showInputBox(options);
    if(isUndefined(value)){
        return;
    }
    
    var align = await vscode.window.showQuickPick(items);

    if (isUndefined(align)) {
        return;
    } else {
        var { valid, rows, columns } = parseInput(value);

        if (valid) {
            if (insertTextIntoDocument(generateString(rows, columns, align.label))) {
                vscode.window.showInformationMessage('New markdown table was created...');
            }
        }
    }
}

export function formatText(replacementChar: string) {
    var editor = vscode.window.activeTextEditor;

    if (!editor) {
        vscode.window.showInformationMessage('Open a file first to manipulate text selections');
        return;
    } else {
        var selection = editor.selection;
        if (!selection.isEmpty) {
            var text = editor.document.getText(editor.selection);
            var newText = replacementChar + text + replacementChar;
            editor.edit(builder => {

                builder.replace(selection, newText);
            });
        } else {
            vscode.window.showInformationMessage('No Selection');
        }

    }


}

export function parseInput(value: string) {
    var user_input;
    var columns: number, rows: number;
    var valid: boolean;

    var regexp = new RegExp('[0-9]+(,[0-9]+)');
    if (regexp.test(value)) {
        valid = true;
        user_input = value.split(',');
        rows = +user_input[0];
        columns = +user_input[1];
        return { valid, rows, columns };
    }
    else {
        vscode.window.showInformationMessage('Wrong input format, please use \"Rows,Columns\"');
        valid = false;
        rows = 0;
        columns = 0;
        return { valid, rows, columns };
    }

}

function insertTextIntoDocument(text: string): boolean {
    let editor = vscode.window.activeTextEditor;

    if (editor !== undefined) {
        let insertPosition: vscode.Position = editor.selection.active;
        editor.edit(edit => {
            edit.insert(insertPosition, text);
        });
        return true;
    } else {
        vscode.window.showInformationMessage('Please open a file before generating the table');
        return false;
    }
}

export function generateString(rows: number, columns: number, alignment: string): string {

    let base_header = "       |";
    var base_seperator;

    switch (alignment) {
        case "center": {
            base_seperator = " :---: |";
            break;
        }
        case "right": {
            base_seperator = "  ---: |";
            break;
        }
        default: {
            base_seperator = "  ---  |";
            break;
        }
    }

    var string_header = "|" + base_header.repeat(columns);
    var string_seperator = "|" + base_seperator.repeat(columns);
    var string_base = (string_header + '\n').repeat(rows);

    return string_header + '\n' + string_seperator + '\n' + string_base + '\n';
}

export function deactivate() {
}