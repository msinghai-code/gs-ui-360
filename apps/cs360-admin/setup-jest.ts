import 'jest-preset-angular';

declare var global: any;
import 'jest-preset-angular';
import * as $ from 'jquery';
global.$ = global.jQuery = $;

interface Window {
    GS: any
}